import { Equipment, Checkout } from '../types';
import { checkoutService as apiCheckoutService } from './api/checkoutService';

export const checkoutService = {
  // Equipment methods
  async getEquipment(): Promise<Equipment[]> {
    return apiCheckoutService.getEquipment();
  },

  async getEquipmentById(id: string): Promise<Equipment | undefined> {
    try {
      return await apiCheckoutService.getEquipmentById(id);
    } catch {
      return undefined;
    }
  },

  async getEquipmentByCategory(category: Equipment['category']): Promise<Equipment[]> {
    return apiCheckoutService.getEquipmentByCategory(category);
  },

  async getAvailableEquipment(): Promise<Equipment[]> {
    return apiCheckoutService.getAvailableEquipment();
  },

  async searchEquipment(query: string): Promise<Equipment[]> {
    return apiCheckoutService.searchEquipment(query);
  },

  // Checkout methods
  async checkoutEquipment(
    equipmentId: string,
    userId: string,
    userName: string,
    expectedReturnDate: string,
    notes?: string
  ): Promise<Checkout> {
    return apiCheckoutService.checkoutEquipment(equipmentId, userId, userName, expectedReturnDate, notes);
  },

  async checkInEquipment(checkoutId: string, notes?: string): Promise<Checkout> {
    return apiCheckoutService.checkInEquipment(checkoutId, notes);
  },

  async checkInByQRCode(qrCode: string, notes?: string): Promise<Checkout> {
    return apiCheckoutService.checkInByQRCode(qrCode, notes);
  },

  async getCheckouts(): Promise<Checkout[]> {
    return apiCheckoutService.getCheckouts();
  },

  async getActiveCheckouts(): Promise<Checkout[]> {
    return apiCheckoutService.getActiveCheckouts();
  },

  async getUserActiveCheckouts(userId: string): Promise<Checkout[]> {
    return apiCheckoutService.getUserActiveCheckouts(userId);
  },

  async getUserCheckoutHistory(userId: string): Promise<Checkout[]> {
    return apiCheckoutService.getUserCheckoutHistory(userId);
  },

  async getCheckoutById(id: string): Promise<Checkout | undefined> {
    try {
      return await apiCheckoutService.getCheckoutById(id);
    } catch {
      return undefined;
    }
  },

  async getCheckoutByQRCode(qrCode: string): Promise<Checkout | undefined> {
    try {
      return await apiCheckoutService.getCheckoutByQRCode(qrCode);
    } catch {
      return undefined;
    }
  },

  async getCheckoutStats(): Promise<{
    totalCheckouts: number;
    activeCheckouts: number;
    returnedCheckouts: number;
    overdueCheckouts: number;
  }> {
    return apiCheckoutService.getCheckoutStats();
  },

  async getOverdueCheckouts(): Promise<Checkout[]> {
    return apiCheckoutService.getOverdueCheckouts();
  },
};
