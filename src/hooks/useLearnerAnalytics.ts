import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { learnerAnalyticsService } from "@/services/learnerAnalytics.service";
import type { UpdateProgressDTO } from "@/types/learnerAnalytics";

/**
 * Hook pour récupérer les analytics d'un learner (sans certificats)
 * Cache: 5 minutes
 */
export function useLearnerAnalytics(learnerId: string) {
  return useQuery({
    queryKey: ["learner-analytics", learnerId],
    queryFn: () => learnerAnalyticsService.getLearnerAnalytics(learnerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!learnerId,
  });
}

/**
 * Hook pour récupérer les certificats d'un learner (lazy loading)
 * Ne se charge QUE quand l'utilisateur switch vers l'onglet Certificats
 * Cache: 10 minutes (les certificats changent rarement)
 */
export function useLearnerCertificates(learnerId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ["learner-certificates", learnerId],
    queryFn: () => learnerAnalyticsService.getLearnerCertificates(learnerId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: enabled && !!learnerId, // Ne se charge que si enabled=true
  });
}

/**
 * Hook pour mettre à jour la progression d'un learner
 * Utilisé pour le tracking du temps passé et de la position dans le cours
 */
export function useUpdateLearnerProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProgressDTO) => 
      learnerAnalyticsService.updateLearnerProgress(data),
    onSuccess: (_, variables) => {
      // Invalider le cache des analytics pour rafraîchir les données
      queryClient.invalidateQueries({
        queryKey: ["learner-analytics", variables.learnerId],
      });
    },
    onError: (error) => {
      console.error("Failed to update learner progress:", error);
    },
  });
}

/**
 * Hook personnalisé pour le tracking automatique du temps passé
 * À utiliser dans les pages de cours pour envoyer des updates réguliers
 * 
 * @param learnerId ID du learner
 * @param courseId ID du cours
 * @param intervalMinutes Intervalle en minutes entre chaque update (défaut: 5)
 * @returns Fonction pour arrêter le tracking
 * 
 * @example
 * ```tsx
 * const { startTracking, stopTracking } = useProgressTracking(learnerId, courseId);
 * 
 * useEffect(() => {
 *   startTracking();
 *   return () => stopTracking();
 * }, []);
 * ```
 */
export function useProgressTracking(
  learnerId: string | undefined,
  courseId: string | undefined,
  intervalMinutes: number = 5
) {
  const updateProgress = useUpdateLearnerProgress();
  let trackingInterval: NodeJS.Timeout | null = null;

  const startTracking = () => {
    if (!learnerId || !courseId || trackingInterval) return;

    // Envoyer un update immédiatement au démarrage
    updateProgress.mutate({
      learnerId,
      courseId,
      additionalTimeMinutes: 0,
    });

    // Puis envoyer des updates réguliers
    trackingInterval = setInterval(() => {
      updateProgress.mutate({
        learnerId,
        courseId,
        additionalTimeMinutes: intervalMinutes,
      });
    }, intervalMinutes * 60 * 1000); // Convertir en millisecondes
  };

  const stopTracking = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
  };

  return { startTracking, stopTracking, isTracking: !!trackingInterval };
}
