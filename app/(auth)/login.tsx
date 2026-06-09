import React, { useState } from 'react';
import { StyleSheet, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function MobileLogin() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('dr.vikram.sharma@healthclinic.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    try {
      const success = await login(email, password);
      if (success) {
        // Since root stack handles conditional routing, updating isAuthenticated will trigger state change and redirect.
      } else {
        setError('Invalid credentials');
      }
    } catch (e) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🩺</Text>
          </View>
          <Text style={styles.title}>Aura Clinic</Text>
          <Text style={styles.subtitle}>Doctor Portal MVP</Text>
        </View>

        <Surface style={styles.formCard} elevation={1}>
          {error ? (
            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>
          ) : null}

          <TextInput
            label="Doctor Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
            style={styles.input}
            activeOutlineColor="#0ea5e9"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            activeOutlineColor="#0ea5e9"
          />

          <Button
            mode="text"
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotBtn}
            textColor="#0284c7"
          >
            Forgot Password?
          </Button>

          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>💡 Demo Bypass Enabled</Text>
            <Text style={styles.hintText}>
              You can tap the Login button with any credentials to explore the interactive doctor app.
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitBtn}
            buttonColor="#0ea5e9"
            labelStyle={styles.submitBtnLabel}
          >
            Login to Practice
          </Button>
        </Surface>

        <Text style={styles.footer}>Aura Health Solutions Inc. © 2026</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    height: 64,
    width: 64,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
  },
  formCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  hintBox: {
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    marginBottom: 20,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369a1',
    marginBottom: 2,
  },
  hintText: {
    fontSize: 11,
    color: '#0284c7',
    lineHeight: 15,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  submitBtnLabel: {
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 32,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
