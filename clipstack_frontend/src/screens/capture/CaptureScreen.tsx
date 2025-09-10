import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { detectSource } from '../../utils/source';
import { addClip } from '../../services/api';
import { generateSummary } from '../../utils/ai';

// PUBLIC_INTERFACE
export default function CaptureScreen() {
  /** UI for knowledge capture: add a link and let AI generate summary. */
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState('');

  const fetchTitle = async (u: string) => {
    try {
      const res = await fetch(u, { method: 'GET' });
      const text = await res.text();
      const m = text.match(/<title>(.*?)<\/title>/i);
      if (m) setTitle(m[1]);
    } catch {
      // ignore
    }
  };

  const onPasteUrl = async (value: string) => {
    setUrl(value);
    if (value) {
      fetchTitle(value);
    }
  };

  const onGenerateSummary = async () => {
    setBusy(true);
    Keyboard.dismiss();
    try {
      const s = await generateSummary({ url });
      setSummary(s);
    } catch (e) {
      const err = e as Error;
      Alert.alert('Summary error', err.message || 'Failed to generate summary');
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    if (!url) return;
    setBusy(true);
    try {
      const source = detectSource(url);
      const payload = {
        url,
        title: title || url,
        source,
        summary: summary || undefined,
        metadata: { captured_via: 'app', ts: Date.now() },
        tags: [] as string[],
      };
      await addClip(payload);
      Alert.alert('Saved', 'Your link was saved.');
      setUrl('');
      setTitle('');
      setSummary('');
    } catch (e) {
      const err = e as Error;
      Alert.alert('Save failed', err.message || 'Unable to save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.header}>Add a link</Text>
        <TextInput placeholder="Paste a URL" autoCapitalize="none" value={url} onChangeText={onPasteUrl} style={styles.input} />
        <TextInput placeholder="Title (optional)" value={title} onChangeText={setTitle} style={styles.input} />
        <TouchableOpacity disabled={!url || busy} onPress={onGenerateSummary} style={[styles.button, { backgroundColor: '#4B5563' }]}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate Summary</Text>}
        </TouchableOpacity>
        <TextInput
          placeholder="Summary (AI)"
          value={summary}
          onChangeText={setSummary}
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity disabled={!url || busy} onPress={onSave} style={styles.button}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  form: { flex: 1, gap: 8 },
  header: { fontSize: 22, fontWeight: '700', marginVertical: 12 },
  input: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1', padding: 12, borderRadius: 8 },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  button: { backgroundColor: '#111827', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
});
