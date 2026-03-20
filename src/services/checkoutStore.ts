export interface CheckedOutItem {
  id: string;
  equipmentId: string;
  name: string;
  qty: number;
  checkedOut: string;
  dueDate: string;
  dueLabel: string;
  checkedOutBy: string;
  status: 'active';
}

function formatDueLabel(dueDateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr + 'T00:00:00');
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr?: string): string {
  if (dateStr) return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Pre-seeded with demo items so the analytics page isn't empty on first load
let items: CheckedOutItem[] = [
  {
    id: 'mock-1',
    equipmentId: 'mock-osc',
    name: 'Oscilloscope',
    qty: 1,
    checkedOut: 'Mar 5, 2026',
    dueDate: '2026-03-20',
    dueLabel: 'Mar 20',
    checkedOutBy: 'Ali Hassan',
    status: 'active',
  },
  {
    id: 'mock-2',
    equipmentId: 'mock-ard',
    name: 'Arduino Uno',
    qty: 1,
    checkedOut: 'Mar 3, 2026',
    dueDate: '2026-03-22',
    dueLabel: 'Mar 22',
    checkedOutBy: 'Sara Khalid',
    status: 'active',
  },
];

export const checkoutStore = {
  getItems(): CheckedOutItem[] {
    return [...items];
  },

  addItem(equipmentId: string, name: string, qty: number, dueDate: string, checkedOutBy: string = 'My Profile'): CheckedOutItem {
    const item: CheckedOutItem = {
      id: Date.now().toString(),
      equipmentId,
      name,
      qty,
      checkedOut: formatDate(),
      dueDate,
      dueLabel: formatDueLabel(dueDate),
      checkedOutBy,
      status: 'active',
    };
    items.push(item);
    return item;
  },

  removeByEquipmentId(equipmentId: string): void {
    items = items.filter((i) => i.equipmentId !== equipmentId);
  },

  removeById(id: string): void {
    items = items.filter((i) => i.id !== id);
  },

  hasEquipment(equipmentId: string): boolean {
    return items.some((i) => i.equipmentId === equipmentId);
  },
};
