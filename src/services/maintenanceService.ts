import { MaintenanceRequest, User } from '../types';
import { maintenanceService as apiMaintenanceService } from './api/maintenanceService';

export const maintenanceService = {
  async getRequests(): Promise<MaintenanceRequest[]> {
    return apiMaintenanceService.getRequests();
  },

  async getRequestById(id: string): Promise<MaintenanceRequest | undefined> {
    try {
      return await apiMaintenanceService.getRequestById(id);
    } catch {
      return undefined;
    }
  },

  async getRequestsByStatus(status: MaintenanceRequest['status']): Promise<MaintenanceRequest[]> {
    return apiMaintenanceService.getRequestsByStatus(status);
  },

  async getRequestsByPriority(priority: MaintenanceRequest['priority']): Promise<MaintenanceRequest[]> {
    return apiMaintenanceService.getRequestsByPriority(priority);
  },

  async createRequest(requestData: {
    equipmentId: string;
    equipmentName: string;
    problemDescription: string;
    reportedBy: User;
    priority: MaintenanceRequest['priority'];
    location: MaintenanceRequest['location'];
  }): Promise<MaintenanceRequest> {
    return apiMaintenanceService.createRequest(requestData);
  },

  async claimRequest(id: string, technician: User): Promise<MaintenanceRequest | undefined> {
    try {
      return await apiMaintenanceService.claimRequest(id, technician);
    } catch {
      return undefined;
    }
  },

  async updateRequestStatus(
    id: string,
    status: MaintenanceRequest['status']
  ): Promise<MaintenanceRequest | undefined> {
    try {
      return await apiMaintenanceService.updateRequestStatus(id, status);
    } catch {
      return undefined;
    }
  },

  async updateRequestNotes(id: string, notes: string): Promise<MaintenanceRequest | undefined> {
    try {
      return await apiMaintenanceService.updateRequestNotes(id, notes);
    } catch {
      return undefined;
    }
  },

  async completeRequest(
    id: string,
    notes: string,
    partsUsed: string[],
    timeSpent: number
  ): Promise<MaintenanceRequest | undefined> {
    try {
      return await apiMaintenanceService.completeRequest(id, notes, partsUsed, timeSpent);
    } catch {
      return undefined;
    }
  },

  async getMaintenanceHistory(): Promise<MaintenanceRequest[]> {
    return apiMaintenanceService.getMaintenanceHistory();
  },

  async getMaintenanceStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cannotRepair: number;
  }> {
    return apiMaintenanceService.getMaintenanceStats();
  },
};
