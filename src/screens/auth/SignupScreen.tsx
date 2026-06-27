import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { AnimatedCard } from '../../components/AnimatedCard';
import { useAuthStore } from '../../store/authStore';

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
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
      Alert.alert(
        'Registration Successful',
        'Please check your email to verify your account, then sign in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else if (error) {
      Alert.alert('Signup Failed', error);
      clearError();
    }
  };

  return (
    <AnimatedBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AnimatedCard delay={0} style={styles.header}>
            <Text style={styles.logo}>🎮</Text>
            <Animated.Text style={[styles.title, { opacity: glowAnim }]}>
              CREATE ACCOUNT
            </Animated.Text>
            <Text style={styles.subtitle}>Join us for amazing game events</Text>
          </AnimatedCard>

          <AnimatedCard delay={200} style={styles.form}>
            <LinearGradient
              colors={[Colors.surface, Colors.surfaceLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formGradient}
            >
              <Input
                label="Full Name *"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
              />
              <Input
                label="Email *"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              <Input
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
              <Input
                label="Password *"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password (min 6 chars)"
                secureTextEntry
              />
              <Input
                label="Confirm Password *"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
              />

              <Button
                title="Sign Up"
                onPress={handleSignup}
                loading={loading}
                style={styles.signupButton}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Button
                  title="Sign In"
                  onPress={() => navigation.navigate('Login')}
                  variant="outline"
                  style={styles.loginButton}
                />
              </View>
            </LinearGradient>
          </AnimatedCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  form: {
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formGradient: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  signupButton: {
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  loginButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
});
