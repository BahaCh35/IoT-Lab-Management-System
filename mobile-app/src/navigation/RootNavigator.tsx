import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AdminDrawerNavigator } from './AdminDrawerNavigator';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { LoadingView } from '../components/LoadingView';

// Detail screen imports (pushed on top of drawer)
import { EquipmentDetailScreen } from '../screens/equipment/EquipmentDetailScreen';
import { EquipmentFormScreen } from '../screens/equipment/EquipmentFormScreen';
import { UserDetailScreen } from '../screens/users/UserDetailScreen';
import { UserFormScreen } from '../screens/users/UserFormScreen';
import { CabinetDetailScreen } from '../screens/storage/CabinetDetailScreen';
import { DrawerDetailScreen } from '../screens/storage/DrawerDetailScreen';
import { StorageItemFormScreen } from '../screens/storage/StorageItemFormScreen';
import { MeetingRoomFormScreen } from '../screens/rooms/MeetingRoomFormScreen';
import { LabFormScreen } from '../screens/labs/LabFormScreen';

export type RootStackParamList = {
  Login: undefined;
  AdminHome: undefined;
  EquipmentDetail: { id: string };
  EquipmentForm: { id?: string };
  UserDetail: { id: string };
  UserForm: { id?: string };
  CabinetDetail: { id: string };
  DrawerDetail: { id: string; cabinetId: string; name?: string };
  StorageItemForm: { id?: string; drawerId?: string };
  MeetingRoomForm: { id?: string };
  LabForm: { id?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const linking: any = {
  prefixes: ['smartlab://'],
  config: {
    screens: {
      Login: 'login',
      AdminHome: {
        screens: {
          Dashboard: 'admin',
          Equipment: 'admin/equipment',
          Users: 'admin/users',
          Approvals: 'admin/approvals',
          Analytics: 'admin/analytics',
          Storage: 'admin/storage',
          'Activity Log': 'admin/activity',
        },
      },
      EquipmentDetail: 'admin/equipment/:id',
      UserDetail: 'admin/users/:id',
    },
  },
};

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingView message="Starting SmartLab…" />;

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="AdminHome" component={AdminDrawerNavigator} />
            <Stack.Screen
              name="EquipmentDetail"
              component={EquipmentDetailScreen}
              options={{ headerShown: true, title: 'Equipment Detail', headerBackTitle: '' }}
            />
            <Stack.Screen
              name="EquipmentForm"
              component={EquipmentFormScreen}
              options={({ route }) => ({
                headerShown: true,
                title: route.params?.id ? 'Edit Equipment' : 'Add Equipment',
                headerBackTitle: '',
              })}
            />
            <Stack.Screen
              name="UserDetail"
              component={UserDetailScreen}
              options={{ headerShown: true, title: 'User Profile', headerBackTitle: '' }}
            />
            <Stack.Screen
              name="UserForm"
              component={UserFormScreen}
              options={({ route }) => ({
                headerShown: true,
                title: route.params?.id ? 'Edit User' : 'New User',
                headerBackTitle: '',
              })}
            />
            <Stack.Screen
              name="CabinetDetail"
              component={CabinetDetailScreen}
              options={{ headerShown: true, title: 'Cabinet', headerBackTitle: '' }}
            />
            <Stack.Screen
              name="DrawerDetail"
              component={DrawerDetailScreen}
              options={({ route }) => ({ headerShown: true, title: route.params?.name ?? 'Drawer', headerBackTitle: '' })}
            />
            <Stack.Screen
              name="StorageItemForm"
              component={StorageItemFormScreen}
              options={({ route }) => ({
                headerShown: true,
                title: route.params?.id ? 'Edit Item' : 'New Item',
                headerBackTitle: '',
              })}
            />
            <Stack.Screen
              name="MeetingRoomForm"
              component={MeetingRoomFormScreen}
              options={({ route }) => ({
                headerShown: true,
                title: route.params?.id ? 'Edit Room' : 'New Room',
                headerBackTitle: '',
              })}
            />
            <Stack.Screen
              name="LabForm"
              component={LabFormScreen}
              options={({ route }) => ({
                headerShown: true,
                title: route.params?.id ? 'Edit Lab' : 'New Lab',
                headerBackTitle: '',
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
