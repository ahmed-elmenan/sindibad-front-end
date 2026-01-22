import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { learnerAnalyticsService } from "@/services/learnerAnalytics.service";
import type { UpdateProgressDTO } from "@/types/learnerAnalytics";
import { useState, useEffect, useRef } from "react";

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
 * Utilise Page Visibility API pour ne compter que le temps réellement actif
 * Sauvegarde automatiquement avant la fermeture de la page
 * 
 * @param learnerId ID du learner
 * @param courseId ID du cours
 * @param intervalMinutes Intervalle en minutes entre chaque update (défaut: 5)
 * @returns { startTracking, stopTracking, currentTime }
 * 
 * @example
 * ```tsx
 * const { startTracking, stopTracking, currentTime } = useProgressTracking(learnerId, courseId);
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
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [accumulatedTime, setAccumulatedTime] = useState(0); // en secondes
  const lastUpdateRef = useRef(Date.now());
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTrackingRef = useRef(false);

  // 🔍 Détecter si la page est visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsPageVisible(isVisible);
      
      if (isVisible) {
        // Remettre à jour le timestamp quand l'utilisateur revient
        lastUpdateRef.current = Date.now();
      } else {
        // Sauvegarder le temps accumulé quand l'utilisateur part
        saveCurrentTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [accumulatedTime, learnerId, courseId]);

  // ⏱️ Accumuler le temps toutes les secondes (seulement si page visible et tracking actif)
  useEffect(() => {
    if (!isPageVisible || !isTrackingRef.current) return;

    const timer = setInterval(() => {
      setAccumulatedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPageVisible, isTrackingRef.current]);

  // 📤 Envoyer au serveur quand on atteint l'intervalle
  useEffect(() => {
    if (accumulatedTime >= intervalMinutes * 60) {
      sendTimeToServer();
    }
  }, [accumulatedTime, learnerId, courseId, intervalMinutes]);

  const sendTimeToServer = () => {
    if (accumulatedTime === 0 || !learnerId || !courseId) return;

    const minutesToSend = Math.floor(accumulatedTime / 60);
    
    if (minutesToSend > 0) {
      updateProgress.mutate({
        learnerId,
        courseId,
        additionalTimeMinutes: minutesToSend,
      }, {
        onSuccess: () => {
          setAccumulatedTime(0); // Reset après envoi réussi
          lastUpdateRef.current = Date.now();
        },
        onError: (error) => {
          console.error("Failed to save progress time:", error);
        }
      });
    }
  };

  const saveCurrentTime = () => {
    sendTimeToServer();
  };

  // 🚪 Sauvegarder avant de quitter la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (accumulatedTime > 0) {
        // Utiliser sendBeacon pour envoyer les données de manière fiable
        const minutesToSend = Math.floor(accumulatedTime / 60);
        if (minutesToSend > 0 && learnerId && courseId) {
          const data = JSON.stringify({
            learnerId,
            courseId,
            additionalTimeMinutes: minutesToSend,
          });
          
          // sendBeacon envoie les données même si la page se ferme
          navigator.sendBeacon('/api/v1/learners/progress', data);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [accumulatedTime, learnerId, courseId]);

  const startTracking = () => {
    if (!learnerId || !courseId || isTrackingRef.current) return;
    
    isTrackingRef.current = true;
    lastUpdateRef.current = Date.now();
    setAccumulatedTime(0);
  };

  const stopTracking = () => {
    if (!isTrackingRef.current) return;
    
    isTrackingRef.current = false;
    saveCurrentTime();
    
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  };

  return { 
    startTracking, 
    stopTracking, 
    currentTime: accumulatedTime,
    isTracking: isTrackingRef.current 
  };
}
