import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const resend = new Resend(Deno.env.get('resend'));
const MONDO_ACQUA_EMAIL = "info@mondo-acqua.hr";

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "X-Client-Info"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Idempotently create bucket for image storage
const BUCKET_NAME = "make-381f82bd-images";
const initBucket = async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: false });
  }
};

// Start bucket init (don't block server start)
initBucket().catch(err => console.error("Bucket init error:", err));

// Middleware for auth
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader?.split(' ')[1];
  
  if (!accessToken) {
    console.log('Auth failed: Missing token in header');
    return c.json({ error: 'Missing authorization header' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Check if token is valid
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log(`Auth failed for token starting with ${accessToken.substring(0, 10)}...: ${error?.message || 'No user found'}`);
    return c.json({ 
      error: 'Unauthorized', 
      details: error?.message || 'No user session found for this token',
      code: error?.status || 401
    }, 401);
  }

  c.set('user', user);
  await next();
};

const BASE_PATH = "/make-server-381f82bd";
const FUNCTIONS_PATH = "/functions/v1/make-server-381f82bd";

// Helper to register routes on both paths to ensure compatibility with Supabase Edge Functions
const registerRoute = (app: Hono, method: 'get' | 'post' | 'delete' | 'put', path: string, ...handlers: any[]) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Register on all possible variations to ensure compatibility
  (app as any)[method](cleanPath, ...handlers);
  (app as any)[method](`${BASE_PATH}${cleanPath}`, ...handlers);
  (app as any)[method](`${FUNCTIONS_PATH}${cleanPath}`, ...handlers);
};

// Health check endpoint
registerRoute(app, 'get', '/health', (c: any) => {
  return c.json({ status: "ok" });
});

// Image Upload Endpoint
registerRoute(app, 'post', '/images/upload', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const formData = await c.req.formData();
  const file = formData.get('file');
  const path = formData.get('path') || `user-${user.id}/${Date.now()}-${(file as File).name}`;

  if (!file) return c.json({ error: 'No file uploaded' }, 400);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path.toString(), file, { upsert: true });

  if (error) return c.json({ error: error.message }, 500);

  // Generate signed URL
  const { data: signedUrlData, error: signedError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path.toString(), 60 * 60 * 24 * 7); // 7 days

  if (signedError) return c.json({ error: signedError.message }, 500);

  return c.json({ 
    success: true, 
    path: data.path, 
    url: signedUrlData.signedUrl 
  });
});

// Get Signed URL for existing image
registerRoute(app, 'get', '/images/url', authMiddleware, async (c: any) => {
  const path = c.req.query('path');
  if (!path) return c.json({ error: 'Path is required' }, 400);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ url: data.signedUrl });
});

