import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize } from '../constants';
import { useTheme } from '../theme/ThemeContext';
import { useAuthStore } from '../store/authStore';

interface TopAppBarProps {
  showLogout?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ showLogout = true }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { signOut } = useAuthStore();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.surfaceVariant,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.brand}>
          <Ionicons name="trophy" size={24} color={colors.primary} />
          <Text
            style={[
              styles.appName,
              { color: colors.text, letterSpacing: 1 },
            ]}
          >
            TOURNAMENT ARENA
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {showLogout && (
            <TouchableOpacity
              onPress={signOut}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    height: 56,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: FontSize.heading,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginLeft: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: Spacing.md,
    marginLeft: Spacing.sm,
  },
});
