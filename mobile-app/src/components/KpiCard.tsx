import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors, Shadow, Spacing } from '../theme';

interface Props {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  subtitle?: string;
}

export function KpiCard({ label, value, color = Colors.primary, subtitle }: Props) {
  return (
    <View style={[styles.card, Shadow.sm, { borderTopColor: color }]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 130,
    padding: Spacing.lg,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 3,
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textDisabled,
  },
});
