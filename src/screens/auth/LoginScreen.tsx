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

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error, clearError } = useAuthStore();
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

  const titleShadow = {
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: glowAnim,
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
              GAME REGISTRATION
            </Animated.Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </AnimatedCard>

          <AnimatedCard delay={200} style={styles.form}>
            <LinearGradient
              colors={[Colors.surface, Colors.surfaceLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formGradient}
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
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Button
                  title="Sign Up"
                  onPress={() => navigation.navigate('Signup')}
                  variant="outline"
                  style={styles.signupButton}
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
  loginButton: {
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
  signupButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
});
