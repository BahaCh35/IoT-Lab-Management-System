import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, runOnJS,
} from 'react-native-reanimated';
import { storageService } from '../../services/api/storageService';
import { LoadingView } from '../../components/LoadingView';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { Colors, Spacing, Shadow } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const { width: SCREEN_W } = Dimensions.get('window');
const GHOST_W = SCREEN_W - Spacing.lg * 2 - 32;

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  microcontroller: { bg: '#DBEAFE', text: '#1D4ED8' },
  component:       { bg: '#EDE9FE', text: '#6D28D9' },
  sensor:          { bg: '#D1FAE5', text: '#065F46' },
  tool:            { bg: '#FEF3C7', text: '#92400E' },
  cable:           { bg: '#FCE7F3', text: '#9D174D' },
  module:          { bg: '#E0F2FE', text: '#0369A1' },
};
const DEFAULT_CAT = { bg: '#F3F4F6', text: '#374151' };
const catColor = (cat: string) => CATEGORY_COLORS[cat?.toLowerCase()] ?? DEFAULT_CAT;

type ItemData = {
  id: string; name: string; category: string; quantity: number; isLowStock?: boolean;
};
type DrawerData = {
  id: string; name: string; position: number; itemCount?: number; items: ItemData[];
};
type CabinetData = {
  id: string; name: string; location?: string; locationFull?: string; drawers: DrawerData[];
};
type DragItem = {
  id: string; name: string; category: string; quantity: number; sourceDrawerId: string;
};

