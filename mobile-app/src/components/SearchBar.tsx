import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { Colors } from '../theme';

interface Props {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

export function SearchBar({ placeholder = 'Search…', onSearch, debounceMs = 300 }: Props) {
  const [query, setQuery] = useState('');
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onSearch(text), debounceMs);
    },
    [onSearch, debounceMs],
  );

  return (
    <Searchbar
      placeholder={placeholder}
      value={query}
      onChangeText={handleChange}
      style={styles.bar}
      inputStyle={{ fontSize: 14 }}
      iconColor={Colors.textSecondary}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    elevation: 1,
  },
});
