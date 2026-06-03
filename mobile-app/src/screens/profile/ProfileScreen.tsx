import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Avatar, Snackbar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Colors, Spacing, Shadow } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

const ROLE_COLORS: Record<string, string> = {
  admin: Colors.primary,
  engineer: Colors.success,
  technician: Colors.warning,
  guest: Colors.grey400,
};

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [snack, setSnack] = useState('');

  const handleLogout = async () => {
    setConfirmLogout(false);
    try {
      await logout();
    } catch (err: any) {
      setSnack('Logout failed: ' + err.message);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'AD';

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const INFO_ROWS = [
    { label: 'Email', value: user?.email },
    { label: 'Role', value: user?.role },
    { label: 'Department', value: user?.department },
    { label: 'Phone', value: user?.phone },
  ].filter((r) => r.value);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Avatar section */}
      <View style={[styles.avatarSection, Shadow.sm]}>
        <Avatar.Text
          size={80}
          label={initials}
          style={{ backgroundColor: ROLE_COLORS[user?.role ?? 'admin'] }}
        />
        <Text style={styles.name}>{user?.name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[user?.role ?? 'admin']) + '20' }]}>
          <Text style={[styles.roleText, { color: ROLE_COLORS[user?.role ?? 'admin'] }]}>
            {user?.role?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Info rows */}
      <View style={[styles.infoCard, Shadow.sm]}>
        {INFO_ROWS.map((row, i) => (
          <React.Fragment key={row.label}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
            {i < INFO_ROWS.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </View>

      {/* Edit profile */}
      {user?.id && (
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('UserForm', { id: user.id })}
          style={styles.editBtn}
          icon="account-edit"
        >
          Edit Profile
        </Button>
      )}

      {/* App version */}
      <View style={[styles.infoCard, Shadow.sm]}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>{appVersion}</Text>
        </View>
        <Divider />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>SmartLab Admin</Text>
        </View>
      </View>

      {/* Logout */}
      <Button
        mode="contained"
        onPress={() => setConfirmLogout(true)}
        buttonColor={Colors.error}
        style={styles.logoutBtn}
        icon="logout"
      >
        Logout
      </Button>

      <ConfirmDialog
        visible={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        destructive
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={4000}>{snack}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: 16, paddingBottom: 40, alignItems: 'stretch' },
  avatarSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 10,
  },
  name: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  roleBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  roleText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  infoCard: { backgroundColor: Colors.surface, borderRadius: 12, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.lg },
  infoLabel: { fontSize: 14, color: Colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, maxWidth: '60%', textAlign: 'right' },
  editBtn: { borderRadius: 10 },
  logoutBtn: { borderRadius: 10 },
});
