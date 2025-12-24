import api from '@/lib/axios';
import type { PaymentMethod, PaymentMethodsResponse, ReceiptSubmissionResponse } from '@/types/Payment';

// API Functions
export const getPaymentMethods = async (): Promise<PaymentMethodsResponse> => {
  try {
    const response = await api.get<{ payment_methods: PaymentMethod[] }>('/payment-methods');
    return {
      success: true,
      data: response.data.payment_methods
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch payment methods',
      data: []
    };
  }
};

export const submitPaymentReceipt = async (
  file: File,
  paymentMethodId: number
): Promise<ReceiptSubmissionResponse> => {
  try {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('paymentMethodId', paymentMethodId.toString());

    const response = await api.post<ReceiptSubmissionResponse>(
      '/api/payments/submit-receipt',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      success: true,
      message: response.data.message || 'Receipt submitted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to submit receipt',
    };
  }
};
