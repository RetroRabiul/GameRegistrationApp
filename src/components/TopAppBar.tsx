import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
          <Text style={[styles.trophyIcon, { color: colors.primary }]}>🏆</Text>
          <Text
            style={[
              styles.appName,
              { color: colors.text, letterSpacing: 1 },
            ]}
          >
            ARENA
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.iconText, { color: colors.textMuted }]}>
              {isDark ? '☀' : '🌙'}
            </Text>
          </TouchableOpacity>

          {showLogout && (
            <TouchableOpacity
              onPress={signOut}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.iconText, { color: colors.error }]}>⏻</Text>
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
  trophyIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  appName: {
    fontSize: FontSize.heading + 2,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: Spacing.md,
    marginLeft: Spacing.sm,
  },
  iconText: {
    fontSize: 22,
  },
});
