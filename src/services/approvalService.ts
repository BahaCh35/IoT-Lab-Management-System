import { ApprovalRequest, ActivityLog, User } from '../types';
import { approvalService as apiApprovalService } from './api/approvalService';

type MeetingRoomBookingDetails = {
  room_id: string;
  roomName?: string;
  date: string;
  startTime: string;
  duration: string;
  purpose: string;
  attendees?: string;
};

type GenericApprovalDetails = Record<string, unknown>;

type CreateApprovalPayload = {
  type: Exclude<ApprovalRequest['type'], 'meeting-room-booking'>;
  requester: User;
  description: string;
  details: GenericApprovalDetails;
  priority: ApprovalRequest['priority'];
} | {
  type: 'meeting-room-booking';
  requester: User;
  description: string;
  details: MeetingRoomBookingDetails;
  priority: ApprovalRequest['priority'];
};

export const approvalService = {
  // Approval Requests
  async getApprovals(): Promise<ApprovalRequest[]> {
    return apiApprovalService.getApprovals();
  },

  async getApprovalById(id: string): Promise<ApprovalRequest | undefined> {
    try {
      return await apiApprovalService.getApprovalById(id);
    } catch {
      return undefined;
    }
  },

  async getApprovalsByStatus(status: ApprovalRequest['status']): Promise<ApprovalRequest[]> {
    return apiApprovalService.getApprovalsByStatus(status);
  },

  async getApprovalsByType(type: ApprovalRequest['type']): Promise<ApprovalRequest[]> {
    return apiApprovalService.getApprovalsByType(type);
  },

  async createApproval(approvalData: CreateApprovalPayload): Promise<ApprovalRequest> {
    return apiApprovalService.createApproval(approvalData);
  },

  async approveRequest(id: string): Promise<ApprovalRequest | undefined> {
    try {
      return await apiApprovalService.approveRequest(id);
    } catch {
      return undefined;
    }
  },

  async rejectRequest(id: string, reason: string): Promise<ApprovalRequest | undefined> {
    try {
      return await apiApprovalService.rejectRequest(id, reason);
    } catch {
      return undefined;
    }
  },

  async completeApproval(id: string): Promise<void> {
    try {
      await apiApprovalService.completeApproval(id);
    } catch {
      // ignore
    }
  },

  async getPendingCount(): Promise<number> {
    const response = await apiApprovalService.getPendingCount();
    return response;
  },

  async getApprovalStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    return apiApprovalService.getApprovalStats();
  },

  // Activity Log
  async getActivityLog(limit?: number): Promise<ActivityLog[]> {
    return apiApprovalService.getActivityLog(limit);
  },
};
