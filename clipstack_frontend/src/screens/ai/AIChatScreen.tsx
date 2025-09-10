import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { listClips } from '../../services/api';
import { generateSummary } from '../../utils/ai';

// PUBLIC_INTERFACE
export default function AIChatScreen() {
  /** Simple Q&A over saved items. */
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  const ask = async () => {
    setBusy(true);
    setAnswer('');
    try {
      const clips = await listClips({ q, sort: 'new' });
      const context = clips.slice(0, 5).map((c) => `• ${c.title ?? c.url}: ${c.summary ?? ''}`).join('\n');
      const res = await generateSummary({ text: `Question: ${q}\nContext:\n${context}\nAnswer briefly using context.` });
      setAnswer(res);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Ask AI about your saved knowledge</Text>
        <TextInput placeholder="Type your question..." value={q} onChangeText={setQ} style={styles.input} />
        <TouchableOpacity onPress={ask} disabled={!q || busy} style={styles.button}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ask</Text>}
        </TouchableOpacity>
        <ScrollView style={styles.answerBox} contentContainerStyle={{ padding: 12 }}>
          <Text selectable>{answer}</Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  box: { gap: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1', padding: 12, borderRadius: 8 },
  button: { backgroundColor: '#111827', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  answerBox: { marginTop: 8, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', minHeight: 160 },
});
