import apiClient from './client';
import { ApprovalRequest, ActivityLog } from '../../types';

export const approvalService = {
  async getApprovals(): Promise<ApprovalRequest[]> {
    const res = await apiClient.get<ApprovalRequest[]>('/approvals');
    return res.data;
  },

  async getApprovalById(id: string): Promise<ApprovalRequest> {
    const res = await apiClient.get<ApprovalRequest>(`/approvals/${id}`);
    return res.data;
  },

  async createApproval(data: Partial<ApprovalRequest>): Promise<ApprovalRequest> {
    const res = await apiClient.post<ApprovalRequest>('/approvals', data);
    return res.data;
  },

  async approveRequest(id: string, notes?: string): Promise<ApprovalRequest> {
    const res = await apiClient.put<ApprovalRequest>(`/approvals/${id}/approve`, { notes });
    return res.data;
  },

  async rejectRequest(id: string, reason: string): Promise<ApprovalRequest> {
    const res = await apiClient.put<ApprovalRequest>(`/approvals/${id}/reject`, {
      rejection_reason: reason,
    });
    return res.data;
  },

  async getApprovalStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const res = await apiClient.get('/approvals/stats');
    return res.data;
  },

  async getActivityLog(limit?: number): Promise<ActivityLog[]> {
    const url = limit ? `/activity-log?limit=${limit}` : '/activity-log';
    const res = await apiClient.get<ActivityLog[]>(url);
    return res.data;
  },
};
