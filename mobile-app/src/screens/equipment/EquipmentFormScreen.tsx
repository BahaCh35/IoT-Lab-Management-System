import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Snackbar, SegmentedButtons } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { equipmentService } from '../../services/api/equipmentService';
import { Equipment } from '../../types';
import { LoadingView } from '../../components/LoadingView';
import { Colors, Spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type RouteProps = RouteProp<RootStackParamList, 'EquipmentForm'>;

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['computer', 'microcontroller', 'sensor', 'tool', 'component', 'other']),
  status: z.enum(['available', 'checked-out', 'maintenance', 'damaged']).optional(),
  building: z.string().optional(),
  room: z.string().optional(),
  cabinet: z.string().optional(),
  drawer: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES: Equipment['category'][] = [
  'computer', 'microcontroller', 'sensor', 'tool', 'component', 'other',
];

export function EquipmentFormScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEdit = !!params?.id;
  const [initialLoad, setInitialLoad] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'computer' },
  });

  useEffect(() => {
    if (!isEdit) return;
    equipmentService.getEquipmentById(params!.id!).then((eq) => {
      reset({
        name: eq.name,
        description: eq.description,
        category: eq.category,
        status: eq.status,
        building: eq.location?.building,
        room: eq.location?.room,
        cabinet: eq.location?.cabinet,
        drawer: eq.location?.drawer,
      });
      setInitialLoad(false);
    });
  }, [isEdit, params?.id]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (isEdit) {
        await equipmentService.updateEquipment(params!.id!, data);
      } else {
        await equipmentService.createEquipment(data);
      }
      navigation.goBack();
    } catch (err: any) {
      setSnack(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoad) return <LoadingView />;

  const selectedCategory = watch('category');

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
            <TextInput
              label="Equipment Name *"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              error={!!errors.name}
            />
            <HelperText type="error" visible={!!errors.name}>{errors.name?.message}</HelperText>
          </View>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Description"
            value={value ?? ''}
            onChangeText={onChange}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
        )}
      />

      <View style={styles.section}>
        <TextInput
          label="Category"
          value={selectedCategory}
          mode="outlined"
          editable={false}
          style={{ backgroundColor: Colors.grey50 }}
        />
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              mode={selectedCategory === cat ? 'contained' : 'outlined'}
              onPress={() => setValue('category', cat)}
              compact
              style={styles.catBtn}
              buttonColor={selectedCategory === cat ? Colors.primary : undefined}
            >
              {cat}
            </Button>
          ))}
        </View>
        <HelperText type="error" visible={!!errors.category}>{errors.category?.message}</HelperText>
      </View>

      <View style={styles.section}>
        <TextInput
          label="Building"
          mode="outlined"
          value={watch('building') ?? ''}
          onChangeText={(t) => setValue('building', t)}
        />
        <TextInput
          label="Room"
          mode="outlined"
          value={watch('room') ?? ''}
          onChangeText={(t) => setValue('room', t)}
          style={{ marginTop: 8 }}
        />
        <TextInput
          label="Cabinet"
          mode="outlined"
          value={watch('cabinet') ?? ''}
          onChangeText={(t) => setValue('cabinet', t)}
          style={{ marginTop: 8 }}
        />
        <TextInput
          label="Drawer"
          mode="outlined"
          value={watch('drawer') ?? ''}
          onChangeText={(t) => setValue('drawer', t)}
          style={{ marginTop: 8 }}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={saving}
        disabled={saving}
        style={styles.saveBtn}
        buttonColor={Colors.primary}
      >
        {isEdit ? 'Save Changes' : 'Create Equipment'}
      </Button>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={4000}>
        {snack}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  section: { gap: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  catBtn: { borderRadius: 6 },
  saveBtn: { marginTop: 8, borderRadius: 10 },
});
