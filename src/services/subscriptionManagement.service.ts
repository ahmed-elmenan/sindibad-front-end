import api from "@/lib/axios";

export interface UpdateStatusRequest {
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
}

export const updateSubscriptionStatus = async (
  subscriptionId: string,
  status: string
): Promise<any> => {
  const response = await api.put(
    `/subscription-requests/${subscriptionId}/status`,
    null,
    {
      params: { status },
    }
  );
  return response.data;
};

export const replaceSubscriptionReceipt = async (
  subscriptionId: string,
  file: File
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.put(
    `/subscription-requests/${subscriptionId}/receipt`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const getReceiptPresignedUrl = async (
  subscriptionId: string
): Promise<string> => {
  const response = await api.get(
    `/subscription-requests/${subscriptionId}/receipt/presigned-url`
  );
  return response.data;
};
