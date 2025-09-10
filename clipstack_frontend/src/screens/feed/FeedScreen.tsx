import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ClipItem, listClips } from '../../services/api';

// PUBLIC_INTERFACE
export default function FeedScreen() {
  /** Browsing feed with search, filter, and sort. */
  const [items, setItems] = useState<ClipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [source, setSource] = useState<string | null>(null);
  const [sort, setSort] = useState<'new' | 'old'>('new');
  const isFocused = useIsFocused();
  const nav = useNavigation();

  const load = async () => {
    setLoading(true);
    try {
      const res = await listClips({ q, source, sort });
      setItems(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) void load();
  }, [isFocused]);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 300);
    return () => clearTimeout(t);
  }, [q, source, sort]);

  const renderItem = ({ item }: { item: ClipItem }) => (
    <Pressable onPress={() => nav.navigate('ItemDetail', { id: item.id })} style={styles.card}>
      <Text style={styles.title} numberOfLines={1}>
        {item.title || item.url}
      </Text>
      <Text style={styles.meta}>
        {item.source?.toUpperCase() || 'WEB'} • {new Date(item.created_at || '').toLocaleString()}
      </Text>
      {!!item.summary && (
        <Text numberOfLines={3} style={styles.summary}>
          {item.summary}
        </Text>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput placeholder="Search saved knowledge" value={q} onChangeText={setQ} style={styles.search} />
        <View style={styles.filters}>
          <Pressable onPress={() => setSource(source === null ? 'reddit' : null)} style={[styles.chip, source === 'reddit' && styles.chipActive]}>
            <Text>Reddit</Text>
          </Pressable>
          <Pressable onPress={() => setSource(source === null ? 'x' : null)} style={[styles.chip, source === 'x' && styles.chipActive]}>
            <Text>X</Text>
          </Pressable>
          <Pressable onPress={() => setSource(source === null ? 'youtube' : null)} style={[styles.chip, source === 'youtube' && styles.chipActive]}>
            <Text>YouTube</Text>
          </Pressable>
          <Pressable onPress={() => setSort(sort === 'new' ? 'old' : 'new')} style={styles.chip}>
            <Text>{sort === 'new' ? 'Newest' : 'Oldest'}</Text>
          </Pressable>
        </View>
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 24 }} /> : <FlatList data={items} keyExtractor={(it) => it.id} renderItem={renderItem} contentContainerStyle={{ padding: 12 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { padding: 12, gap: 8 },
  search: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1', padding: 12, borderRadius: 8 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 6 },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
  chipActive: { backgroundColor: '#dbeafe' },
  card: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12, backgroundColor: 'white' },
  title: { fontWeight: '700' },
  meta: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  summary: { marginTop: 6, color: '#111827' },
});
