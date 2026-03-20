import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import WidgetsIcon from '@mui/icons-material/Widgets';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { approvalService } from '../services/approvalService';
import { partsService } from '../services/partsService';
import { checkoutStore, CheckedOutItem } from '../services/checkoutStore';
import { ApprovalRequest, PartsRequest, User } from '../types';

const AdminDashboardPage: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [pendingPartsRequests, setPendingPartsRequests] = useState<PartsRequest[]>([]);
  const [approvedPartsRequests, setApprovedPartsRequests] = useState<PartsRequest[]>([]);
  const [liveCheckouts, setLiveCheckouts] = useState<CheckedOutItem[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [partsReviewDialogOpen, setPartsReviewDialogOpen] = useState(false);
  const [selectedPartsRequest, setSelectedPartsRequest] = useState<PartsRequest | null>(null);

  const mockAdmin: User = {
    id: '1',
    name: 'Ahmed (Admin)',
    email: 'admin@novation.com',
    role: 'admin',
    createdAt: '2024-01-01',
  };

  useEffect(() => {
    const pending = approvalService.getApprovals({ status: 'pending' });
    setPendingApprovals(pending);
    setLiveCheckouts(checkoutStore.getItems());
    setPendingPartsRequests(partsService.getPartsRequests({ status: 'pending' }));
    setApprovedPartsRequests(partsService.getPartsRequests({ status: 'approved' }));
  }, []);

  const reloadParts = () => {
    setPendingPartsRequests(partsService.getPartsRequests({ status: 'pending' }));
    setApprovedPartsRequests(partsService.getPartsRequests({ status: 'approved' }));
  };

  const handleApprovePart = (requestId: string) => {
    partsService.approveParts(requestId, mockAdmin);
    reloadParts();
  };

  const handleRejectPart = (requestId: string) => {
    partsService.rejectParts(requestId);
    reloadParts();
  };

  const handleReviewPart = (req: PartsRequest) => {
    setSelectedPartsRequest(req);
    setPartsReviewDialogOpen(true);
  };

  const handlePartsDialogApprove = () => {
    if (!selectedPartsRequest) return;
    partsService.approveParts(selectedPartsRequest.id, mockAdmin);
    reloadParts();
    setPartsReviewDialogOpen(false);
  };

  const handlePartsDialogReject = () => {
    if (!selectedPartsRequest) return;
    partsService.rejectParts(selectedPartsRequest.id);
    reloadParts();
    setPartsReviewDialogOpen(false);
  };

  const handleCancelPart = (requestId: string) => {
    partsService.cancelParts(requestId);
    reloadParts();
  };

  const handleMarkArrived = (requestId: string) => {
    partsService.markPartsArrived(requestId);
    reloadParts();
  };

  const handleReviewApproval = (approval: ApprovalRequest) => {
    setSelectedApproval(approval);
    setReviewDialogOpen(true);
  };

  const handleOpenActionDialog = (action: 'approve' | 'reject') => {
    setActionType(action);
    setRejectReason('');
    setReviewDialogOpen(false);
    setActionDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedApproval) return;

    if (actionType === 'approve') {
      approvalService.approveRequest(selectedApproval.id, mockAdmin);
    } else if (actionType === 'reject') {
      if (!rejectReason.trim()) {
        alert('Please provide a rejection reason');
        return;
      }
      approvalService.rejectRequest(selectedApproval.id, mockAdmin, rejectReason);
    }

    // Reload data
    const pending = approvalService.getApprovals({ status: 'pending' });
    setPendingApprovals(pending);
    setLiveCheckouts(checkoutStore.getItems());

    setActionDialogOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <DashboardIcon sx={{ fontSize: 32, color: '#1a73e8' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ backgroundColor: '#fff3e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Pending Approvals
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', mt: 0.5 }}>
                  {pendingApprovals.length}
                </Typography>
              </Box>
              <Box sx={{ width: 40, height: 40, backgroundColor: '#f59e0b', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PendingActionsIcon sx={{ color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#f0f4ff' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Parts Awaiting Approval
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a73e8', mt: 0.5 }}>
                  {pendingPartsRequests.length}
                </Typography>
              </Box>
              <Box sx={{ width: 40, height: 40, backgroundColor: '#1a73e8', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WidgetsIcon sx={{ color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Parts Awaiting Arrival
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mt: 0.5 }}>
                  {approvedPartsRequests.length}
                </Typography>
              </Box>
              <Box sx={{ width: 40, height: 40, backgroundColor: '#10b981', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LocalShippingIcon sx={{ color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ backgroundColor: '#f3e5f5' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                  Live Checkouts
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#7c3aed', mt: 0.5 }}>
                  {liveCheckouts.length}
                </Typography>
              </Box>
              <Box sx={{ width: 40, height: 40, backgroundColor: '#7c3aed', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AssignmentReturnIcon sx={{ color: 'white' }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Pending Approvals Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PendingActionsIcon sx={{ color: '#1a73e8' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Pending Approvals ({pendingApprovals.length})
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Requester</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.map((approval) => (
                    <TableRow key={approval.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <TableCell>
                        <Chip label={getTypeLabel(approval.type)} size="small" variant="outlined" sx={{ color: '#374151', borderColor: '#d1d5db' }} />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                            {approval.requester.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {approval.requester.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#374151' }}>{approval.description.substring(0, 40)}...</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
                          size="small"
                          sx={{ backgroundColor: getPriorityColor(approval.priority), color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>{approval.requestedDate}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          onClick={() => handleReviewApproval(approval)}
                          sx={{
                            backgroundColor: '#1a73e8',
                            '&:hover': { backgroundColor: '#1557b0' },
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        No pending approvals
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Parts Requests */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <WidgetsIcon sx={{ color: '#1a73e8' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Parts Requests from Technicians
            </Typography>
          </Box>

          {/* Pending Parts — Awaiting Approval */}
          {pendingPartsRequests.length > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Chip
                  label={`Awaiting Approval · ${pendingPartsRequests.length}`}
                  sx={{ backgroundColor: '#fff3e0', color: '#6b7280', fontWeight: 600, border: '1px solid #fde68a' }}
                />
              </Box>
              <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2, mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Part Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Technician</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Requested</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingPartsRequests.map((req) => (
                      <TableRow key={req.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>{req.partName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`×${req.quantity}`}
                            size="small"
                            sx={{ backgroundColor: '#f0f4ff', color: '#1a73e8', fontWeight: 600, border: '1px solid #c7d7fd' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#374151' }}>{req.technicianName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {req.reason.length > 50 ? req.reason.substring(0, 50) + '…' : req.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {new Date(req.requestedDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            onClick={() => handleReviewPart(req)}
                            sx={{
                              backgroundColor: '#1a73e8',
                              '&:hover': { backgroundColor: '#1557b0' },
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Approved Parts — Awaiting Arrival */}
          {approvedPartsRequests.length > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Chip
                  label={`Approved · Awaiting Arrival · ${approvedPartsRequests.length}`}
                  sx={{ backgroundColor: '#e8f5e9', color: '#6b7280', fontWeight: 600, border: '1px solid #bbf7d0' }}
                />
              </Box>
              <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Part Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Technician</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Requested</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {approvedPartsRequests.map((req) => (
                      <TableRow key={req.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>{req.partName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`×${req.quantity}`}
                            size="small"
                            sx={{ backgroundColor: '#f0f4ff', color: '#1a73e8', fontWeight: 600, border: '1px solid #c7d7fd' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#374151' }}>{req.technicianName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {new Date(req.requestedDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              startIcon={<LocalShippingIcon />}
                              onClick={() => handleMarkArrived(req.id)}
                              sx={{
                                backgroundColor: '#1a73e8',
                                '&:hover': { backgroundColor: '#1557b0' },
                                textTransform: 'none',
                                fontWeight: 600,
                              }}
                            >
                              Mark Arrived
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleCancelPart(req.id)}
                              sx={{
                                color: '#6b7280',
                                borderColor: '#d1d5db',
                                '&:hover': { backgroundColor: '#f9fafb', borderColor: '#9ca3af' },
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: 12,
                              }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {pendingPartsRequests.length === 0 && approvedPartsRequests.length === 0 && (
            <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center', py: 3 }}>
              No pending parts requests
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Live Checkouts */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AssignmentReturnIcon sx={{ color: '#1a73e8' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Live Checkouts ({liveCheckouts.length})
            </Typography>
          </Box>
          <TableContainer component={Paper} sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>By</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Checked Out</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {liveCheckouts.length > 0 ? (
                  liveCheckouts.map((item) => (
                    <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.checkedOutBy}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.qty}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>{item.checkedOut}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`Due: ${item.dueLabel}`}
                          size="small"
                          sx={{
                            backgroundColor:
                              item.dueLabel === 'Today' ? '#ffebee' :
                              item.dueLabel === 'Tomorrow' ? '#fff3e0' : '#f0f4ff',
                            color:
                              item.dueLabel === 'Today' ? '#c62828' :
                              item.dueLabel === 'Tomorrow' ? '#e65100' : '#1a73e8',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        No equipment currently checked out
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Parts Request Review Dialog */}
      <Dialog open={partsReviewDialogOpen} onClose={() => setPartsReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Parts Request Details</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedPartsRequest && (
            <>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  PART NAME
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {selectedPartsRequest.partName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  QUANTITY
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={`×${selectedPartsRequest.quantity}`}
                    size="small"
                    sx={{ backgroundColor: '#f0f4ff', color: '#1a73e8', fontWeight: 600, border: '1px solid #c7d7fd' }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  TECHNICIAN
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {selectedPartsRequest.technicianName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  REASON
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedPartsRequest.reason}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  DATE REQUESTED
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {new Date(selectedPartsRequest.requestedDate).toLocaleDateString()}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartsReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePartsDialogApprove}
            variant="contained"
            sx={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#16a34a' }, color: 'white' }}
          >
            Approve
          </Button>
          <Button onClick={handlePartsDialogReject} variant="contained" color="error" sx={{ color: 'white' }}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Details Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approval Request Details</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedApproval && (
            <>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  REQUEST TYPE
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {getTypeLabel(selectedApproval.type)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  REQUESTER
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {selectedApproval.requester.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5 }}>
                  {selectedApproval.requester.email}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  DESCRIPTION
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedApproval.description}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  PRIORITY
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedApproval.priority.charAt(0).toUpperCase() + selectedApproval.priority.slice(1)}
                    size="small"
                    sx={{ backgroundColor: getPriorityColor(selectedApproval.priority), color: 'white' }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  DATE REQUESTED
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedApproval.requestedDate}
                </Typography>
              </Box>

              <Box sx={{ borderTop: '1px solid #e5e7eb', pt: 2 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  STATUS
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedApproval.status.charAt(0).toUpperCase() + selectedApproval.status.slice(1)}
                    size="small"
                    sx={{ backgroundColor: getStatusColor(selectedApproval.status) + '20', color: getStatusColor(selectedApproval.status) }}
                  />
                </Box>
              </Box>

              {selectedApproval.rejectionReason && (
                <Box sx={{ backgroundColor: '#fee2e2', p: 2, borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#7f1d1d', fontWeight: 600 }}>
                    REJECTION REASON
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7f1d1d', mt: 0.5 }}>
                    {selectedApproval.rejectionReason}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Close</Button>
          {selectedApproval?.status === 'pending' && (
            <>
              <Button color="success" onClick={() => handleOpenActionDialog('approve')} variant="contained" sx={{ mr: 1, color: 'white' }}>
                Approve
              </Button>
              <Button color="error" onClick={() => handleOpenActionDialog('reject')} variant="contained" sx={{ color: 'white' }}>
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{actionType === 'approve' ? 'Approve Request' : 'Reject Request'}</DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedApproval && (
            <>
              <Box sx={{ p: 2, backgroundColor: '#f3f4f6', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  REQUEST DETAILS
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Type:</strong> {getTypeLabel(selectedApproval.type)}
                </Typography>
                <Typography variant="body2">
                  <strong>Requester:</strong> {selectedApproval.requester.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Description:</strong> {selectedApproval.description}
                </Typography>
              </Box>
              {actionType === 'reject' && (
                <TextField
                  label="Rejection Reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Explain why this request is being rejected..."
                />
              )}
              {actionType === 'approve' && (
                <TextField
                  label="Approval Notes (Optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add any approval notes..."
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" color={actionType === 'approve' ? 'success' : 'error'} sx={{ color: 'white' }}>
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboardPage;
