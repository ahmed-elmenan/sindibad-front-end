import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionRequestService } from '../services/subscriptionRequest.service';
import { toast } from 'sonner';

// Types définis localement pour éviter les problèmes de cache
type SubscriptionRequestStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'ACTIVE' | 'EXPIRED';

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

const QUERY_KEY = 'subscription-requests';

/**
 * Hook pour récupérer toutes les demandes d'abonnement
 */
export const useSubscriptionRequests = (filters: SubscriptionFilters) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => subscriptionRequestService.getAllRequests(filters),
    staleTime: 30000, // 30 secondes
  });
};

/**
 * Hook pour accepter une demande
 */
export const useAcceptRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      data,
    }: {
      subscriptionId: string;
      data: ProcessSubscriptionDTO;
    }) => subscriptionRequestService.acceptRequest(subscriptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Demande acceptée avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Erreur lors de l\'acceptation';
      toast.error(message);
    },
  });
};

/**
 * Hook pour refuser une demande
 */
export const useRefuseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      data,
    }: {
      subscriptionId: string;
      data: RefuseRequestDTO;
    }) => subscriptionRequestService.refuseRequest(subscriptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Demande refusée');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Erreur lors du refus';
      toast.error(message);
    },
  });
};

/**
 * Hook pour uploader un reçu
 */
export const useUploadReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, file }: { subscriptionId: string; file: File }) =>
      subscriptionRequestService.uploadReceipt(subscriptionId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Reçu uploadé avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Erreur lors de l\'upload';
      toast.error(message);
    },
  });
};

/**
 * Hook pour supprimer un reçu
 */
export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) =>
      subscriptionRequestService.deleteReceipt(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Reçu supprimé');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Erreur lors de la suppression';
      toast.error(message);
    },
  });
};

/**
 * Hook pour remplacer un reçu
 */
export const useReplaceReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, file }: { subscriptionId: string; file: File }) =>
      subscriptionRequestService.replaceReceipt(subscriptionId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Reçu remplacé avec succès');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Erreur lors du remplacement';
      toast.error(message);
    },
  });
};

/**
 * Hook pour obtenir l'URL présignée d'un reçu
 */
export const useReceiptPresignedUrl = (subscriptionId: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'presigned-url', subscriptionId],
    queryFn: () => subscriptionRequestService.getReceiptPresignedUrl(subscriptionId!),
    enabled: !!subscriptionId,
    staleTime: 0, // Toujours refetch car l'URL expire
    retry: false,
  });
};
