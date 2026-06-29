import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, CURRENCY_SYMBOL } from '../../constants';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useRegistrationStore } from '../../store/registrationStore';
import { useTheme } from '../../theme/ThemeContext';
import { MainStackParamList } from '../../navigation/MainNavigator';

interface PaymentScreenProps {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Payment'>;
  route: RouteProp<MainStackParamList, 'Payment'>;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
  const { registrationId, amount, eventTitle } = route.params;
  const { submitTransactionId, loading } = useRegistrationStore();
  const { colors } = useTheme();
  const [transactionId, setTransactionId] = useState('');

  const handleSubmit = async () => {
    if (!transactionId.trim() || transactionId.length < 10) {
      Alert.alert('Error', 'Please enter a valid bKash transaction ID (at least 10 characters)');
      return;
    }

    const result = await submitTransactionId(registrationId, transactionId.trim());

    if (result.success) {
      Alert.alert(
        'Transaction ID Submitted!',
        `${result.message}\n\nAn admin will verify your payment shortly. You will be notified once confirmed.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', result.message || 'Failed to submit transaction ID');
    }
  };

  const openBkashApp = () => {
    // Try to open bKash app (if installed)
    Linking.openURL('bkash://').catch(() => {
      Alert.alert('bKash App Not Found', 'Please open your bKash app manually and send payment to the merchant number provided by the event organizer.');
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Ionicons name="wallet-outline" size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Manual Payment</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Pay via bKash and submit transaction ID
        </Text>
      </View>

      <View
        style={[
          styles.amountCard,
          {
            borderColor: colors.primary + '40',
            backgroundColor: colors.primary + '0A',
          },
        ]}
      >
        <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Amount to Pay</Text>
        <Text style={[styles.amountValue, { color: colors.primary }]}>{CURRENCY_SYMBOL}{amount}</Text>
        <Text style={[styles.eventName, { color: colors.textMuted }]}>For: {eventTitle}</Text>
      </View>

      <Card style={styles.instructionsCard}>
        <View style={styles.instructionHeader}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.instructionTitle, { color: colors.text }]}>Payment Instructions</Text>
        </View>
        <Text style={[styles.instructionText, { color: colors.textMuted }]}>
          1. Open your bKash app{'\n'}
          2. Send {CURRENCY_SYMBOL}{amount} to the merchant number provided by event organizer{'\n'}
          3. Copy the Transaction ID from bKash{'\n'}
          4. Paste it below and submit
        </Text>
        <Button
          title="Open bKash App"
          onPress={openBkashApp}
          variant="secondary"
          style={styles.openBkashButton}
        />
      </Card>

      <Card style={styles.form}>
        <Input
          label="bKash Transaction ID *"
          value={transactionId}
          onChangeText={setTransactionId}
          placeholder="e.g., TXN1234567890"
          leadingIcon={<Ionicons name="receipt-outline" size={18} color={colors.textMuted} />}
        />

        <Button
          title="Submit Transaction ID"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </Card>

      <View style={styles.footer}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.tertiary} />
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          {' '}Your payment will be verified by admin before confirmation
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.body,
    textAlign: 'center',
  },
  amountCard: {
    margin: Spacing.xl,
    marginTop: 0,
    alignItems: 'center',
    borderWidth: 1,
  },
  amountLabel: {
    fontSize: FontSize.body,
    marginBottom: Spacing.xs,
  },
  amountValue: {
    fontSize: FontSize.display,
    fontWeight: '900',
    marginBottom: Spacing.xs,
  },
  eventName: {
    fontSize: FontSize.body,
  },
  instructionsCard: {
    margin: Spacing.xl,
    marginTop: 0,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  instructionTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: FontSize.body,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  openBkashButton: {
    marginTop: Spacing.md,
  },
  form: {
    margin: Spacing.xl,
    marginTop: 0,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: FontSize.caption,
    textAlign: 'center',
  },
});
