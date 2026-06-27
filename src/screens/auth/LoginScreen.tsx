import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
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
};

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error, clearError } = useAuthStore();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await signIn(email.trim(), password);
    if (!success && error) {
      Alert.alert('Login Failed', error);
      clearError();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Logo size={100} />
            <Text style={[styles.title, { color: colors.text }]}>PlayRegister</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Sign in to continue
            </Text>
          </View>

          <Card variant="auth" style={styles.formCard}>
            <LinearGradient
              colors={[
                colors.primary + '0A',
                colors.secondary + '0A',
              ]}
              style={styles.gradientOverlay}
            >
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
              />

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  Don't have an account?{' '}
                </Text>
                <Button
                  title="Sign Up"
                  onPress={() => navigation.navigate('Signup')}
                  variant="text"
                  fullWidth={false}
                  textStyle={styles.signupLink}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl * 2,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: '900',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FontSize.bodyLg,
  },
  formCard: {
    overflow: 'hidden',
  },
  gradientOverlay: {
    margin: -Spacing.hero,
    padding: Spacing.hero,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontSize: FontSize.body,
  },
  signupLink: {
    fontSize: FontSize.body,
    textTransform: 'none',
    letterSpacing: 0,
    paddingVertical: 0,
    minHeight: undefined,
  },
});
