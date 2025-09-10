import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeSettings } from '../../theme/ThemeProvider';

// PUBLIC_INTERFACE
export default function SettingsScreen() {
  /** Theme toggle and info about sharing. */
  const { themeName, setThemeName } = useThemeSettings();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Theme</Text>
        <View style={styles.chips}>
          {(['system', 'light', 'dark'] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setThemeName(t)} style={[styles.chip, themeName === t && styles.chipActive]}>
              <Text style={{ fontWeight: themeName === t ? '700' : '400' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Native Share Extension</Text>
        <Text style={styles.text}>
          In the MVP, use system share to copy the URL, then paste in the Capture tab. Native share extension will be added in a later version.
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://supabase.com/docs')}>
          <Text style={styles.link}>Learn about the backend (Supabase)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  row: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  text: { opacity: 0.85 },
  link: { color: '#2563eb', textDecorationLine: 'underline', marginTop: 6 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
  chipActive: { backgroundColor: '#dbeafe' },
});
