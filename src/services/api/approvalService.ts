import { ApprovalRequest, ActivityLog, User } from '../../types';
import apiClient from './client';

export const approvalService = {
  // Approval Requests
  async getApprovals(): Promise<ApprovalRequest[]> {
    return apiClient.get<ApprovalRequest[]>('/approvals');
  },

  async getApprovalById(id: string): Promise<ApprovalRequest> {
    return apiClient.get<ApprovalRequest>(`/approvals/${id}`);
  },

  async getApprovalsByStatus(status: ApprovalRequest['status']): Promise<ApprovalRequest[]> {
    const approvals = await this.getApprovals();
    return approvals.filter(a => a.status === status);
  },

  async getApprovalsByType(type: ApprovalRequest['type']): Promise<ApprovalRequest[]> {
    const approvals = await this.getApprovals();
    return approvals.filter(a => a.type === type);
  },

  async createApproval(approvalData: {
    type: ApprovalRequest['type'];
    requester: User;
    description: string;
    details: Record<string, unknown>;
    priority: ApprovalRequest['priority'];
  }): Promise<ApprovalRequest> {
    return apiClient.post<ApprovalRequest>('/approvals', {
      type: approvalData.type,
      requester_id: approvalData.requester.id,
      description: approvalData.description,
      details: approvalData.details,
      priority: approvalData.priority,
    });
  },

  async approveRequest(id: string): Promise<ApprovalRequest> {
    return apiClient.put<ApprovalRequest>(`/approvals/${id}/approve`);
  },

  async rejectRequest(id: string, reason: string): Promise<ApprovalRequest> {
    return apiClient.put<ApprovalRequest>(`/approvals/${id}/reject`, { reason });
  },

  async getPendingCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/approvals/pending-count');
    return response.count;
  },

  async getApprovalStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: Record<string, number>;
  }> {
    return apiClient.get('/approvals/stats');
  },

  // Activity Log
  async getActivityLog(limit?: number): Promise<ActivityLog[]> {
    const endpoint = limit ? `/activity-log?limit=${limit}` : '/activity-log';
    return apiClient.get<ActivityLog[]>(endpoint);
  },

  async logActivity(activityData: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details: Record<string, unknown>;
  }): Promise<ActivityLog> {
    return apiClient.post<ActivityLog>('/activity-log', activityData);
  },
};

export default approvalService;
