import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { Colors } from '../theme';

type Status =
  | 'available'
  | 'checked-out'
  | 'maintenance'
  | 'damaged'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'active'
  | 'returned'
  | 'in-progress'
  | 'waiting-parts'
  | 'completed'
  | 'cannot-repair'
  | 'arrived'
  | string;

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: Colors.success + '20', text: Colors.successDark, label: 'Available' },
  'checked-out': { bg: Colors.warning + '20', text: Colors.warningDark, label: 'Checked Out' },
  maintenance: { bg: Colors.info + '20', text: Colors.infoDark, label: 'Maintenance' },
  damaged: { bg: Colors.error + '20', text: Colors.errorDark, label: 'Damaged' },
  pending: { bg: Colors.warning + '20', text: Colors.warningDark, label: 'Pending' },
  approved: { bg: Colors.success + '20', text: Colors.successDark, label: 'Approved' },
  rejected: { bg: Colors.error + '20', text: Colors.errorDark, label: 'Rejected' },
  cancelled: { bg: Colors.grey200, text: Colors.grey600, label: 'Cancelled' },
  active: { bg: Colors.primary + '20', text: Colors.primaryDark, label: 'Active' },
  returned: { bg: Colors.grey200, text: Colors.grey600, label: 'Returned' },
  'in-progress': { bg: Colors.primary + '20', text: Colors.primaryDark, label: 'In Progress' },
  'waiting-parts': { bg: Colors.warning + '20', text: Colors.warningDark, label: 'Waiting Parts' },
  completed: { bg: Colors.success + '20', text: Colors.successDark, label: 'Completed' },
  'cannot-repair': { bg: Colors.error + '20', text: Colors.errorDark, label: 'Cannot Repair' },
  arrived: { bg: Colors.success + '20', text: Colors.successDark, label: 'Arrived' },
};

interface Props {
  status: Status;
  compact?: boolean;
}

export function StatusChip({ status, compact }: Props) {
  const config = STATUS_MAP[status] ?? {
    bg: Colors.grey200,
    text: Colors.grey600,
    label: status,
  };

  return (
    <Chip
      compact={compact}
      style={[styles.chip, { backgroundColor: config.bg }]}
      textStyle={{ color: config.text, fontSize: 11, fontWeight: '600' }}
    >
      {config.label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 6,
  },
});
