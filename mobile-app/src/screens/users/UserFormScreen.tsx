import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Snackbar } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { userService } from '../../services/api/userService';
import { UserProfile } from '../../types';
import { LoadingView } from '../../components/LoadingView';
import { Colors, Spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type RouteProps = RouteProp<RootStackParamList, 'UserForm'>;

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters').optional(),
  role: z.enum(['admin', 'engineer', 'technician']),
  department: z.string().optional(),
  phone: z.string().optional(),
});

const ROLES: UserProfile['role'][] = ['admin', 'engineer', 'technician'];

type FormData = z.infer<typeof createSchema>;

export function UserFormScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEdit = !!params?.id;
  const [initialLoad, setInitialLoad] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'engineer' },
  });

  useEffect(() => {
    if (!isEdit) return;
    userService.getUserById(params!.id!).then((u) => {
      reset({
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        phone: u.phone,
      });
      setInitialLoad(false);
    });
  }, [isEdit]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (isEdit) {
        await userService.updateUser(params!.id!, data);
      } else {
        await userService.createUser(data);
      }
      navigation.goBack();
    } catch (err: any) {
      setSnack(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoad) return <LoadingView />;

  const selectedRole = watch('role');

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput label="Full Name *" value={value} onChangeText={onChange} mode="outlined" error={!!errors.name} />
            <HelperText type="error" visible={!!errors.name}>{errors.name?.message}</HelperText>
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput label="Email *" value={value} onChangeText={onChange} mode="outlined" keyboardType="email-address" autoCapitalize="none" error={!!errors.email} />
            <HelperText type="error" visible={!!errors.email}>{errors.email?.message}</HelperText>
          </View>
        )}
      />

      {!isEdit && (
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput label="Password *" value={value ?? ''} onChangeText={onChange} mode="outlined" secureTextEntry error={!!errors.password} />
              <HelperText type="error" visible={!!errors.password}>{errors.password?.message}</HelperText>
            </View>
          )}
        />
      )}

      <View>
        <TextInput label="Role" value={selectedRole} mode="outlined" editable={false} style={{ backgroundColor: Colors.grey50 }} />
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <Button
              key={r}
              mode={selectedRole === r ? 'contained' : 'outlined'}
              onPress={() => setValue('role', r)}
              compact
              style={styles.roleBtn}
              buttonColor={selectedRole === r ? Colors.primary : undefined}
            >
              {r}
            </Button>
          ))}
        </View>
      </View>

      <Controller
        control={control}
        name="department"
        render={({ field: { onChange, value } }) => (
          <TextInput label="Department" value={value ?? ''} onChangeText={onChange} mode="outlined" />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextInput label="Phone" value={value ?? ''} onChangeText={onChange} mode="outlined" keyboardType="phone-pad" />
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={saving}
        disabled={saving}
        style={styles.saveBtn}
        buttonColor={Colors.primary}
      >
        {isEdit ? 'Save Changes' : 'Create User'}
      </Button>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={4000}>{snack}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  roleBtn: { borderRadius: 6 },
  saveBtn: { marginTop: 8, borderRadius: 10 },
});
