import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Switch, Text, Snackbar } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { labService } from '../../services/api/labService';
import { LoadingView } from '../../components/LoadingView';
import { Colors, Spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type RouteProps = RouteProp<RootStackParamList, 'LabForm'>;

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  capacity: z.coerce.number().min(1),
  floor: z.coerce.number().optional(),
  equipment: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function LabFormScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEdit = !!params?.id;
  const [initialLoad, setInitialLoad] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { capacity: 20, isActive: true },
  });

  useEffect(() => {
    if (!isEdit) return;
    labService.getLabById(params!.id!).then((lab) => {
      reset({
        name: lab.name,
        capacity: lab.capacity,
        floor: lab.floor,
        equipment: lab.equipment?.join(', '),
        isActive: lab.isActive,
      });
      setInitialLoad(false);
    });
  }, [isEdit]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        equipment: data.equipment?.split(',').map((e) => e.trim()).filter(Boolean) ?? [],
      };
      if (isEdit) {
        await labService.updateLab(params!.id!, payload);
      } else {
        await labService.createLab(payload);
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
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput label="Lab Name *" value={value} onChangeText={onChange} mode="outlined" error={!!errors.name} />
            <HelperText type="error" visible={!!errors.name}>{errors.name?.message}</HelperText>
          </View>
        )}
      />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Controller control={control} name="capacity" render={({ field: { onChange, value } }) => (
            <TextInput label="Capacity *" value={String(value ?? '')} onChangeText={onChange} mode="outlined" keyboardType="numeric" />
          )} />
        </View>
        <View style={{ flex: 1 }}>
          <Controller control={control} name="floor" render={({ field: { onChange, value } }) => (
            <TextInput label="Floor" value={String(value ?? '')} onChangeText={onChange} mode="outlined" keyboardType="numeric" />
          )} />
        </View>
      </View>
      <Controller
        control={control}
        name="equipment"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput label="Equipment (comma-separated)" value={value ?? ''} onChangeText={onChange} mode="outlined" multiline />
            <HelperText type="info" visible>List major equipment available in this lab</HelperText>
          </View>
        )}
      />
      <View style={styles.switchRow}>
        <Text>Active</Text>
        <Switch value={watch('isActive') ?? true} onValueChange={(v) => setValue('isActive', v)} color={Colors.primary} />
      </View>
      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={saving} disabled={saving} style={styles.saveBtn} buttonColor={Colors.primary}>
        {isEdit ? 'Save Changes' : 'Create Lab'}
      </Button>
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={4000}>{snack}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 8 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8 },
  saveBtn: { marginTop: 8, borderRadius: 10 },
});
