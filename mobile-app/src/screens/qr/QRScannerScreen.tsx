import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, Snackbar } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { equipmentService } from '../../services/api/equipmentService';
import { checkoutService } from '../../services/api/checkoutService';
import { Equipment } from '../../types';
import { StatusChip } from '../../components/StatusChip';
import { LoadingView } from '../../components/LoadingView';
import { Colors, Spacing, Shadow } from '../../theme';

export function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');

  if (!permission) {
    return <LoadingView message="Requesting camera permission…" />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons name="camera-off" size={64} color={Colors.textDisabled} />
        <Text style={styles.permissionText}>Camera permission is required to scan QR codes.</Text>
        <Button mode="contained" onPress={requestPermission} buttonColor={Colors.primary} style={{ marginTop: Spacing.lg }}>
          Grant Permission
        </Button>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    try {
      const equip = await equipmentService.getEquipmentByQrCode(data);
      if (!equip) {
        setSnack('No equipment found for this QR code');
        setTimeout(() => setScanned(false), 2000);
        return;
      }
      setEquipment(equip);
    } catch (err: any) {
      setSnack('Lookup failed: ' + err.message);
      setTimeout(() => setScanned(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!equipment) return;
    try {
      await checkoutService.qrCheckin(equipment.qrCode);
      setSnack('Equipment checked in successfully');
      setEquipment(null);
      setScanned(false);
    } catch (err: any) {
      setSnack('Check-in failed: ' + err.message);
    }
  };

  if (loading) return <LoadingView message="Looking up equipment…" />;

  if (equipment) {
    return (
      <View style={styles.resultContainer}>
        <View style={[styles.resultCard, Shadow.md]}>
          <View style={styles.resultHeader}>
            <MaterialCommunityIcons name="check-circle" size={32} color={Colors.success} />
            <Text style={styles.resultTitle}>Equipment Found</Text>
          </View>
          <Text style={styles.equipName}>{equipment.name}</Text>
          <Text style={styles.equipSerial}>{equipment.qrCode}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Status:</Text>
            <StatusChip status={equipment.status} />
          </View>
          {equipment.location && (
            <View style={styles.statusRow}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{equipment.location.room || equipment.location.building}</Text>
            </View>
          )}
          <View style={styles.resultActions}>
            {equipment.status === 'checked-out' && (
              <Button mode="contained" onPress={handleCheckin} buttonColor={Colors.success} style={{ flex: 1 }}>
                Check In
              </Button>
            )}
            <Button mode="outlined" onPress={() => { setEquipment(null); setScanned(false); }} style={{ flex: 1 }}>
              Scan Again
            </Button>
          </View>
        </View>
        <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.topHint}>
          <Text style={styles.hintText}>Align QR code within the frame</Text>
        </View>
        <View style={styles.frameArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
        <View style={styles.bottomArea}>
          {scanned && (
            <Button mode="contained" onPress={() => setScanned(false)} buttonColor={Colors.primary}>
              Scan Again
            </Button>
          )}
        </View>
      </View>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </View>
  );
}

const FRAME = 220;
const CORNER = 20;
const BORDER = 3;

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'transparent' },
  topHint: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 20 },
  hintText: { color: '#fff', fontSize: 14, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  frameArea: { alignItems: 'center', justifyContent: 'center', height: FRAME },
  scanFrame: { width: FRAME, height: FRAME },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: Colors.white },
  topLeft: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER },
  topRight: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER },
  bottomArea: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 24 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: 12 },
  permissionText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  resultContainer: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl, justifyContent: 'center' },
  resultCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.xl, gap: 12 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  equipName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  equipSerial: { fontSize: 12, color: Colors.textSecondary },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  value: { fontSize: 13, color: Colors.textPrimary },
  resultActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
