import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { bkashService } from '../../lib/bkash';
import { useRegistrationStore } from '../../store/registrationStore';
import { useTheme } from '../../theme/ThemeContext';
import { GameEvent } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';

interface PaymentScreenProps {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Payment'>;
  route: RouteProp<MainStackParamList, 'Payment'>;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
  const { registrationId, amount, eventTitle } = route.params;
  const { updatePaymentStatus } = useRegistrationStore();
  const { colors } = useTheme();
  const [bkashNumber, setBkashNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState('');
  const [paymentId, setPaymentId] = useState('');

  const handleInitiatePayment = async () => {
    if (!bkashNumber.trim() || bkashNumber.length < 11) {
      Alert.alert('Error', 'Please enter a valid bKash number');
      return;
    }

    setProcessing(true);
    const response = await bkashService.createPayment(amount, registrationId);
    setProcessing(false);

    if (response && response.paymentID) {
      setPaymentId(response.paymentID);
      setStep('otp');
      Alert.alert(
        'bKash Payment Request Sent',
        `A payment request of ৳${amount} has been sent to ${bkashNumber}.\n\nPlease check your bKash app and enter the OTP to confirm.`,
      );
    } else {
      Alert.alert('Error', 'Failed to initiate payment. Please try again.');
    }
  };

  const handleConfirmPayment = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setProcessing(true);
    const response = await bkashService.executePayment(paymentId);
    setProcessing(false);

    if (response && response.transactionID) {
      await bkashService.recordPayment(
        registrationId,
        amount,
        paymentId,
        response.transactionID,
        'completed'
      );
      await updatePaymentStatus(registrationId, 'paid');

      Alert.alert(
        'Payment Successful!',
        `Your payment of ৳${amount} for "${eventTitle}" has been confirmed.\n\nTransaction ID: ${response.transactionID}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      await bkashService.recordPayment(registrationId, amount, paymentId, '', 'failed');
      await updatePaymentStatus(registrationId, 'failed');
      Alert.alert('Payment Failed', 'Your payment could not be processed. Please try again.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.primary }]}>◈</Text>
        <Text style={[styles.title, { color: colors.text }]}>bKash Payment</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Complete your registration payment
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
        <Text style={[styles.amountValue, { color: colors.primary }]}>৳{amount}</Text>
        <Text style={[styles.eventName, { color: colors.textMuted }]}>For: {eventTitle}</Text>
      </View>

      <Card style={styles.form}>
        {step === 'input' ? (
          <>
            <Input
              label="bKash Number"
              value={bkashNumber}
              onChangeText={setBkashNumber}
              placeholder="01XXXXXXXXX"
              keyboardType="phone-pad"
            />
            <Button
              title="Send Payment Request"
              onPress={handleInitiatePayment}
              loading={processing}
              variant="secondary"
            />
          </>
        ) : (
          <>
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: colors.tertiary + '10',
                  borderColor: colors.tertiary + '30',
                },
              ]}
            >
              <Text style={[styles.infoText, { color: colors.text }]}>
                Payment request sent to {bkashNumber}{'\n'}
                Check your bKash app and confirm the payment.
              </Text>
            </View>
            <Input
              label="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP from bKash"
              keyboardType="numeric"
            />
            <Button
              title="Confirm Payment"
              onPress={handleConfirmPayment}
              loading={processing}
              variant="secondary"
            />
            <Button
              title="Cancel"
              onPress={() => setStep('input')}
              variant="outline"
              style={styles.cancelButton}
            />
          </>
        )}
      </Card>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Your payment is processed securely via bKash.
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
  logo: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '900',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.body,
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
  form: {
    margin: Spacing.xl,
    marginTop: 0,
  },
  infoBox: {
    borderRadius: BorderRadius.standard,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  infoText: {
    fontSize: FontSize.body,
    lineHeight: 22,
  },
  cancelButton: {
    marginTop: Spacing.md,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.caption,
    textAlign: 'center',
  },
});
