import apiClient from './client';
import { Equipment } from '../../types';

export const equipmentService = {
  async getEquipment(): Promise<Equipment[]> {
    const res = await apiClient.get<Equipment[]>('/equipment');
    return res.data;
  },

  async getEquipmentById(id: string): Promise<Equipment> {
    const res = await apiClient.get<Equipment>(`/equipment/${id}`);
    return res.data;
  },

  async getAvailableEquipment(): Promise<Equipment[]> {
    const res = await apiClient.get<Equipment[]>('/equipment/available');
    return res.data;
  },

  async searchEquipment(query: string): Promise<Equipment[]> {
    const res = await apiClient.get<Equipment[]>(`/equipment/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  async getEquipmentByQrCode(qrCode: string): Promise<Equipment | null> {
    const results = await this.searchEquipment(qrCode);
    return results.find((e) => e.qrCode === qrCode) ?? results[0] ?? null;
  },

  async getEquipmentByCategory(category: Equipment['category']): Promise<Equipment[]> {
    const res = await apiClient.get<Equipment[]>(`/equipment/category/${category}`);
    return res.data;
  },

  async createEquipment(data: Partial<Equipment> & Record<string, any>): Promise<Equipment> {
    const res = await apiClient.post<Equipment>('/equipment', data);
    return res.data;
  },

  async updateEquipment(id: string, data: Partial<Equipment> & Record<string, any>): Promise<Equipment> {
    const res = await apiClient.put<Equipment>(`/equipment/${id}`, data);
    return res.data;
  },

  async deleteEquipment(id: string): Promise<void> {
    await apiClient.delete(`/equipment/${id}`);
  },

  async batchUpdateLocations(
    updates: Array<{ id: string; location: Record<string, any> }>,
  ): Promise<{ message: string; updated_equipment: Equipment[]; count: number }> {
    const res = await apiClient.patch('/equipment/batch-update-locations', { updates });
    return res.data;
  },
};
