import { PartsRequest } from '../types';
import { partsService as apiPartsService, ComponentInventory } from './api/partsService';

export const partsService = {
  // Parts Requests
  async getPartsRequests(): Promise<PartsRequest[]> {
    return apiPartsService.getPartsRequests();
  },

  async getPartsRequestById(id: string): Promise<PartsRequest | undefined> {
    try {
      return await apiPartsService.getPartsRequestById(id);
    } catch {
      return undefined;
    }
  },

  async getPartsRequestsByTechnicianId(technicianId: string): Promise<PartsRequest[]> {
    return apiPartsService.getPartsRequestsByTechnicianId(technicianId);
  },

  async getPartsRequestsByStatus(status: PartsRequest['status']): Promise<PartsRequest[]> {
    return apiPartsService.getPartsRequestsByStatus(status);
  },

  async createPartsRequest(requestData: {
    technicianId: string;
    technicianName: string;
    partName: string;
    quantity: number;
    reason: string;
  }): Promise<PartsRequest> {
    return apiPartsService.createPartsRequest(requestData);
  },

  async approvePartsRequest(id: string): Promise<PartsRequest | undefined> {
    try {
      return await apiPartsService.approvePartsRequest(id);
    } catch {
      return undefined;
    }
  },

  async rejectPartsRequest(id: string, reason?: string): Promise<PartsRequest | undefined> {
    try {
      return await apiPartsService.rejectPartsRequest(id, reason);
    } catch {
      return undefined;
    }
  },

  async cancelPartsRequest(id: string): Promise<PartsRequest | undefined> {
    try {
      return await apiPartsService.cancelPartsRequest(id);
    } catch {
      return undefined;
    }
  },

  async markPartsArrived(id: string): Promise<PartsRequest | undefined> {
    try {
      return await apiPartsService.markPartsArrived(id);
    } catch {
      return undefined;
    }
  },

  // Component Inventory
  async getComponentInventory(): Promise<ComponentInventory[]> {
    return apiPartsService.getComponentInventory();
  },

  async updateComponentInventory(partName: string, quantity: number): Promise<ComponentInventory | undefined> {
    try {
      return await apiPartsService.updateComponentInventory(partName, quantity);
    } catch {
      return undefined;
    }
  },

  async consumeComponent(partName: string, quantityUsed: number): Promise<ComponentInventory | undefined> {
    try {
      return await apiPartsService.consumeComponent(partName, quantityUsed);
    } catch {
      return undefined;
    }
  },

  async getLowStockItems(): Promise<ComponentInventory[]> {
    return apiPartsService.getLowStockItems();
  },

  async getPartsStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    totalInventoryItems: number;
    lowStockItems: number;
  }> {
    return apiPartsService.getPartsStats();
  },
};

export type { ComponentInventory };
