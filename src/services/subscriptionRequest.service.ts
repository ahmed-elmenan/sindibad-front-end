import api from "@/lib/axios";

// Types définis localement pour éviter les problèmes de cache
type SubscriptionRequestStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'ACTIVE' | 'EXPIRED';

interface SubscriptionRequest {
  id: string;
  organisationName: string;
  organisationAddress: string;
  organisationCity: string;
  organisationPhone: string;
  organisationEmail: string;
  responsibleFirstName: string;
  responsibleLastName: string;
  responsibleRole: string;
  responsiblePhone: string;
  responsibleEmail: string;
  packId: string;
  packName: string;
  packType: string;
  packPrice: number;
  packMonthDuration: number;
  maxTeachers: number;
  maxStudents: number;
  receiptPath: string | null;
  receiptFileName: string | null;
  status: SubscriptionRequestStatus;
  requestDate: string;
  processedAt: string | null;
  refusedReason: string | null;
  expirationDate: string | null;
}

interface SubscriptionFilters {
  searchTerm?: string;
  status?: SubscriptionRequestStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  size?: number;
}

interface ProcessSubscriptionDTO {
  processedBy: string;
}

interface RefuseRequestDTO {
  refusedReason: string;
  processedBy: string;
}

interface SubscriptionRequestsResponse {
  content: SubscriptionRequest[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isEmpty: boolean;
}

interface PresignedUrlResponse {
  presignedUrl: string;
  fileName: string;
}

const BASE_PATH = '/subscription-requests';

/**
 * Service pour la gestion des demandes d'abonnement
 */
export const subscriptionRequestService = {
  /**
   * Récupère toutes les demandes avec filtres et pagination
   */
  async getAllRequests(filters: SubscriptionFilters): Promise<SubscriptionRequestsResponse> {
    const params = new URLSearchParams();
    
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate.toString());
    if (filters.endDate) params.append('endDate', filters.endDate.toString());
    params.append('page', (filters.page ?? 0).toString());
    params.append('size', (filters.size ?? 20).toString());

    const response = await api.get<SubscriptionRequestsResponse>(
      `${BASE_PATH}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Accepte une demande d'abonnement
   */
  async acceptRequest(
    subscriptionId: string,
    data: ProcessSubscriptionDTO
  ): Promise<SubscriptionRequest> {
    const response = await api.post<SubscriptionRequest>(
      `${BASE_PATH}/${subscriptionId}/accept`,
      data
    );
    return response.data;
  },

  /**
   * Refuse une demande d'abonnement avec raison
   */
  async refuseRequest(
    subscriptionId: string,
    data: RefuseRequestDTO
  ): Promise<SubscriptionRequest> {
    const response = await api.post<SubscriptionRequest>(
      `${BASE_PATH}/${subscriptionId}/refuse`,
      data
    );
    return response.data;
  },

  /**
   * Upload un reçu pour une demande
   */
  async uploadReceipt(subscriptionId: string, file: File): Promise<SubscriptionRequest> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<SubscriptionRequest>(
      `${BASE_PATH}/${subscriptionId}/receipt`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Supprime le reçu d'une demande
   */
  async deleteReceipt(subscriptionId: string): Promise<SubscriptionRequest> {
    const response = await api.delete<SubscriptionRequest>(
      `${BASE_PATH}/${subscriptionId}/receipt`
    );
    return response.data;
  },

  /**
   * Remplace le reçu existant
   */
  async replaceReceipt(subscriptionId: string, file: File): Promise<SubscriptionRequest> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.put<SubscriptionRequest>(
      `${BASE_PATH}/${subscriptionId}/receipt`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Génère une URL présignée pour visualiser le reçu
   */
  async getReceiptPresignedUrl(subscriptionId: string): Promise<PresignedUrlResponse> {
    const response = await api.get<PresignedUrlResponse>(
      `${BASE_PATH}/${subscriptionId}/receipt/presigned-url`
    );
    return response.data;
  },
};