// Notification Endpoints
registerRoute(app, 'post', '/notifications/send', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const notification = await c.req.json();
  const targetUserId = notification.userId; // The employee receiving the notification

  if (!targetUserId) return c.json({ error: 'Target userId is required' }, 400);

  const notificationId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  const key = `u:${targetUserId}:notifications:${notificationId}`;
  const data = {
    id: notificationId,
    timestamp,
    fromUserId: user.id,
    fromUserName: user.user_metadata?.name || 'Admin',
    ...notification,
    read: false
  };

  try {
    await kv.set(key, data);
    return c.json({ success: true, notification: data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Generic CRUD factory
const createCrudRoutes = (resourceName: string) => {
  // Get all items for company
  registerRoute(app, 'get', `/${resourceName}`, authMiddleware, async (c: any) => {
    const user = c.get('user');

    if (resourceName === 'notifications') {
      const prefix = `u:${user.id}:notifications:`;
      try {
        const items = await kv.getByPrefix(prefix);
        return c.json(items);
      } catch (err: any) {
        return c.json({ error: err.message }, 500);
      }
    }

    const companyId = user.user_metadata?.companyId || user.id;
    const prefix = `c:${companyId}:${resourceName}:`;
    try {
      const items = await kv.getByPrefix(prefix);
      return c.json(items);
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

  // Save/Update item
  registerRoute(app, 'post', `/${resourceName}`, authMiddleware, async (c: any) => {
    const user = c.get('user');
    const item = await c.req.json();
    if (!item.id) return c.json({ error: 'Item must have an id' }, 400);

    let key;
    if (resourceName === 'notifications') {
      key = `u:${user.id}:notifications:${item.id}`;
    } else {
      const companyId = user.user_metadata?.companyId || user.id;
      key = `c:${companyId}:${resourceName}:${item.id}`;
    }

    try {
      await kv.set(key, item);
      return c.json({ success: true, item });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });

  // Delete item
  registerRoute(app, 'delete', `/${resourceName}/:id`, authMiddleware, async (c: any) => {
    const user = c.get('user');
    const id = c.req.param('id');
    
    let key;
    if (resourceName === 'notifications') {
      key = `u:${user.id}:notifications:${id}`;
    } else {
      const companyId = user.user_metadata?.companyId || user.id;
      key = `c:${companyId}:${resourceName}:${id}`;
    }

    try {
      await kv.del(key);
      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  });
};

// Create routes for our resources
const resources = [
  'pools', 
  'analyses', 
  'clients', 
  'work-orders', 
  'employees', 
  'warehouse', 
  'warehouse-transactions',
  'notifications', 
  // 'messages' handled separately below to align with admin view prefix
  'orders'
];

resources.forEach(createCrudRoutes);

// Messages routes (Custom prefix 'm:' to match Admin view)
const MESSAGE_PREFIX = 'm:';

registerRoute(app, 'get', '/messages', authMiddleware, async (c: any) => {
  try {
    const user = c.get('user');
    const companyId = user.user_metadata?.companyId || user.id;
    // Admin view uses 'm:', so we store as m:{companyId}:{messageId}
    const prefix = `${MESSAGE_PREFIX}${companyId}:`;
    
    const messages = await kv.getByPrefix(prefix);
    return c.json(messages || []);
  } catch (err: any) {
    console.error('Error fetching messages:', err);
    // Return empty array instead of 500 to prevent frontend polling errors
    return c.json([], 200);
  }
});

registerRoute(app, 'post', '/messages', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const message = await c.req.json();
  const companyId = user.user_metadata?.companyId || user.id;
  
  if (!message.id) return c.json({ error: 'Message must have ID' }, 400);
  
  // Store with m: prefix so Admin can see it via getByPrefix('m:')
  const key = `${MESSAGE_PREFIX}${companyId}:${message.id}`;
  
  try {
    await kv.set(key, message);
    return c.json({ success: true, message });
  } catch (err: any) {
    console.error('Error saving message:', err);
    return c.json({ error: err.message }, 500);
  }
});

registerRoute(app, 'delete', '/messages/:id', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const companyId = user.user_metadata?.companyId || user.id;
  const key = `${MESSAGE_PREFIX}${companyId}:${id}`;

  try {
    await kv.del(key);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Order creation with real email notification via Resend
registerRoute(app, 'post', '/orders/submit', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const { items, totalWithVat, note } = await c.req.json();
  
  const orderId = crypto.randomUUID();
  const finalTotalWithVat = Number(totalWithVat);
  const totalBase = finalTotalWithVat / 1.25;
  const vatAmount = finalTotalWithVat - totalBase;

  const order = {
    id: orderId,
    userId: user.id,
    userName: user.user_metadata?.name || user.email,
    userEmail: user.email,
    items,
    totalEUR: totalBase,
    vatAmount,
    totalWithVat: finalTotalWithVat,
    note,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const companyId = user.user_metadata?.companyId || user.id;
  await kv.set(`admin:orders:${orderId}`, order); 
  await kv.set(`c:${companyId}:orders:${orderId}`, order); 

  try {
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} (${item.size})</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} €</td>
      </tr>
    `).join('');

    await resend.emails.send({
      from: 'AquaSmart Pro <orders@resend.dev>',
      to: [MONDO_ACQUA_EMAIL],
      subject: `NOVA NARUDŽBA: ${order.userName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #D4AF37; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #030213; color: #D4AF37; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">AquaSmart Pro</h1>
            <p style="margin: 5px 0 0;">Nova narudžba proizvoda</p>
          </div>
          <div style="padding: 20px;">
            <h3>Podaci o kupcu:</h3>
            <p><strong>Ime i prezime:</strong> ${order.userName}</p>
            <p><strong>Email:</strong> ${order.userEmail}</p>
            <p><strong>Tvrtka:</strong> ${user.user_metadata?.companyName || 'Nije navedeno'}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f8f8f8;">
                  <th style="padding: 8px; text-align: left;">Proizvod</th>
                  <th style="padding: 8px; text-align: center;">Kol.</th>
                  <th style="padding: 8px; text-align: right;">Cijena</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 20px; text-align: right; border-top: 2px solid #D4AF37; padding-top: 10px;">
              <p>Osnovica: <strong>${order.totalEUR.toFixed(2)} €</strong></p>
              <p>PDV (25%): <strong>${order.vatAmount.toFixed(2)} €</strong></p>
              <p style="font-size: 20px; color: #D4AF37;">UKUPNO: <strong>${order.totalWithVat.toFixed(2)} €</strong></p>
            </div>
          </div>
        </div>
      `
    });
  } catch (err) {
    console.error('Email failed:', err);
  }
  
  return c.json({ success: true, orderId });
});

// Admin Routes
registerRoute(app, 'get', '/admin/all-orders', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const isAdmin = user.email === MONDO_ACQUA_EMAIL || 
                  user.email === 'admin@mondo-acqua.hr' || 
                  user.email === 'profesionalac@aquasmart.hr';
    
  if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);
  const orders = await kv.getByPrefix('admin:orders:');
  return c.json(orders);
});

registerRoute(app, 'get', '/admin/all-messages', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const isAdmin = user.email === MONDO_ACQUA_EMAIL || 
                  user.email === 'admin@mondo-acqua.hr' || 
                  user.email === 'profesionalac@aquasmart.hr';

  if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);
  const messages = await kv.getByPrefix('m:');
  return c.json(messages);
});

// Custom route for sync (fetch all at once for company)
registerRoute(app, 'get', '/sync', authMiddleware, async (c: any) => {
  const user = c.get('user');
  const companyId = user.user_metadata?.companyId || user.id;
  
  try {
    const resources = [
      'pools', 
      'analyses', 
      'clients', 
      'work-orders', 
      'warehouse', 
      'warehouse-transactions',
      'employees', 
      'orders'
    ];
    const results: Record<string, any[]> = {};
    
    for (const res of resources) {
      const prefix = `c:${companyId}:${res}:`;
      results[res] = await kv.getByPrefix(prefix);
    }
    
    return c.json(results);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Auth signup route
const signupHandler = async (c: any) => {
  try {
    const { email, password, name, role, companyName, parentCompanyId } = await c.req.json();
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: role || 'professional', companyId: parentCompanyId || null, companyName: companyName || null },
      email_confirm: true
    });
    
    if (error) return c.json({ error: error.message }, 400);

    const newUser = data.user;
    if (!parentCompanyId && newUser) {
      await supabase.auth.admin.updateUserById(newUser.id, {
        user_metadata: { ...newUser.user_metadata, companyId: newUser.id }
      });
    }

    return c.json({ success: true, user: data.user });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
};

app.post('/signup', signupHandler);
app.post(`${BASE_PATH}/signup`, signupHandler);
app.post(`${FUNCTIONS_PATH}/signup`, signupHandler);

// Finalize and start server
app.all('*', (c) => {
  console.log(`404 Not Found: ${c.req.method} ${c.req.path}`);
  return c.json({ 
    error: 'Not Found', 
    method: c.req.method,
    path: c.req.path,
    message: 'Tražena ruta ne postoji na serveru.' 
  }, 404);
});

Deno.serve(app.fetch);