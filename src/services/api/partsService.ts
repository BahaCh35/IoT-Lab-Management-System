import { PartsRequest } from '../../types';
import apiClient from './client';

export interface ComponentInventory {
  partName: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  category: string;
  location: string;
  lastRestocked?: string;
}

export const partsService = {
  // Parts Requests
  async getPartsRequests(): Promise<PartsRequest[]> {
    return apiClient.get<PartsRequest[]>('/parts-requests');
  },

  async getPartsRequestById(id: string): Promise<PartsRequest> {
    return apiClient.get<PartsRequest>(`/parts-requests/${id}`);
  },

  async getPartsRequestsByTechnicianId(technicianId: string): Promise<PartsRequest[]> {
    const requests = await this.getPartsRequests();
    return requests.filter(r => r.technicianId === technicianId);
  },

  async getPartsRequestsByStatus(status: PartsRequest['status']): Promise<PartsRequest[]> {
    const requests = await this.getPartsRequests();
    return requests.filter(r => r.status === status);
  },

  async createPartsRequest(requestData: {
    technicianId: string;
    technicianName: string;
    partName: string;
    quantity: number;
    reason: string;
  }): Promise<PartsRequest> {
    return apiClient.post<PartsRequest>('/parts-requests', {
      technician_id: requestData.technicianId,
      technician_name: requestData.technicianName,
      part_name: requestData.partName,
      quantity: requestData.quantity,
      reason: requestData.reason,
    });
  },

  async approvePartsRequest(id: string): Promise<PartsRequest> {
    return apiClient.put<PartsRequest>(`/parts-requests/${id}/approve`);
  },

  async rejectPartsRequest(id: string, reason?: string): Promise<PartsRequest> {
    return apiClient.put<PartsRequest>(`/parts-requests/${id}/reject`, { reason });
  },

  async cancelPartsRequest(id: string): Promise<PartsRequest> {
    return apiClient.put<PartsRequest>(`/parts-requests/${id}/cancel`);
  },

  async markPartsArrived(id: string): Promise<PartsRequest> {
    return apiClient.put<PartsRequest>(`/parts-requests/${id}/arrived`);
  },

  // Component Inventory
  async getComponentInventory(): Promise<ComponentInventory[]> {
    return apiClient.get<ComponentInventory[]>('/component-inventory');
  },

  async updateComponentInventory(partName: string, quantity: number): Promise<ComponentInventory> {
    return apiClient.put<ComponentInventory>(`/component-inventory/${encodeURIComponent(partName)}`, { quantity });
  },

  async consumeComponent(partName: string, quantityUsed: number): Promise<ComponentInventory> {
    return apiClient.post<ComponentInventory>('/component-inventory/consume', {
      part_name: partName,
      quantity: quantityUsed,
    });
  },

  async getLowStockItems(): Promise<ComponentInventory[]> {
    return apiClient.get<ComponentInventory[]>('/parts/low-stock');
  },

  async getPartsStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    totalInventoryItems: number;
    lowStockItems: number;
  }> {
    return apiClient.get('/parts/stats');
  },
};

export default partsService;
