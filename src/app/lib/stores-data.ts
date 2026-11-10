import { Store } from '../types';

// Demo stores with pool equipment across Croatia
export const DEMO_STORES: Store[] = [
  // Zagreb
  {
    id: 'store-1',
    name: 'Ivero Centar Zagreb',
    address: 'Ulica kneza Mislava 10',
    city: 'Zagreb',
    location: { lat: 45.8150, lng: 15.9819 },
    phone: '+385 1 234 5678',
    email: 'zagreb@ivero.hr',
    workingHours: 'Pon-Pet: 08:00-20:00, Sub: 09:00-15:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.8,
  },
  {
    id: 'store-2',
    name: 'Bazen Oprema Zagreb',
    address: 'Savska cesta 56',
    city: 'Zagreb',
    location: { lat: 45.7982, lng: 15.9547 },
    phone: '+385 1 345 6789',
    email: 'info@bazen-oprema.hr',
    workingHours: 'Pon-Pet: 09:00-18:00, Sub: 09:00-14:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.5,
  },
  {
    id: 'store-3',
    name: 'Pool Expert Zagreb Zapad',
    address: 'Ilica 242',
    city: 'Zagreb',
    location: { lat: 45.8092, lng: 15.9114 },
    phone: '+385 1 456 7890',
    email: 'zapad@poolexpert.hr',
    workingHours: 'Pon-Pet: 08:00-19:00, Sub: 09:00-13:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.6,
  },
  
  // Split
  {
    id: 'store-4',
    name: 'Ivero Split',
    address: 'Poljička cesta 35',
    city: 'Split',
    location: { lat: 43.5147, lng: 16.4435 },
    phone: '+385 21 234 567',
    email: 'split@ivero.hr',
    workingHours: 'Pon-Pet: 08:00-20:00, Sub: 09:00-15:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.9,
  },
  {
    id: 'store-5',
    name: 'Bazen Tehnika Split',
    address: 'Put Supavla 1',
    city: 'Split',
    location: { lat: 43.5081, lng: 16.4402 },
    phone: '+385 21 345 678',
    email: 'info@bazen-tehnika.hr',
    workingHours: 'Pon-Pet: 09:00-18:00, Sub: 09:00-13:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.4,
  },
  
  // Rijeka
  {
    id: 'store-6',
    name: 'Ivero Rijeka',
    address: 'Fiumara 5',
    city: 'Rijeka',
    location: { lat: 45.3271, lng: 14.4422 },
    phone: '+385 51 234 567',
    email: 'rijeka@ivero.hr',
    workingHours: 'Pon-Pet: 08:00-19:00, Sub: 09:00-14:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.7,
  },
  {
    id: 'store-7',
    name: 'Aqua Pro Rijeka',
    address: 'Liburnijska 2a',
    city: 'Rijeka',
    location: { lat: 45.3371, lng: 14.4089 },
    phone: '+385 51 345 678',
    email: 'rijeka@aquapro.hr',
    workingHours: 'Pon-Pet: 09:00-18:00, Sub: 09:00-13:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.3,
  },
  
  // Osijek
  {
    id: 'store-8',
    name: 'Bazen Centar Osijek',
    address: 'Vukovarska 1',
    city: 'Osijek',
    location: { lat: 45.5550, lng: 18.6955 },
    phone: '+385 31 234 567',
    email: 'osijek@bazen-centar.hr',
    workingHours: 'Pon-Pet: 08:00-18:00, Sub: 09:00-13:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.5,
  },
  
  // Zadar
  {
    id: 'store-9',
    name: 'Pool Shop Zadar',
    address: 'Bože Peričića 4',
    city: 'Zadar',
    location: { lat: 44.1194, lng: 15.2314 },
    phone: '+385 23 234 567',
    email: 'zadar@poolshop.hr',
    workingHours: 'Pon-Pet: 09:00-19:00, Sub: 09:00-14:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.6,
  },
  
  // Pula
  {
    id: 'store-10',
    name: 'Ivero Istra',
    address: 'Flanatička 29',
    city: 'Pula',
    location: { lat: 44.8666, lng: 13.8496 },
    phone: '+385 52 234 567',
    email: 'pula@ivero.hr',
    workingHours: 'Pon-Pet: 08:00-19:00, Sub: 09:00-14:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.7,
  },
  
  // Dubrovnik
  {
    id: 'store-11',
    name: 'Aqua Dubrovnik',
    address: 'Vukovarska 16',
    city: 'Dubrovnik',
    location: { lat: 42.6507, lng: 18.0944 },
    phone: '+385 20 234 567',
    email: 'dubrovnik@aqua.hr',
    workingHours: 'Pon-Pet: 09:00-18:00, Sub: 09:00-13:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.4,
  },
  
  // Varaždin
  {
    id: 'store-12',
    name: 'Bazen Servis Varaždin',
    address: 'Hallerova aleja 5',
    city: 'Varaždin',
    location: { lat: 46.3059, lng: 16.3366 },
    phone: '+385 42 234 567',
    email: 'varazdin@bazen-servis.hr',
    workingHours: 'Pon-Pet: 08:00-17:00, Sub: 09:00-13:00',
    hasIveroProducts: true,
    verified: true,
    rating: 4.6,
  },
];

// Calculate distance between two GPS coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Find nearby stores
export function findNearbyStores(
  userLat: number,
  userLng: number,
  maxDistance: number = 50 // km
): Store[] {
  const stores = DEMO_STORES.map(store => ({
    ...store,
    distance: calculateDistance(userLat, userLng, store.location.lat, store.location.lng),
  }));
  
  return stores
    .filter(store => store.distance! <= maxDistance)
    .sort((a, b) => a.distance! - b.distance!);
}

// Initialize stores in localStorage if not present
export function initializeStores() {
  const stored = localStorage.getItem('poolapp_stores');
  if (!stored) {
    localStorage.setItem('poolapp_stores', JSON.stringify(DEMO_STORES));
  }
}
