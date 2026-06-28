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
};

interface SignupScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Signup'>;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading, error, clearError } = useAuthStore();
  const { colors } = useTheme();

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    const success = await signUp(email.trim(), password, fullName.trim(), phone.trim());
    if (success) {
      Alert.alert('Registration Successful', 'Please check your email to verify your account, then sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } else if (error) {
      Alert.alert('Signup Failed', error);
      clearError();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Logo size={100} />
            <Text style={[styles.title, { color: colors.text }]}>PlayRegister</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Create your account</Text>
          </View>

          <Card variant="auth" style={styles.formCard}>
            <LinearGradient colors={[colors.primary + '0A', colors.secondary + '0A']} style={styles.gradientOverlay}>
              <Input
                label="Full Name *"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                leadingIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
              />
              <Input
                label="Email *"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                leadingIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
              />
              <Input
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                leadingIcon={<Ionicons name="phone-portrait-outline" size={18} color={colors.textMuted} />}
              />
              <Input
                label="Password *"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password (min 6 chars)"
                secureTextEntry
                leadingIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
              />
              <Input
                label="Confirm Password *"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                leadingIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
              />

              <Button title="Sign Up" onPress={handleSignup} loading={loading} style={styles.signupButton} />

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>Already have an account?{' '}</Text>
                <Button
                  title="Sign In"
                  onPress={() => navigation.navigate('Login')}
                  variant="text"
                  fullWidth={false}
                  textStyle={styles.loginLink}
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
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xxl, paddingVertical: Spacing.xxxl * 2 },
  header: { alignItems: 'center', marginBottom: Spacing.xxxl * 2 },
  title: { fontSize: FontSize.display, fontWeight: '900', marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  subtitle: { fontSize: FontSize.bodyLg },
  formCard: { overflow: 'hidden' },
  gradientOverlay: { margin: -Spacing.hero, padding: Spacing.hero },
  signupButton: { marginTop: Spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xxl },
  footerText: { fontSize: FontSize.body },
  loginLink: { fontSize: FontSize.body, textTransform: 'none', letterSpacing: 0, paddingVertical: 0, minHeight: undefined },
});
