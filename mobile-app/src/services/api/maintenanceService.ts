import apiClient from './client';
import { MaintenanceRequest, PartsRequest, ComponentInventory } from '../../types';

export const maintenanceService = {
  async getRequests(): Promise<MaintenanceRequest[]> {
    const res = await apiClient.get<MaintenanceRequest[]>('/maintenance-requests');
    return res.data;
  },

  async getStats(): Promise<Record<string, any>> {
    const res = await apiClient.get('/maintenance-requests/stats');
    return res.data;
  },

  async getHistory(): Promise<MaintenanceRequest[]> {
    const res = await apiClient.get<MaintenanceRequest[]>('/maintenance-history');
    return res.data;
  },

  async createRequest(data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const res = await apiClient.post<MaintenanceRequest>('/maintenance-requests', data);
    return res.data;
  },

  async updateStatus(id: string, status: MaintenanceRequest['status'], notes?: string): Promise<MaintenanceRequest> {
    const res = await apiClient.put<MaintenanceRequest>(`/maintenance-requests/${id}/status`, {
      status,
      notes,
    });
    return res.data;
  },

  async claimRequest(id: string): Promise<MaintenanceRequest> {
    const res = await apiClient.put<MaintenanceRequest>(`/maintenance-requests/${id}/claim`);
    return res.data;
  },
};

export const partsService = {
  async getRequests(): Promise<PartsRequest[]> {
    const res = await apiClient.get<PartsRequest[]>('/parts-requests');
    return res.data;
  },

  async createPartsRequest(data: Partial<PartsRequest>): Promise<PartsRequest> {
    const res = await apiClient.post<PartsRequest>('/parts-requests', data);
    return res.data;
  },

  async approveRequest(id: string): Promise<PartsRequest> {
    const res = await apiClient.put<PartsRequest>(`/parts-requests/${id}/approve`);
    return res.data;
  },

  async rejectRequest(id: string, reason?: string): Promise<PartsRequest> {
    const res = await apiClient.put<PartsRequest>(`/parts-requests/${id}/reject`, { reason });
    return res.data;
  },

  async markArrived(id: string): Promise<PartsRequest> {
    const res = await apiClient.put<PartsRequest>(`/parts-requests/${id}/arrived`);
    return res.data;
  },
};

export const componentInventoryService = {
  async getInventory(): Promise<ComponentInventory[]> {
    const res = await apiClient.get<ComponentInventory[]>('/component-inventory');
    return res.data;
  },

  async createItem(data: Partial<ComponentInventory>): Promise<ComponentInventory> {
    const res = await apiClient.post<ComponentInventory>('/component-inventory', data);
    return res.data;
  },
};
