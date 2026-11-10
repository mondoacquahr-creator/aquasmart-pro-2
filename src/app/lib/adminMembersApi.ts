import { api } from './supabase';

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  plan?: string;
  planActive?: boolean;
  planValidUntil?: string;
  pool?: any;
  analysesCount?: number;
  lastAnalysis?: string;
  equipmentCount?: number;
  needsAttention?: number;
  lastVisit?: string;
  createdAt?: string;
}

export interface AdminMemberDetail {
  profile: any;
  pool: any;
  analyses: any[];
  visits: any[];
  equipment: any[];
}

export interface VisitRequest {
  id: string;
  memberId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  preferred?: string;
  note?: string;
  status: 'new' | 'scheduled' | 'done' | 'cancelled';
  scheduledFor?: string;
  adminNote?: string;
  createdAt?: string;
}

export interface EquipmentReportItem {
  id?: string;
  type?: string;
  brand?: string;
  model?: string;
  year?: number;
  age?: number;
  condition?: 'ok' | 'watch' | 'replace';
  inspectedAt?: string;
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
  memberCity?: string;
  memberId?: string;
}

export const adminMembersApi = {
  async getAdminMembers(): Promise<AdminMember[]> {
    return api.invoke('admin/members');
  },

  async getAdminMember(id: string): Promise<AdminMemberDetail> {
    return api.invoke('admin/members/' + id);
  },

  async getVisitRequests(): Promise<VisitRequest[]> {
    return api.invoke('admin/visit-requests');
  },

  async updateVisitRequest(
    id: string,
    data: { status?: string; scheduledFor?: string; adminNote?: string }
  ): Promise<void> {
    return api.invoke('admin/visit-requests/' + id, { method: 'POST', body: data });
  },

  async saveMemberEquipment(
    memberId: string,
    data: {
      id?: string;
      type?: string;
      brand?: string;
      model?: string;
      year?: number;
      condition?: string;
      notes?: string;
      photos?: string[];
      inspectedAt?: string;
    }
  ): Promise<void> {
    return api.invoke('admin/members/' + memberId + '/equipment', { method: 'POST', body: data });
  },

  async deleteMemberEquipment(memberId: string, eqId: string): Promise<void> {
    return api.invoke('admin/members/' + memberId + '/equipment/' + eqId, { method: 'DELETE' });
  },

  async setMemberPlan(
    memberId: string,
    plan: 'care' | 'free',
    validUntil?: string
  ): Promise<void> {
    return api.invoke('admin/members/' + memberId + '/plan', {
      method: 'POST',
      body: { plan, validUntil },
    });
  },

  async getEquipmentReport(): Promise<EquipmentReportItem[]> {
    return api.invoke('admin/equipment-report');
  },
};
