import { ApprovalRequest, ActivityLog, User } from '../types';

// Auto-compute priority based on how long the request has been waiting:
//   0–1 days pending → 'low'
//   2–3 days pending → 'medium'
//   4+ days pending  → 'high'
function computePriority(requestedDate: string): 'high' | 'medium' | 'low' {
  const daysPending = Math.floor(
    (Date.now() - new Date(requestedDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysPending >= 4) return 'high';
  if (daysPending >= 2) return 'medium';
  return 'low';
}

// Mock approval data and activity log
let approvalRequests: ApprovalRequest[] = [
  {
    id: '1',
    type: 'equipment-purchase',
    status: 'pending',
    requester: { id: '101', name: 'Ahmed', email: 'engineer@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    description: 'Request to purchase Arduino Uno boards for IoT lab experiments',
    details: { quantity: 10, cost: 150, justification: 'For student projects' },
    requestedDate: '2024-02-20',
    priority: 'high',
  },
  {
    id: '2',
    type: 'product-modification',
    status: 'pending',
    requester: { id: '102', name: 'Asma', email: 'engineer1@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    description: 'Modify storage cabinet label system',
    details: { changes: 'Update hardware labels' },
    requestedDate: '2024-02-19',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'checkout-request',
    status: 'approved',
    requester: { id: '103', name: 'Ali', email: 'engineer2@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    description: 'Extended checkout for Raspberry Pi kit',
    details: { equipmentId: 'rpi-001', reason: 'Project extension' },
    requestedDate: '2024-02-18',
    reviewedBy: { id: '1', name: 'Ahmed (Admin)', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' },
    reviewedDate: '2024-02-18',
    priority: 'medium',
  },
  {
    id: '4',
    type: 'reservation-request',
    status: 'rejected',
    requester: { id: '104', name: 'Nada', email: 'engineer3@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    description: 'Reserve lab for 3-day experiment',
    details: { labId: 'lab-001', dates: '2024-02-25 to 2024-02-27' },
    requestedDate: '2024-02-17',
    reviewedBy: { id: '1', name: 'Ahmed (Admin)', email: 'admin@novation.com', role: 'admin', createdAt: '2024-01-01' },
    reviewedDate: '2024-02-17',
    rejectionReason: 'Lab already reserved for those dates',
    priority: 'high',
  },
  {
    id: '5',
    type: 'meeting-room-booking',
    status: 'pending',
    requester: { id: '105', name: 'Yomna', email: 'engineer4@novation.com', role: 'engineer', createdAt: '2024-01-01' },
    description: 'Book Conference Room A for team meeting',
    details: { roomId: 'room-a', time: '2024-02-22 10:00-12:00', attendees: 8 },
    requestedDate: '2024-02-20',
    priority: 'low',
  },
];

let activityLog: ActivityLog[] = [
  {
    id: '1',
    userId: 'admin-1',
    action: 'approved',
    entityType: 'approval',
    entityId: '3',
    details: { reason: 'Approved for legitimate project extension' },
    timestamp: '2024-02-18T14:30:00Z',
  },
  {
    id: '2',
    userId: 'admin-1',
    action: 'rejected',
    entityType: 'approval',
    entityId: '4',
    details: { reason: 'Lab already reserved for those dates' },
    timestamp: '2024-02-17T10:15:00Z',
  },
  {
    id: '3',
    userId: 'engineer-1',
    action: 'created',
    entityType: 'approval',
    entityId: '1',
    details: { type: 'equipment-purchase' },
    timestamp: '2024-02-20T09:00:00Z',
  },
];

export const approvalService = {
  // Get all approvals with optional filtering
  getApprovals(filters?: { status?: string; type?: string; priority?: string }) {
    // First apply live priority computation so filtering works on the real values
    let result = approvalRequests.map((r) => ({
      ...r,
      priority: r.status === 'pending' ? computePriority(r.requestedDate) : r.priority,
    }));

    if (filters?.status) {
      result = result.filter((r) => r.status === filters.status);
    }
    if (filters?.type) {
      result = result.filter((r) => r.type === filters.type);
    }
    if (filters?.priority) {
      result = result.filter((r) => r.priority === filters.priority);
    }

    return result.sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());
  },

  // Get pending approvals count
  getPendingCount() {
    return approvalRequests.filter((r) => r.status === 'pending').length;
  },

  // Get approval by ID
  getApprovalById(id: string) {
    return approvalRequests.find((r) => r.id === id);
  },

  // Approve a request
  approveRequest(id: string, adminUser: User, notes?: string) {
    const approval = approvalRequests.find((r) => r.id === id);
    if (approval) {
      approval.status = 'approved';
      approval.reviewedBy = adminUser;
      approval.reviewedDate = new Date().toISOString().split('T')[0];

      // Add to activity log
      activityLog.unshift({
        id: Date.now().toString(),
        userId: adminUser.id,
        action: 'approved',
        entityType: 'approval',
        entityId: id,
        details: { reason: notes || 'Approved' },
        timestamp: new Date().toISOString(),
      });
    }
    return approval;
  },

  // Reject a request
  rejectRequest(id: string, adminUser: User, reason: string) {
    const approval = approvalRequests.find((r) => r.id === id);
    if (approval) {
      approval.status = 'rejected';
      approval.reviewedBy = adminUser;
      approval.reviewedDate = new Date().toISOString().split('T')[0];
      approval.rejectionReason = reason;

      // Add to activity log
      activityLog.unshift({
        id: Date.now().toString(),
        userId: adminUser.id,
        action: 'rejected',
        entityType: 'approval',
        entityId: id,
        details: { reason },
        timestamp: new Date().toISOString(),
      });
    }
    return approval;
  },

  // Create a new approval request (priority auto-calculated from submission date)
  createApproval(data: Omit<ApprovalRequest, 'id' | 'priority' | 'status'>) {
    const today = new Date().toISOString().split('T')[0];
    const newApproval: ApprovalRequest = {
      ...data,
      id: `approval-${Date.now()}`,
      status: 'pending',
      priority: computePriority(data.requestedDate || today),
    };
    approvalRequests.unshift(newApproval);
    return newApproval;
  },

  // Get activity log
  getActivityLog(limit: number = 50) {
    return activityLog.slice(0, limit);
  },

  // Get stats
  getApprovalStats() {
    return {
      total: approvalRequests.length,
      pending: approvalRequests.filter((r) => r.status === 'pending').length,
      approved: approvalRequests.filter((r) => r.status === 'approved').length,
      rejected: approvalRequests.filter((r) => r.status === 'rejected').length,
      byType: {
        'equipment-purchase': approvalRequests.filter((r) => r.type === 'equipment-purchase').length,
        'product-modification': approvalRequests.filter((r) => r.type === 'product-modification').length,
        'checkout-request': approvalRequests.filter((r) => r.type === 'checkout-request').length,
        'reservation-request': approvalRequests.filter((r) => r.type === 'reservation-request').length,
        'meeting-room-booking': approvalRequests.filter((r) => r.type === 'meeting-room-booking').length,
        'lab-reservation': approvalRequests.filter((r) => r.type === 'lab-reservation').length,
        'storage-addition': approvalRequests.filter((r) => r.type === 'storage-addition').length,
        'damage-report': approvalRequests.filter((r) => r.type === 'damage-report').length,
      },
    };
  },
};
