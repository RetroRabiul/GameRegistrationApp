import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import { useRegistrationStore } from '../../store/registrationStore';
import { useTheme } from '../../theme/ThemeContext';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { registrations, loading, fetchMyRegistrations } = useRegistrationStore();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyRegistrations();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => { await signOut(); },
        },
      ]
    );
  };

  const paidCount = registrations.filter(r => r.payment_status === 'paid').length;
  const pendingCount = registrations.filter(r => r.payment_status === 'pending').length;

  if (loading && registrations.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.full_name || 'User'}</Text>
        <Text style={[styles.email, { color: colors.textMuted }]}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
          <Ionicons
            name={user?.role === 'admin' ? 'shield-checkmark' : 'person'}
            size={14}
            color={colors.primary}
          />
          <Text style={[styles.roleText, { color: colors.primary }]}>
            {user?.role === 'admin' ? 'Admin' : 'Player'}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.tertiary }]}>{registrations.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.tertiary }]}>{paidCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Paid</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.gold }]}>{pendingCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pending</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <Card style={styles.menuCard}>
          <View style={[styles.menuItem, { borderBottomColor: colors.surfaceVariant }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Email</Text>
            </View>
            <Text style={[styles.menuValue, { color: colors.textMuted }]}>{user?.email}</Text>
          </View>
          <View style={[styles.menuItem, { borderBottomColor: colors.surfaceVariant }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="phone-portrait-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Phone</Text>
            </View>
            <Text style={[styles.menuValue, { color: colors.textMuted }]}>
              {user?.phone || 'Not set'}
            </Text>
          </View>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Member Since</Text>
            </View>
            <Text style={[styles.menuValue, { color: colors.textMuted }]}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Button title="Logout" onPress={handleLogout} variant="danger" style={styles.logoutButton} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  avatarText: { fontSize: FontSize.hero, fontWeight: '900' },
  name: { fontSize: FontSize.hero, fontWeight: '900', marginBottom: Spacing.sm },
  email: { fontSize: FontSize.body, marginBottom: Spacing.md },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: BorderRadius.metric, borderWidth: 1 },
  roleText: { fontSize: FontSize.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl, gap: Spacing.md },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg },
  statValue: { fontSize: FontSize.hero, fontWeight: '900', marginBottom: Spacing.xs },
  statLabel: { fontSize: FontSize.label, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSize.cardTitle, fontWeight: '800', marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuLabel: { fontSize: FontSize.body, fontWeight: '600' },
  menuValue: { fontSize: FontSize.body },
  logoutButton: { marginTop: Spacing.md },
});
