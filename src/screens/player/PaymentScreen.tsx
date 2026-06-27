import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { bkashService } from '../../lib/bkash';
import { useRegistrationStore } from '../../store/registrationStore';
import { GameEvent } from '../../types';

type PlayerStackParamList = {
  EventList: undefined;
  EventDetail: { event: GameEvent };
  MyRegistrations: undefined;
  Payment: { eventId: string; registrationId: string; amount: number; eventTitle: string };
};

interface PaymentScreenProps {
  navigation: NativeStackNavigationProp<PlayerStackParamList, 'Payment'>;
  route: RouteProp<PlayerStackParamList, 'Payment'>;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
  const { registrationId, amount, eventTitle } = route.params;
  const { updatePaymentStatus } = useRegistrationStore();
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
        [{ text: 'OK', onPress: () => navigation.navigate('MyRegistrations') }]
      );
    } else {
      await bkashService.recordPayment(registrationId, amount, paymentId, '', 'failed');
      await updatePaymentStatus(registrationId, 'failed');
      Alert.alert('Payment Failed', 'Your payment could not be processed. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.logo}>💳</Text>
        <Text style={styles.title}>bKash Payment</Text>
        <Text style={styles.subtitle}>Complete your registration payment</Text>
      </View>

      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>
        <Text style={styles.amountValue}>৳{amount}</Text>
        <Text style={styles.eventName}>For: {eventTitle}</Text>
      </View>

      <View style={styles.form}>
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
              style={styles.payButton}
            />
          </>
        ) : (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ✅ Payment request sent to {bkashNumber}{'\n'}
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
              style={styles.payButton}
            />
            <Button
              title="Cancel"
              onPress={() => setStep('input')}
              variant="outline"
              style={styles.cancelButton}
            />
          </>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your payment is processed securely via bKash.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  logo: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  amountCard: {
    backgroundColor: Colors.primary + '10',
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  amountLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  amountValue: {
    fontSize: FontSize.title,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  eventName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  form: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoBox: {
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  payButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.secondary,
  },
  cancelButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
