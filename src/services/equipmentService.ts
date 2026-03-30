import { Equipment } from '../types';
import { equipmentService as apiEquipmentService } from './api/equipmentService';

export const equipmentService = {
  // Get all equipment
  async getEquipment(): Promise<Equipment[]> {
    return apiEquipmentService.getEquipment();
  },

  // Get equipment by ID
  async getEquipmentById(id: string): Promise<Equipment | undefined> {
    try {
      return await apiEquipmentService.getEquipmentById(id);
    } catch {
      return undefined;
    }
  },

  // Get equipment by category
  async getEquipmentByCategory(category: Equipment['category']): Promise<Equipment[]> {
    return apiEquipmentService.getEquipmentByCategory(category);
  },

  // Get available equipment
  async getAvailableEquipment(): Promise<Equipment[]> {
    return apiEquipmentService.getAvailableEquipment();
  },

  // Search equipment
  async searchEquipment(query: string): Promise<Equipment[]> {
    return apiEquipmentService.searchEquipment(query);
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
  }): Promise<Equipment | undefined> {
    try {
      return await apiEquipmentService.createEquipment(equipmentData);
    } catch (error) {
      console.error('Error creating equipment:', error);
      return undefined;
    }
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
  }): Promise<Equipment | undefined> {
    try {
      return await apiEquipmentService.updateEquipment(id, equipmentData);
    } catch (error) {
      console.error('Error updating equipment:', error);
      return undefined;
    }
  },

  // Delete equipment
  async deleteEquipment(id: string): Promise<boolean> {
    try {
      await apiEquipmentService.deleteEquipment(id);
      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      return false;
    }
  },

  // Batch update equipment locations
  async batchUpdateLocations(updates: Array<{
    id: string;
    location: {
      building?: string;
      room?: string;
      cabinet?: string;
      drawer?: string;
      shelf?: string;
    };
  }>): Promise<{ message: string; updated_equipment: Equipment[]; count: number } | undefined> {
    try {
      return await apiEquipmentService.batchUpdateLocations(updates);
    } catch (error) {
      console.error('Error batch updating equipment locations:', error);
      return undefined;
    }
  },
};