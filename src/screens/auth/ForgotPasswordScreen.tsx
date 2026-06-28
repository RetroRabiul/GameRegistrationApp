import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Logo } from '../../components/Logo';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const { resetPassword, loading, error, clearError } = useAuthStore();
  const { colors } = useTheme();

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    const success = await resetPassword(email.trim());
    if (success) {
      Alert.alert(
        'Reset Link Sent',
        `A password reset link has been sent to ${email}. Please check your inbox and follow the instructions.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Logo size={100} />
            <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Enter your email to receive a reset link
            </Text>
          </View>

          <Card variant="auth" style={styles.formCard}>
            <LinearGradient colors={[colors.primary + '0A', colors.secondary + '0A']} style={styles.gradientOverlay}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                leadingIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
              />

              <Button title="Send Reset Link" onPress={handleReset} loading={loading} style={styles.resetButton} />

              <View style={styles.footer}>
                <Button
                  title="Back to Sign In"
                  onPress={() => navigation.navigate('Login')}
                  variant="text"
                  fullWidth={false}
                  textStyle={styles.backLink}
                />
              </View>
            </LinearGradient>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xxl },
  header: { alignItems: 'center', marginBottom: Spacing.xxxl * 2 },
  title: { fontSize: FontSize.display, fontWeight: '900', marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  subtitle: { fontSize: FontSize.bodyLg, textAlign: 'center' },
  formCard: { overflow: 'hidden' },
  gradientOverlay: { margin: -Spacing.hero, padding: Spacing.hero },
  resetButton: { marginTop: Spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xxl },
  backLink: { fontSize: FontSize.body, textTransform: 'none', letterSpacing: 0, paddingVertical: 0, minHeight: undefined },
});
