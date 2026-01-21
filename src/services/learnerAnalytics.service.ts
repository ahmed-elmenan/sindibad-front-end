import api from "@/lib/axios";
import type { LearnerAnalyticsDTO, UpdateProgressDTO } from "@/types/learnerAnalytics";

/**
 * Service pour gérer les analytics des learners
 * Utilise les endpoints REST du backend
 */
export const learnerAnalyticsService = {
  /**
   * Récupère toutes les analytics d'un learner (profile, métriques, cours)
   * N'inclut PAS les certificats (chargés séparément)
   */
  getLearnerAnalytics: async (learnerId: string): Promise<LearnerAnalyticsDTO> => {
    const response = await api.get(`/learners/${learnerId}/analytics`);
    return response.data;
  },

  /**
   * Récupère uniquement les certificats d'un learner (lazy loading)
   */
  getLearnerCertificates: async (learnerId: string): Promise<any[]> => {
    const response = await api.get(`/learners/${learnerId}/certificates`);
    return response.data;
  },

  /**
   * Met à jour la progression d'un learner (temps passé, position dans le cours)
   * Appelé régulièrement depuis le frontend pendant que le learner est actif
   */
  updateLearnerProgress: async (data: UpdateProgressDTO): Promise<void> => {
    await api.put("/learners/progress", data);
  },
};