export function StorageOverviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [cabinets, setCabinets]     = useState<CabinetData[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState('');

  const [draggingItem, setDraggingItem]         = useState<DragItem | null>(null);
  const [hoveredDrawerId, setHoveredDrawerId]   = useState<string | null>(null);
  const draggingItemRef    = useRef<DragItem | null>(null);
  const hoveredDrawerIdRef = useRef<string | null>(null);
  const dragEndedRef       = useRef(false);

  const rootRef            = useRef<View>(null);
  const rootPageY          = useSharedValue(0);
  const drawerSectionRefs  = useRef<Record<string, View | null>>({});
  const drawerMeasurements = useRef<Record<string, { top: number; bottom: number }>>({});

  const ghostX       = useSharedValue(16);
  const ghostY       = useSharedValue(0);
  const ghostOpacity = useSharedValue(0);
  const ghostScale   = useSharedValue(1);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await storageService.getCabinets();
      const sorted = (data as any[]).map((c) => ({
        ...c,
        drawers: [...(c.drawers ?? [])].sort(
          (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
        ),
      })) as CabinetData[];
      setCabinets(sorted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remeasureAll = useCallback(() => {
    rootRef.current?.measureInWindow((_x, y) => { rootPageY.value = y; });
    Object.entries(drawerSectionRefs.current).forEach(([dId, ref]) => {
      ref?.measureInWindow((_x, y, _w, h) => {
        drawerMeasurements.current[dId] = { top: y, bottom: y + h };
      });
    });
  }, [rootPageY]);

  const startDrag = useCallback(
    (item: ItemData, drawerId: string, absX: number, absY: number) => {
      dragEndedRef.current = false;
      const di: DragItem = {
        id: item.id, name: item.name, category: item.category,
        quantity: item.quantity, sourceDrawerId: drawerId,
      };
      draggingItemRef.current = di;
      setDraggingItem(di);
      remeasureAll();
      ghostX.value = Math.max(16, absX - GHOST_W / 2);
      ghostY.value = absY - rootPageY.value - 22;
      ghostOpacity.value = withSpring(1, { damping: 18, stiffness: 280 });
      ghostScale.value   = withSpring(1.05, { damping: 18, stiffness: 280 });
    },
    [remeasureAll, ghostX, ghostY, ghostOpacity, ghostScale, rootPageY],
  );

  const updateHover = useCallback((absY: number) => {
    const entry = Object.entries(drawerMeasurements.current).find(
      ([, { top, bottom }]) => absY >= top && absY <= bottom,
    );
    const newId = entry ? entry[0] : null;
    if (hoveredDrawerIdRef.current !== newId) {
      hoveredDrawerIdRef.current = newId;
      setHoveredDrawerId(newId);
    }
  }, []);

  const finaliseDrag = useCallback(async () => {
    if (dragEndedRef.current) return;
    dragEndedRef.current = true;

    const item           = draggingItemRef.current;
    const targetDrawerId = hoveredDrawerIdRef.current;

    ghostOpacity.value = withSpring(0, { damping: 20, stiffness: 400 });
    ghostScale.value   = withSpring(1, { damping: 20, stiffness: 400 });

    draggingItemRef.current    = null;
    hoveredDrawerIdRef.current = null;
    setDraggingItem(null);
    setHoveredDrawerId(null);

    if (!item || !targetDrawerId || targetDrawerId === item.sourceDrawerId) return;

    setCabinets((prev) => {
      const itemObj: ItemData = {
        id: item.id, name: item.name,
        category: item.category, quantity: item.quantity,
      };
      return prev.map((cab) => ({
        ...cab,
        drawers: cab.drawers.map((drw) => {
          if (drw.id === item.sourceDrawerId) {
            return { ...drw, items: drw.items.filter((i) => i.id !== item.id) };
          }
          if (drw.id === targetDrawerId) {
            return { ...drw, items: [...drw.items, itemObj] };
          }
          return drw;
        }),
      }));
    });

    try {
      await storageService.moveItemToDrawer(item.id, targetDrawerId);
    } catch {
      load();
    }
  }, [ghostOpacity, ghostScale, load]);

  const ghostAnimStyle = useAnimatedStyle(() => ({
    opacity:   ghostOpacity.value,
    transform: [{ scale: ghostScale.value }],
    left: ghostX.value,
    top:  ghostY.value,
  }));

  const makeGesture = useCallback(
    (item: ItemData, drawerId: string) =>
      Gesture.Pan()
        .activateAfterLongPress(220)
        .onBegin((e) => {
          'worklet';
          runOnJS(startDrag)(item, drawerId, e.absoluteX, e.absoluteY);
        })
        .onUpdate((e) => {
          'worklet';
          ghostX.value = Math.max(16, e.absoluteX - GHOST_W / 2);
          ghostY.value = e.absoluteY - rootPageY.value - 22;
          runOnJS(updateHover)(e.absoluteY);
        })
        .onEnd(() => {
          'worklet';
          runOnJS(finaliseDrag)();
        })
        .onFinalize(() => {
          'worklet';
          runOnJS(finaliseDrag)();
        }),
    [startDrag, updateHover, finaliseDrag, ghostX, ghostY, rootPageY],
  );

  if (loading) return <LoadingView message="Loading storage..." />;
  if (error)   return <ErrorView message={error} onRetry={load} />;
  if (cabinets.length === 0) return <EmptyState icon="archive-off" title="No cabinets yet" />;

  const isDragging = !!draggingItem;

  return (
    <View
      ref={rootRef}
      style={styles.outer}
      onLayout={() =>
        rootRef.current?.measureInWindow((_x, y) => { rootPageY.value = y; })
      }
    >
      {isDragging && draggingItem && (
        <Animated.View style={[styles.ghost, ghostAnimStyle]} pointerEvents="none">
          <Text style={styles.ghostName}>{draggingItem.name}</Text>
          <View style={styles.ghostMeta}>
            <View style={[styles.badge, { backgroundColor: catColor(draggingItem.category).bg }]}>
              <Text style={[styles.badgeText, { color: catColor(draggingItem.category).text }]}>
                {draggingItem.category}
              </Text>
            </View>
            <Text style={styles.ghostQty}>Qty: {draggingItem.quantity}</Text>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scroll}
        scrollEnabled={!isDragging}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
      >
        {isDragging && (
          <Text style={styles.hintText}>
            Hold and drag over any drawer to move the item there
          </Text>
        )}

        {cabinets.map((cabinet) => (
          <View key={cabinet.id} style={[styles.cabinetCard, Shadow.sm]}>
            <View style={styles.cabinetHeader}>
              <Text style={styles.cabinetName}>{cabinet.name}</Text>
              <Text style={styles.cabinetLocation}>
                {cabinet.location || cabinet.locationFull}
              </Text>
            </View>

            {Array.isArray(cabinet.drawers) && cabinet.drawers.length > 0 ? (
              cabinet.drawers.map((drawer, idx) => {
                const isHovered = hoveredDrawerId === drawer.id;
                return (
                  <View
                    key={drawer.id}
                    ref={(r) => { drawerSectionRefs.current[drawer.id] = r; }}
                    onLayout={() => {
                      drawerSectionRefs.current[drawer.id]?.measureInWindow(
                        (_x, y, _w, h) => {
                          drawerMeasurements.current[drawer.id] = { top: y, bottom: y + h };
                        },
                      );
                    }}
                    style={[
                      styles.drawerSection,
                      idx > 0 && styles.drawerBorder,
                      isHovered && styles.drawerHovered,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.drawerHeader}
                      onPress={() =>
                        navigation.navigate('DrawerDetail', {
                          id: drawer.id, cabinetId: cabinet.id, name: drawer.name,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.drawerName}>{drawer.name}</Text>
                      <Text style={styles.drawerCount}>
                        {Array.isArray(drawer.items)
                          ? drawer.items.length
                          : (drawer.itemCount ?? 0)}{' '}
                        items
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={18}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>

                    {Array.isArray(drawer.items) && drawer.items.map((item) => {
                      const c              = catColor(item.category);
                      const isBeingDragged = draggingItem?.id === item.id;
                      return (
                        <GestureDetector
                          key={item.id}
                          gesture={makeGesture(item, drawer.id)}
                        >
                          <View
                            style={[
                              styles.itemRow,
                              isBeingDragged && styles.itemRowLifted,
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="drag-horizontal-variant"
                              size={16}
                              color={Colors.textSecondary}
                              style={{ marginRight: 6 }}
                            />
                            <View style={styles.itemInfo}>
                              <Text style={styles.itemName}>{item.name}</Text>
                              <View style={styles.itemMeta}>
                                <View style={[styles.badge, { backgroundColor: c.bg }]}>
                                  <Text style={[styles.badgeText, { color: c.text }]}>
                                    {item.category}
                                  </Text>
                                </View>
                                <Text style={styles.qty}>Qty: {item.quantity}</Text>
                              </View>
                            </View>
                            {item.isLowStock && (
                              <MaterialCommunityIcons
                                name="alert-circle-outline"
                                size={16}
                                color={Colors.warning ?? '#F59E0B'}
                              />
                            )}
                          </View>
                        </GestureDetector>
                      );
                    })}

                    {(!Array.isArray(drawer.items) || drawer.items.length === 0) && (
                      <Text style={styles.emptyText}>
                        {isHovered ? 'Drop here' : 'Empty drawer'}
                      </Text>
                    )}

                    {isHovered && (
                      <View style={styles.dropZoneBar}>
                        <MaterialCommunityIcons
                          name="tray-arrow-down"
                          size={14}
                          color="#3B82F6"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.dropZoneText}>Drop here</Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={[styles.emptyText, { padding: Spacing.lg }]}>No drawers</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: Colors.background },
  root:  { flex: 1 },
  scroll: { padding: Spacing.lg, gap: 14, paddingBottom: 40 },

  hintText: {
    textAlign: 'center', fontSize: 12, color: Colors.primary,
    marginBottom: 8, opacity: 0.8,
  },

  cabinetCard: { backgroundColor: Colors.surface, borderRadius: 14, overflow: 'hidden' },
  cabinetHeader: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border ?? '#E2E8F0',
  },
  cabinetName:     { fontSize: 16, fontWeight: '700', color: Colors.primary },
  cabinetLocation: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },

  drawerSection: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm,
  },
  drawerBorder:  { borderTopWidth: 1, borderTopColor: Colors.border ?? '#E2E8F0' },
  drawerHovered: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginHorizontal: 4,
    paddingHorizontal: 8,
  },

  drawerHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 6 },
  drawerName:   { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  drawerCount:  { fontSize: 11, color: Colors.textSecondary },

  dropZoneBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#93C5FD', marginTop: 2,
  },
  dropZoneText: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },

  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 8,
    padding: Spacing.sm, marginBottom: 4,
  },
  itemRowLifted: { opacity: 0.3 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  badge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  qty:       { fontSize: 12, color: Colors.textSecondary },
  emptyText: {
    fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', paddingBottom: Spacing.sm,
  },

  ghost: {
    position: 'absolute',
    width: GHOST_W,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    zIndex: 9999,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  ghostName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  ghostMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ghostQty:  { fontSize: 12, color: Colors.textSecondary },
});