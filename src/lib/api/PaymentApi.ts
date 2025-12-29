import { apiClient } from './axios';

export interface CreatePaymentLinkRequest {
  ticketId: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreatePaymentLinkResponse {
  checkoutUrl: string;
  success: boolean;
  orderCode: number;
  qrCode: string;
}

export const PayOsPayment = {
  createPaymentLink: async (data: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> => {
    const response = await apiClient.post<CreatePaymentLinkResponse>(
      '/booking/payments/create-link',
      data,
    );
    return response.data;
  },
};
