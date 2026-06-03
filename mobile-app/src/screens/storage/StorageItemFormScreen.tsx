import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Snackbar } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { storageService } from '../../services/api/storageService';
import { LoadingView } from '../../components/LoadingView';
import { Colors, Spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type RouteProps = RouteProp<RootStackParamList, 'StorageItemForm'>;

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().min(0),
  minQuantity: z.coerce.number().min(0).optional(),
  unit: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function StorageItemFormScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEdit = !!params?.id;
  const [initialLoad, setInitialLoad] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 0 },
  });

  useEffect(() => {
    if (!isEdit) return;
    // TODO: load item by id when API available
    setInitialLoad(false);
  }, [isEdit]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (isEdit) {
        await storageService.updateItem(params!.id!, data);
      } else {
        await storageService.createItem({ ...data, drawerId: params?.drawerId });
      }
      navigation.goBack();
    } catch (err: any) {
      setSnack(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoad) return <LoadingView />;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {[
        { name: 'name' as const, label: 'Item Name *' },
        { name: 'category' as const, label: 'Category *' },
        { name: 'unit' as const, label: 'Unit (pcs, kg, m…)' },
        { name: 'description' as const, label: 'Description' },
      ].map(({ name, label }) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput
                label={label}
                value={String(value ?? '')}
                onChangeText={onChange}
                mode="outlined"
                error={!!(errors as any)[name]}
              />
              <HelperText type="error" visible={!!(errors as any)[name]}>
                {(errors as any)[name]?.message}
              </HelperText>
            </View>
          )}
        />
      ))}

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="quantity"
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  label="Quantity *"
                  value={String(value ?? 0)}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                  error={!!errors.quantity}
                />
                <HelperText type="error" visible={!!errors.quantity}>{errors.quantity?.message}</HelperText>
              </View>
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="minQuantity"
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput
                  label="Min Qty"
                  value={String(value ?? '')}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                />
                <HelperText type="error" visible={false}>{' '}</HelperText>
              </View>
            )}
          />
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={saving}
        disabled={saving}
        style={styles.saveBtn}
        buttonColor={Colors.primary}
      >
        {isEdit ? 'Save Changes' : 'Add Item'}
      </Button>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={4000}>{snack}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: 8, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 8 },
  saveBtn: { marginTop: 8, borderRadius: 10 },
});
