import { MaintenanceRequest, User } from '../../types';
import apiClient from './client';

export const maintenanceService = {
  async getRequests(): Promise<MaintenanceRequest[]> {
    return apiClient.get<MaintenanceRequest[]>('/maintenance-requests');
  },

  async getRequestById(id: string): Promise<MaintenanceRequest> {
    return apiClient.get<MaintenanceRequest>(`/maintenance-requests/${id}`);
  },

  async getRequestsByStatus(status: MaintenanceRequest['status']): Promise<MaintenanceRequest[]> {
    const requests = await this.getRequests();
    return requests.filter(r => r.status === status);
  },

  async getRequestsByPriority(priority: MaintenanceRequest['priority']): Promise<MaintenanceRequest[]> {
    const requests = await this.getRequests();
    return requests.filter(r => r.priority === priority);
  },

  async createRequest(requestData: {
    equipmentId: string;
    equipmentName: string;
    problemDescription: string;
    reportedBy: User;
    priority: MaintenanceRequest['priority'];
    location: MaintenanceRequest['location'];
  }): Promise<MaintenanceRequest> {
    return apiClient.post<MaintenanceRequest>('/maintenance-requests', {
      equipment_id: requestData.equipmentId,
      equipment_name: requestData.equipmentName,
      problem_description: requestData.problemDescription,
      reported_by_id: requestData.reportedBy.id,
      priority: requestData.priority,
      building: requestData.location.building,
      room: requestData.location.room,
      cabinet: requestData.location.cabinet,
      drawer: requestData.location.drawer,
      shelf: requestData.location.shelf,
    });
  },

  async claimRequest(id: string, technician: User): Promise<MaintenanceRequest> {
    return apiClient.put<MaintenanceRequest>(`/maintenance-requests/${id}/claim`, {
      assigned_to_id: technician.id,
    });
  },

  async updateRequestStatus(id: string, status: MaintenanceRequest['status']): Promise<MaintenanceRequest> {
    return apiClient.put<MaintenanceRequest>(`/maintenance-requests/${id}/status`, { status });
  },

  async updateRequestNotes(id: string, notes: string, partsUsed?: string[], timeSpent?: number): Promise<MaintenanceRequest> {
    return apiClient.put<MaintenanceRequest>(`/maintenance-requests/${id}/notes`, {
      notes,
      parts_used: partsUsed,
      time_spent: timeSpent,
    });
  },

  async completeRequest(id: string, notes: string, partsUsed: string[], timeSpent: number): Promise<MaintenanceRequest> {
    return apiClient.put<MaintenanceRequest>(`/maintenance-requests/${id}/complete`, {
      notes,
      parts_used: partsUsed,
      time_spent: timeSpent,
    });
  },

  async getMaintenanceStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    waitingParts: number;
    completed: number;
    cannotRepair: number;
  }> {
    return apiClient.get('/maintenance-requests/stats');
  },

  async getMaintenanceHistory(): Promise<MaintenanceRequest[]> {
    return apiClient.get<MaintenanceRequest[]>('/maintenance-history');
  },
};

export default maintenanceService;
