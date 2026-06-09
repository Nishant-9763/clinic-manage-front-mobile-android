import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function MobileForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = () => {
    if (!email) return;
    setSuccess(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Password Reset</Text>
          <Text style={styles.subtitle}>Doctor Portal Recovery</Text>
        </View>

        <Surface style={styles.formCard} elevation={1}>
          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>✨ Recovery Link Sent!</Text>
              <Text style={styles.successText}>
                An email containing instructions has been sent to {email}. Please check your inbox.
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/(auth)/login')}
                style={styles.backBtn}
                buttonColor="#0ea5e9"
              >
                Back to Login
              </Button>
            </View>
          ) : (
            <>
              <Text style={styles.instruction}>
                Enter your registered doctor email address below and we will send you a mock recovery link.
              </Text>

              <TextInput
                label="Registered Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                mode="outlined"
                style={styles.input}
                activeOutlineColor="#0ea5e9"
              />

              <Button
                mode="contained"
                onPress={handleReset}
                disabled={!email}
                style={styles.submitBtn}
                buttonColor="#0ea5e9"
                labelStyle={styles.submitBtnLabel}
              >
                Send Recovery Code
              </Button>

              <Button
                mode="text"
                onPress={() => router.push('/(auth)/login')}
                style={styles.cancelBtn}
                textColor="#64748b"
              >
                Cancel and Go Back
              </Button>
            </>
          )}
        </Surface>
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
  instruction: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '500',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  submitBtnLabel: {
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 12,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: '#10b981',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  backBtn: {
    width: '100%',
    borderRadius: 12,
  },
});
