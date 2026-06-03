import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing } from '../theme';

// Screen imports
import { AdminDashboardScreen } from '../screens/dashboard/AdminDashboardScreen';
import { EquipmentListScreen } from '../screens/equipment/EquipmentListScreen';
import { StorageOverviewScreen } from '../screens/storage/StorageOverviewScreen';
import { UserListScreen } from '../screens/users/UserListScreen';
import { ApprovalsScreen } from '../screens/approvals/ApprovalsScreen';
import { ReservationsScreen } from '../screens/reservations/ReservationsScreen';
import { MeetingRoomsScreen } from '../screens/rooms/MeetingRoomsScreen';
import { LabsScreen } from '../screens/labs/LabsScreen';
import { MaintenanceScreen } from '../screens/maintenance/MaintenanceScreen';
import { PartsScreen } from '../screens/parts/PartsScreen';
import { ActivityLogScreen } from '../screens/activity/ActivityLogScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

export type DrawerParamList = {
  Dashboard: undefined;
  Equipment: undefined;
  Storage: undefined;
  Users: undefined;
  Approvals: undefined;
  Reservations: undefined;
  'Meeting Rooms': undefined;
  Labs: undefined;
  Maintenance: undefined;
  Parts: undefined;
  'Activity Log': undefined;
  Analytics: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();

  return (
    <DrawerContentScrollView {...props} style={styles.drawer}>
      {/* SmartLab Brand Header */}
      <View style={styles.brand}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <Divider style={styles.divider} />

      {/* User Info — tap to open Profile */}
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => props.navigation.navigate('Profile')}
        activeOpacity={0.7}
      >
        <Avatar.Text
          size={40}
          label={(user?.name?.[0] ?? 'A').toUpperCase()}
          style={{ backgroundColor: Colors.primary }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user?.name ?? 'Admin'}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Admin</Text>
        </View>
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <DrawerItemList {...props} />

      <Divider style={styles.divider} />

      <DrawerItem
        label="Logout"
        onPress={logout}
        icon={({ size }) => (
          <MaterialCommunityIcons name="logout" size={size} color={Colors.error} />
        )}
        labelStyle={{ color: Colors.error, fontWeight: '600' }}
      />
    </DrawerContentScrollView>
  );
}

export function AdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerActiveBackgroundColor: Colors.primary + '12',
        drawerLabelStyle: { fontWeight: '500', fontSize: 14 },
        headerStyle: { backgroundColor: Colors.surface, elevation: 1, shadowOpacity: 0.08 },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700', fontSize: 18, color: Colors.textPrimary },
        drawerStyle: { backgroundColor: Colors.surface, width: 280 },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Equipment"
        component={EquipmentListScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="laptop" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Storage"
        component={StorageOverviewScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="archive" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Users"
        component={UserListScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Approvals"
        component={ApprovalsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="check-decagram" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Reservations"
        component={ReservationsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-clock" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Meeting Rooms"
        component={MeetingRoomsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="door" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Labs"
        component={LabsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="flask" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Maintenance"
        component={MaintenanceScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wrench" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Parts"
        component={PartsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Activity Log"
        component={ActivityLogScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawer: { flex: 1 },
  brand: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  logoImage: {
    width: 180,
    height: 52,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  roleBadge: {
    backgroundColor: Colors.primary + '18',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  divider: { marginVertical: 6 },
});
