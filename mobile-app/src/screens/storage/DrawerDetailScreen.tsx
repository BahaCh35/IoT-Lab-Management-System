import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { Text, FAB, Dialog, Button, Portal, TextInput as PaperInput } from 'react-native-paper';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storageService } from '../../services/api/storageService';
import { StorageItem } from '../../types';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { Colors, Spacing, Shadow } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ITEM_HEIGHT = 72;

type RouteProps = RouteProp<RootStackParamList, 'DrawerDetail'>;

export function DrawerDetailScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Drag state ──────────────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [ghostItem, setGhostItem] = useState<StorageItem | null>(null);
  const activeIndexRef = useRef<number | null>(null);
  const lastHoverRef = useRef<number | null>(null);
  const itemsRef = useRef<StorageItem[]>([]);
  const containerRef = useRef<View>(null);
  const containerPageY = useRef(0);

  const ghostY = useSharedValue(0);
  const ghostOpacity = useSharedValue(0);
  const ghostScale = useSharedValue(0.95);

  // ── Edit dialog ──────────────────────────────────────────────────────────────
  const [editItem, setEditItem] = useState<StorageItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', category: '', quantity: '', minQuantity: '', unit: '',
  });
  const [saving, setSaving] = useState(false);

  // ── Delete dialog ────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<StorageItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await storageService.getItemsByDrawer(params.id);
      setItems(data);
      itemsRef.current = data;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  // Keep itemsRef in sync
  useEffect(() => { itemsRef.current = items; }, [items]);

  // ── Drag helpers ──────────────────────────────────────────────────────────────
  const measureContainer = () => {
    containerRef.current?.measureInWindow((_x, y) => {
      containerPageY.current = y;
    });
  };

  const startDrag = (index: number, item: StorageItem) => {
    activeIndexRef.current = index;
    lastHoverRef.current = index;
    setActiveIndex(index);
    setGhostItem(item);
    ghostOpacity.value = withSpring(1, { damping: 20, stiffness: 300 });
    ghostScale.value = withSpring(1.04, { damping: 20, stiffness: 300 });
  };

  const moveDragTo = (newIndex: number) => {
    const from = activeIndexRef.current;
    if (from === null || from === newIndex) return;
    const clamped = Math.max(0, Math.min(itemsRef.current.length - 1, newIndex));
    LayoutAnimation.configureNext({
      duration: 180,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(clamped, 0, moved);
      itemsRef.current = next;
      return next;
    });
    activeIndexRef.current = clamped;
    lastHoverRef.current = clamped;
    setActiveIndex(clamped);
  };

  const endDrag = () => {
    ghostOpacity.value = withSpring(0, { damping: 20, stiffness: 400 });
    ghostScale.value = withSpring(0.95);
    activeIndexRef.current = null;
    lastHoverRef.current = null;
    setActiveIndex(null);
    setGhostItem(null);
  };

  const createDragGesture = (index: number, item: StorageItem) =>
    Gesture.Pan()
      .activateAfterLongPress(220)
      .onBegin((e) => {
        'worklet';
        runOnJS(measureContainer)();
        runOnJS(startDrag)(index, item);
        ghostY.value = e.absoluteY - containerPageY.current - ITEM_HEIGHT / 2;
      })
      .onUpdate((e) => {
        'worklet';
        ghostY.value = e.absoluteY - containerPageY.current - ITEM_HEIGHT / 2;
        const relY = e.absoluteY - containerPageY.current;
        const newHover = Math.round(relY / ITEM_HEIGHT);
        if (lastHoverRef.current !== newHover) {
          runOnJS(moveDragTo)(newHover);
        }
      })
      .onEnd(() => { 'worklet'; runOnJS(endDrag)(); })
      .onFinalize(() => { 'worklet'; runOnJS(endDrag)(); });

  const ghostStyle = useAnimatedStyle(() => ({
    opacity: ghostOpacity.value,
    top: ghostY.value,
    transform: [{ scale: ghostScale.value }],
  }));

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const openEdit = (item: StorageItem) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      minQuantity: item.minQuantity != null ? String(item.minQuantity) : '',
      unit: item.unit ?? '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    const qty = parseInt(editForm.quantity, 10);
    if (isNaN(qty) || qty < 0) { Alert.alert('Invalid', 'Quantity must be 0 or more.'); return; }
    const minQty = editForm.minQuantity ? parseInt(editForm.minQuantity, 10) : undefined;
    setSaving(true);
    try {
      const updated = await storageService.updateItem(editItem.id, {
        name: editForm.name.trim() || editItem.name,
        category: editForm.category.trim() || editItem.category,
        quantity: qty,
        minQuantity: minQty,
        unit: editForm.unit.trim() || undefined,
      });
      setItems((prev) => prev.map((i) => i.id === editItem.id ? { ...i, ...updated } : i));
      setEditItem(null);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await storageService.deleteItem(deleteTarget.id);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <View style={styles.root}>
      {/* ── Ghost overlay (follows finger during drag) ─────────────────────── */}
      {ghostItem && (
        <Animated.View style={[styles.ghost, ghostStyle]} pointerEvents="none">
          <View style={[styles.card, styles.cardGhost]}>
            <MaterialCommunityIcons name="drag-horizontal-variant" size={20} color={Colors.primary} />
            <View style={styles.itemIcon}>
              <MaterialCommunityIcons name="cube-outline" size={20} color={Colors.secondary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{ghostItem.name}</Text>
              <Text style={styles.itemCategory}>{ghostItem.category}</Text>
            </View>
            <Text style={styles.qty}>{ghostItem.quantity}</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.list}
        scrollEnabled={activeIndex === null}
      >
        <Text style={styles.hint}>Hold ≡ and drag to reorder</Text>
        <Text style={styles.count}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>

        <View ref={containerRef} onLayout={measureContainer}>
          {items.length === 0 ? (
            <EmptyState icon="cube-off" title="No items in this drawer" />
          ) : (
            items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  Shadow.sm,
                  activeIndex === index && styles.cardActive,
                ]}
              >
                {/* Drag handle — long press to initiate */}
                <GestureDetector gesture={createDragGesture(index, item)}>
                  <View style={styles.dragHandle}>
                    <MaterialCommunityIcons
                      name="drag-horizontal-variant"
                      size={22}
                      color={activeIndex === index ? Colors.primary : Colors.grey400}
                    />
                  </View>
                </GestureDetector>

                <View style={styles.itemIcon}>
                  <MaterialCommunityIcons name="cube-outline" size={20} color={Colors.secondary} />
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  {item.unit ? <Text style={styles.itemUnit}>{item.unit}</Text> : null}
                </View>

                <View style={styles.qtyWrap}>
                  <Text style={[styles.qty, item.isLowStock && { color: Colors.error }]}>
                    {item.quantity}
                  </Text>
                  {item.isLowStock && (
                    <View style={styles.lowStockBadge}>
                      <Text style={styles.lowStockText}>Low</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionsCol}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                    <MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDeleteTarget(item)} style={styles.actionBtn}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('StorageItemForm', { drawerId: params.id })}
        color={Colors.white}
      />

      <Portal>
        {/* ── Edit dialog ────────────────────────────────────────────────── */}
        <Dialog visible={!!editItem} onDismiss={() => setEditItem(null)}>
          <Dialog.Title>Edit Item</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.dialogContent}>
                <PaperInput
                  label="Name *"
                  value={editForm.name}
                  onChangeText={(v) => setEditForm((f) => ({ ...f, name: v }))}
                  mode="outlined"
                  dense
                  style={styles.input}
                />
                <PaperInput
                  label="Category *"
                  value={editForm.category}
                  onChangeText={(v) => setEditForm((f) => ({ ...f, category: v }))}
                  mode="outlined"
                  dense
                  style={styles.input}
                />
                <View style={styles.row}>
                  <PaperInput
                    label="Quantity"
                    value={editForm.quantity}
                    onChangeText={(v) => setEditForm((f) => ({ ...f, quantity: v }))}
                    keyboardType="numeric"
                    mode="outlined"
                    dense
                    style={[styles.input, { flex: 1 }]}
                  />
                  <PaperInput
                    label="Min Qty"
                    value={editForm.minQuantity}
                    onChangeText={(v) => setEditForm((f) => ({ ...f, minQuantity: v }))}
                    keyboardType="numeric"
                    mode="outlined"
                    dense
                    style={[styles.input, { flex: 1 }]}
                  />
                </View>
                <PaperInput
                  label="Unit (pcs, kg, m…)"
                  value={editForm.unit}
                  onChangeText={(v) => setEditForm((f) => ({ ...f, unit: v }))}
                  mode="outlined"
                  dense
                  style={styles.input}
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditItem(null)}>Cancel</Button>
            <Button onPress={handleSaveEdit} loading={saving} disabled={saving}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        {/* ── Delete confirmation ──────────────────────────────────────── */}
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Delete Item</Dialog.Title>
          <Dialog.Content>
            <Text>Delete "{deleteTarget?.name}"? This cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onPress={handleDelete} loading={deleting} disabled={deleting} textColor={Colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg, paddingBottom: 100 },
  hint: { fontSize: 11, color: Colors.textDisabled, marginBottom: 2, textAlign: 'center' },
  count: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },

  // Ghost overlay
  ghost: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1000,
    elevation: 12,
  },
  cardGhost: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 12,
  },

  // Item card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: ITEM_HEIGHT,
    marginBottom: 8,
  },
  cardActive: { opacity: 0.3 },

  dragHandle: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.secondary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  itemCategory: { fontSize: 11, color: Colors.textSecondary, textTransform: 'capitalize' },
  itemUnit: { fontSize: 11, color: Colors.textDisabled },

  qtyWrap: { alignItems: 'flex-end' },
  qty: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  minQty: { fontSize: 10, color: Colors.textDisabled },
  lowStockBadge: {
    backgroundColor: Colors.error + '20',
    borderRadius: 4,
    paddingHorizontal: 5,
    marginTop: 2,
  },
  lowStockText: { fontSize: 9, color: Colors.error, fontWeight: '700' },

  actionsCol: { flexDirection: 'column', gap: 2 },
  actionBtn: { padding: 5 },

  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    backgroundColor: Colors.secondary,
  },

  // Dialog
  dialogScroll: { maxHeight: 360, paddingHorizontal: 0 },
  dialogContent: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: 12 },
  input: { marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8 },
});
