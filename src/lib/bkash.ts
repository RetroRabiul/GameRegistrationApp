import { supabase } from './supabase';
import { BKASH_CONFIG } from '../constants';

interface BkashPaymentResponse {
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  statusCode: string;
  statusMessage: string;
}

interface BkashExecuteResponse {
  paymentID: string;
  transactionID: string;
  statusCode: string;
  statusMessage: string;
}

export const bkashService = {
  createPayment: async (amount: number, registrationId: string): Promise<BkashPaymentResponse | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('bkash-create-payment', {
        body: { amount, registrationId },
      });

      if (error) throw error;
      return data as BkashPaymentResponse;
    } catch (error) {
      console.error('bKash create payment error:', error);
      return null;
    }
  },

  executePayment: async (paymentID: string): Promise<BkashExecuteResponse | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('bkash-execute-payment', {
        body: { paymentID },
      });

      if (error) throw error;
      return data as BkashExecuteResponse;
    } catch (error) {
      console.error('bKash execute payment error:', error);
      return null;
    }
  },

  recordPayment: async (
    registrationId: string,
    amount: number,
    bkashPaymentId: string,
    bkashTransactionId: string,
    status: 'completed' | 'failed'
  ) => {
    try {
      const { error } = await supabase.from('payments').insert({
        registration_id: registrationId,
        amount,
        bkash_payment_id: bkashPaymentId,
        bkash_transaction_id: bkashTransactionId,
        status,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Record payment error:', error);
      return false;
    }
  },
};
