import { Equipment } from '../../types';
import apiClient from './client';

export const equipmentService = {
  // Get all equipment
  async getEquipment(): Promise<Equipment[]> {
    return apiClient.get<Equipment[]>('/equipment');
  },

  // Get equipment by ID
  async getEquipmentById(id: string): Promise<Equipment> {
    return apiClient.get<Equipment>(`/equipment/${id}`);
  },

  // Get equipment by category
  async getEquipmentByCategory(category: string): Promise<Equipment[]> {
    return apiClient.get<Equipment[]>(`/equipment/category/${category}`);
  },

  // Get available equipment
  async getAvailableEquipment(): Promise<Equipment[]> {
    return apiClient.get<Equipment[]>('/equipment/available');
  },

  // Search equipment
  async searchEquipment(query: string): Promise<Equipment[]> {
    return apiClient.get<Equipment[]>(`/equipment/search?q=${encodeURIComponent(query)}`);
  },

  // Create new equipment
  async createEquipment(equipmentData: {
    name: string;
    description?: string;
    category: Equipment['category'];
    specifications?: Record<string, any>;
    building?: string;
    room?: string;
    cabinet?: string;
    drawer?: string;
    shelf?: string;
    image_url?: string;
    acquisition_date?: string;
  }): Promise<Equipment> {
    return apiClient.post<Equipment>('/equipment', equipmentData);
  },

  // Update equipment
  async updateEquipment(id: string, equipmentData: {
    name?: string;
    description?: string;
    category?: Equipment['category'];
    status?: Equipment['status'];
    specifications?: Record<string, any>;
    building?: string;
    room?: string;
    cabinet?: string;
    drawer?: string;
    shelf?: string;
    image_url?: string;
  }): Promise<Equipment> {
    return apiClient.put<Equipment>(`/equipment/${id}`, equipmentData);
  },

  // Delete equipment
  async deleteEquipment(id: string): Promise<void> {
    await apiClient.delete(`/equipment/${id}`);
  },

  // Batch update locations
  async batchUpdateLocations(updates: Array<{
    id: string;
    location: {
      building?: string;
      room?: string;
      cabinet?: string;
      drawer?: string;
      shelf?: string;
    };
  }>): Promise<{ message: string; updated_equipment: Equipment[]; count: number }> {
    return apiClient.put('/equipment/batch-update-locations', { updates });
  },
};