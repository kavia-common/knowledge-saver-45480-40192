import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../services/supabase/client';

// PUBLIC_INTERFACE
export default function LoginScreen() {
  /** Email authentication via OTP (Supabase). */
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: process.env.EXPO_PUBLIC_SITE_URL || 'clipstack://auth',
        },
      });
      if (error) throw error;
      Alert.alert('Check your email', 'We sent you a login code.');
      setMode('verify');
    } catch (e) {
      const err = e as Error;
      Alert.alert('Error', err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
    } catch (e) {
      const err = (e as Error);
      Alert.alert('Error', err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>ClipStack</Text>
        <Text style={styles.subtitle}>Save, summarize, and search your knowledge</Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {mode === 'verify' && (
          <TextInput
            style={styles.input}
            placeholder="Enter code"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
        )}

        {mode === 'request' ? (
          <TouchableOpacity disabled={!email || loading} onPress={requestOtp} style={styles.button}>
            <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send login code'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity disabled={!otp || loading} onPress={verifyOtp} style={styles.button}>
            <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Sign in'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 420, padding: 24, borderRadius: 12, backgroundColor: 'white', elevation: 2 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', padding: 12, borderRadius: 8, marginVertical: 6 },
  button: { backgroundColor: '#111827', padding: 14, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
});
