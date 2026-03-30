import { apiClient } from './client';

export interface CabinetData {
  id: string;
  name: string;
  description?: string;
  location: string;
  building?: string;
  room?: string;
  drawerCount: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  locationFull?: string;
  actualDrawerCount?: number;
  actualItemCount?: number;
  drawers: DrawerData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DrawerData {
  id: string;
  cabinetId: string;
  name: string;
  description?: string;
  position: number;
  itemCount: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  isEmpty?: boolean;
  totalQuantity?: number;
  fullLocation?: string;
  items: StorageItemData[];
  cabinet?: {
    id: string;
    name: string;
    location: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface StorageItemData {
  id: string;
  drawerId: string;
  equipmentId?: string;
  name: string;
  description?: string;
  category: string;
  categoryDisplay?: string;
  quantity: number;
  unitPrice?: number;
  supplier?: string;
  partNumber?: string;
  addedDate: string;
  expiryDate?: string;
  minimumStock?: number;
  isConsumable: boolean;
  specifications?: Record<string, any>;
  imageUrl?: string;
  isLowStock: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  totalValue?: number;
  hasEquipment: boolean;
  fullLocation?: string;
  drawer?: {
    id: string;
    name: string;
    position: number;
    cabinetId: string;
    cabinet?: {
      id: string;
      name: string;
      location: string;
    };
  };
  equipment?: {
    id: string;
    name: string;
    qrCode: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface StorageStats {
  totalCabinets: number;
  activeCabinets: number;
  totalDrawers: number;
  totalItems: number;
  categoryCounts: Record<string, number>;
  lowStockItems: number;
  expiredItems: number;
  expiringSoonItems: number;
  totalValue: number;
}

export interface ItemMoveOperation {
  itemId: string;
  newDrawerId: string;
  quantity?: number;
}

export interface BatchMoveResponse {
  success: boolean;
  message: string;
  movedItems: StorageItemData[];
  count: number;
}

export const storageService = {
  // Cabinet operations
  async getCabinets(): Promise<CabinetData[]> {
    return apiClient.get<CabinetData[]>('/storage/cabinets');
  },

  async getCabinetById(id: string): Promise<CabinetData> {
    return apiClient.get<CabinetData>(`/storage/cabinets/${id}`);
  },

  async createCabinet(cabinetData: {
    name: string;
    description?: string;
    location: string;
    building?: string;
    room?: string;
    drawer_count?: number;
    is_active?: boolean;
    metadata?: Record<string, any>;
  }): Promise<CabinetData> {
    return apiClient.post<CabinetData>('/storage/cabinets', cabinetData);
  },

  async updateCabinet(id: string, cabinetData: {
    name?: string;
    description?: string;
    location?: string;
    building?: string;
    room?: string;
    drawer_count?: number;
    is_active?: boolean;
    metadata?: Record<string, any>;
  }): Promise<CabinetData> {
    return apiClient.put<CabinetData>(`/storage/cabinets/${id}`, cabinetData);
  },

  async deleteCabinet(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/storage/cabinets/${id}`);
  },

  async getCabinetStats(): Promise<StorageStats> {
    return apiClient.get<StorageStats>('/storage/cabinets/stats');
  },

  // Drawer operations
  async getDrawers(): Promise<DrawerData[]> {
    return apiClient.get<DrawerData[]>('/storage/drawers');
  },

  async getDrawerById(id: string): Promise<DrawerData> {
    return apiClient.get<DrawerData>(`/storage/drawers/${id}`);
  },

  async getDrawersByCabinet(cabinetId: string): Promise<DrawerData[]> {
    return apiClient.get<DrawerData[]>(`/storage/drawers/cabinet/${cabinetId}`);
  },

  async createDrawer(drawerData: {
    cabinet_id: string;
    name: string;
    description?: string;
    position: number;
    is_active?: boolean;
    metadata?: Record<string, any>;
  }): Promise<DrawerData> {
    return apiClient.post<DrawerData>('/storage/drawers', drawerData);
  },

  async updateDrawer(id: string, drawerData: {
    name?: string;
    description?: string;
    position?: number;
    is_active?: boolean;
    metadata?: Record<string, any>;
  }): Promise<DrawerData> {
    return apiClient.put<DrawerData>(`/storage/drawers/${id}`, drawerData);
  },

  async deleteDrawer(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/storage/drawers/${id}`);
  },

  async batchReorderDrawers(cabinetId: string, drawerPositions: Array<{
    drawer_id: string;
    position: number;
  }>): Promise<{
    success: boolean;
    message: string;
    drawers: DrawerData[];
    count: number;
  }> {
    return apiClient.patch('/storage/drawers/batch-reorder', {
      cabinet_id: cabinetId,
      drawer_positions: drawerPositions,
    });
  },

  // Item operations
  async getItems(filters?: {
    category?: string;
    drawer_id?: string;
    low_stock?: boolean;
    expired?: boolean;
    expiring_soon?: boolean;
    with_equipment?: boolean;
    without_equipment?: boolean;
  }): Promise<StorageItemData[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    return apiClient.get<StorageItemData[]>(`/storage/items${params.toString() ? `?${params.toString()}` : ''}`);
  },

  async getItemById(id: string): Promise<StorageItemData> {
    return apiClient.get<StorageItemData>(`/storage/items/${id}`);
  },

  async searchItems(query: string, category?: string): Promise<{
    query: string;
    results: StorageItemData[];
    count: number;
  }> {
    const params = new URLSearchParams({ q: query });
    if (category) {
      params.append('category', category);
    }

    return apiClient.get(`/storage/items/search?${params.toString()}`);
  },

  async getItemsByCategory(category: string): Promise<{
    category: string;
    categoryDisplay: string;
    items: StorageItemData[];
    count: number;
  }> {
    return apiClient.get(`/storage/items/category/${category}`);
  },

  async getItemsByDrawer(drawerId: string): Promise<{
    drawer: {
      id: string;
      name: string;
      cabinetId: string;
      cabinetName: string;
    };
    items: StorageItemData[];
    count: number;
  }> {
    return apiClient.get(`/storage/items/drawer/${drawerId}`);
  },

  async getLowStockItems(): Promise<{
    items: StorageItemData[];
    count: number;
  }> {
    return apiClient.get('/storage/items/low-stock');
  },

  async createItem(itemData: {
    drawer_id: string;
    equipment_id?: string;
    name: string;
    description?: string;
    category: string;
    quantity: number;
    unit_price?: number;
    supplier?: string;
    part_number?: string;
    added_date?: string;
    expiry_date?: string;
    minimum_stock?: number;
    is_consumable?: boolean;
    specifications?: Record<string, any>;
    image_url?: string;
  }): Promise<StorageItemData> {
    return apiClient.post<StorageItemData>('/storage/items', itemData);
  },

  async updateItem(id: string, itemData: {
    drawer_id?: string;
    equipment_id?: string;
    name?: string;
    description?: string;
    category?: string;
    quantity?: number;
    unit_price?: number;
    supplier?: string;
    part_number?: string;
    expiry_date?: string;
    minimum_stock?: number;
    is_consumable?: boolean;
    specifications?: Record<string, any>;
    image_url?: string;
  }): Promise<StorageItemData> {
    return apiClient.put<StorageItemData>(`/storage/items/${id}`, itemData);
  },

  async deleteItem(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/storage/items/${id}`);
  },

  async batchMoveItems(moves: ItemMoveOperation[]): Promise<BatchMoveResponse> {
    return apiClient.patch<BatchMoveResponse>('/storage/items/batch-move', {
      moves: moves.map(move => ({
        item_id: move.itemId,
        new_drawer_id: move.newDrawerId,
        quantity: move.quantity,
      })),
    });
  },

  async linkItemToEquipment(itemId: string, equipmentId: string): Promise<{
    success: boolean;
    message: string;
    item: StorageItemData;
  }> {
    return apiClient.post(`/storage/items/${itemId}/link-equipment`, {
      equipment_id: equipmentId,
    });
  },

  async getItemStats(): Promise<{
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    categoryCounts: Record<string, number>;
    lowStockCount: number;
    expiredCount: number;
    expiringSoonCount: number;
    consumableCount: number;
    linkedToEquipmentCount: number;
    categoryBreakdown: Array<{
      category: string;
      display: string;
      count: number;
    }>;
  }> {
    return apiClient.get('/storage/items/stats');
  },

  // Utility methods for frontend integration
  async getCabinetsWithDrawersAndItems(): Promise<CabinetData[]> {
    // This returns the full hierarchical structure needed by the frontend
    return this.getCabinets();
  },

  async moveItemBetweenDrawers(itemId: string, fromDrawerId: string, toDrawerId: string, quantity?: number): Promise<BatchMoveResponse> {
    return this.batchMoveItems([{
      itemId,
      newDrawerId: toDrawerId,
      quantity,
    }]);
  },
};