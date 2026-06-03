import apiClient from './client';
import { StorageCabinet, StorageDrawer, StorageItem } from '../../types';

export const storageService = {
  // Cabinets
  async getCabinets(): Promise<StorageCabinet[]> {
    const res = await apiClient.get<any[]>('/storage/cabinets');
    return res.data.map((c: any) => ({
      ...c,
      drawersCount: c.actualDrawerCount ?? c.drawersCount ?? 0,
      itemsCount: c.actualItemCount ?? c.itemsCount ?? 0,
    }));
  },

  async getCabinetById(id: string): Promise<StorageCabinet> {
    const res = await apiClient.get<StorageCabinet>(`/storage/cabinets/${id}`);
    return res.data;
  },

  async getCabinetStats(): Promise<Record<string, any>> {
    const res = await apiClient.get('/storage/cabinets/stats');
    return res.data;
  },

  async createCabinet(data: Partial<StorageCabinet>): Promise<StorageCabinet> {
    const res = await apiClient.post<StorageCabinet>('/storage/cabinets', data);
    return res.data;
  },

  async updateCabinet(id: string, data: Partial<StorageCabinet>): Promise<StorageCabinet> {
    const res = await apiClient.put<StorageCabinet>(`/storage/cabinets/${id}`, data);
    return res.data;
  },

  async deleteCabinet(id: string): Promise<void> {
    await apiClient.delete(`/storage/cabinets/${id}`);
  },

  // Drawers
  async getDrawersByCabinet(cabinetId: string): Promise<StorageDrawer[]> {
    const res = await apiClient.get<any[]>(`/storage/drawers/cabinet/${cabinetId}`);
    return res.data.map((d: any) => ({
      ...d,
      itemsCount: d.itemCount ?? d.itemsCount ?? 0,
    }));
  },

  async createDrawer(data: Partial<StorageDrawer>): Promise<StorageDrawer> {
    const res = await apiClient.post<StorageDrawer>('/storage/drawers', data);
    return res.data;
  },

  async updateDrawer(id: string, data: Partial<StorageDrawer>): Promise<StorageDrawer> {
    const res = await apiClient.put<StorageDrawer>(`/storage/drawers/${id}`, data);
    return res.data;
  },

  async deleteDrawer(id: string): Promise<void> {
    await apiClient.delete(`/storage/drawers/${id}`);
  },

  async reorderDrawers(
    cabinetId: string,
    positions: { drawer_id: string; position: number }[],
  ): Promise<void> {
    await apiClient.patch('/storage/drawers/batch-reorder', {
      cabinet_id: cabinetId,
      drawer_positions: positions,
    });
  },

  async moveItemToDrawer(itemId: string, drawerId: string): Promise<void> {
    await apiClient.put(`/storage/items/${itemId}`, { drawer_id: drawerId });
  },

  // Items
  async getItemsByDrawer(drawerId: string): Promise<StorageItem[]> {
    const res = await apiClient.get<any>(`/storage/items/drawer/${drawerId}`);
    const items: any[] = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
    return items.map((i: any) => ({
      ...i,
      minQuantity: i.minimumStock ?? i.minQuantity ?? i.minimum_stock,
    }));
  },

  async getLowStockItems(): Promise<StorageItem[]> {
    const res = await apiClient.get<StorageItem[]>('/storage/items/low-stock');
    return res.data;
  },

  async getItemStats(): Promise<Record<string, any>> {
    const res = await apiClient.get('/storage/items/stats');
    return res.data;
  },

  async createItem(data: Partial<StorageItem>): Promise<StorageItem> {
    const res = await apiClient.post<StorageItem>('/storage/items', data);
    return res.data;
  },

  async updateItem(id: string, data: Partial<StorageItem>): Promise<StorageItem> {
    const res = await apiClient.put<StorageItem>(`/storage/items/${id}`, data);
    return res.data;
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`/storage/items/${id}`);
  },

  async batchMoveItems(
    itemIds: string[],
    targetDrawerId: string,
  ): Promise<{ message: string; count: number }> {
    const res = await apiClient.patch('/storage/items/batch-move', {
      item_ids: itemIds,
      target_drawer_id: targetDrawerId,
    });
    return res.data;
  },

  async linkItemToEquipment(itemId: string, equipmentId: string): Promise<StorageItem> {
    const res = await apiClient.post<StorageItem>(`/storage/items/${itemId}/link-equipment`, {
      equipment_id: equipmentId,
    });
    return res.data;
  },
};
