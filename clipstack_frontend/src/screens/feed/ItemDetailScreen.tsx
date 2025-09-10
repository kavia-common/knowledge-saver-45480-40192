import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { getClip, upsertSummary, deleteClip, ClipItem } from '../../services/api';

// PUBLIC_INTERFACE
export default function ItemDetailScreen() {
  /** View and edit a single clip. */
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const id = route.params?.id;
  const [item, setItem] = useState<ClipItem | null>(null);
  const [summary, setSummary] = useState('');
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const res = await getClip(id);
      setItem(res);
      setSummary(res.summary || '');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await upsertSummary(id, summary);
      Alert.alert('Saved', 'Summary updated');
    } catch (e) {
      const err = e as Error;
      Alert.alert('Error', err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    Alert.alert('Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteClip(id);
          Alert.alert('Deleted', 'The item was removed.');
        },
      },
    ]);
  };

  if (busy || !item) return <ActivityIndicator style={{ marginTop: 24 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{item.title || item.url}</Text>
      <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
        <Text style={styles.url}>{item.url}</Text>
      </TouchableOpacity>
      <Text style={styles.meta}>
        {item.source?.toUpperCase()} • {new Date(item.created_at || '').toLocaleString()}
      </Text>
      <TextInput
        style={styles.summary}
        multiline
        placeholder="Summary"
        value={summary}
        onChangeText={setSummary}
        textAlignVertical="top"
      />
      <View style={styles.actions}>
        <TouchableOpacity onPress={save} style={[styles.button, { backgroundColor: '#111827' }]}>
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={remove} style={[styles.button, { backgroundColor: '#b91c1c' }]}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  url: { color: '#2563eb', textDecorationLine: 'underline', marginTop: 2 },
  meta: { fontSize: 12, opacity: 0.7, marginBottom: 8 },
  summary: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1', borderRadius: 8, minHeight: 160, padding: 12 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  button: { padding: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
});
