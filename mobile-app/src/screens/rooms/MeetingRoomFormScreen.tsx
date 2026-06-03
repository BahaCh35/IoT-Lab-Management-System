import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Switch, Text, Snackbar } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { meetingRoomService } from '../../services/api/labService';
import { LoadingView } from '../../components/LoadingView';
import { Colors, Spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type RouteProps = RouteProp<RootStackParamList, 'MeetingRoomForm'>;

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  capacity: z.coerce.number().min(1),
  floor: z.coerce.number().optional(),
  location: z.string().optional(),
  amenities: z.string().optional(), // comma-separated
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function MeetingRoomFormScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEdit = !!params?.id;
  const [initialLoad, setInitialLoad] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { capacity: 10, isActive: true },
  });

  useEffect(() => {
    if (!isEdit) return;
    meetingRoomService.getRoomById(params!.id!).then((room) => {
      reset({
        name: room.name,
        capacity: room.capacity,
        floor: room.floor,
        location: room.location,
        amenities: room.amenities?.join(', '),
        isActive: room.isActive,
      });
      setInitialLoad(false);
    });
  }, [isEdit]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        amenities: data.amenities?.split(',').map((a) => a.trim()).filter(Boolean) ?? [],
      };
      if (isEdit) {
        await meetingRoomService.updateRoom(params!.id!, payload);
      } else {
        await meetingRoomService.createRoom(payload);
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
            <TextInput label="Room Name *" value={value} onChangeText={onChange} mode="outlined" error={!!errors.name} />
            <HelperText type="error" visible={!!errors.name}>{errors.name?.message}</HelperText>
          </View>
        )}
      />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="capacity"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Capacity *" value={String(value ?? '')} onChangeText={onChange} mode="outlined" keyboardType="numeric" error={!!errors.capacity} />
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="floor"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Floor" value={String(value ?? '')} onChangeText={onChange} mode="outlined" keyboardType="numeric" />
            )}
          />
        </View>
      </View>
      <Controller
        control={control}
        name="location"
        render={({ field: { onChange, value } }) => (
          <TextInput label="Location" value={value ?? ''} onChangeText={onChange} mode="outlined" />
        )}
      />
      <Controller
        control={control}
        name="amenities"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput
              label="Amenities (comma-separated)"
              value={value ?? ''}
              onChangeText={onChange}
              mode="outlined"
              placeholder="Projector, Whiteboard, TV"
            />
            <HelperText type="info" visible>Enter amenities separated by commas</HelperText>
          </View>
        )}
      />
      <View style={styles.switchRow}>
        <Text>Active</Text>
        <Switch
          value={watch('isActive') ?? true}
          onValueChange={(v) => setValue('isActive', v)}
          color={Colors.primary}
        />
      </View>
      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={saving} disabled={saving} style={styles.saveBtn} buttonColor={Colors.primary}>
        {isEdit ? 'Save Changes' : 'Create Room'}
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
