import { useQuery } from '@tanstack/react-query';
import { getLearnerProfileById, getLearnerCourses } from '@/services/learner.service';

// Hook pour récupérer le profil d'un apprenant
export const useLearnerProfile = (learnerId: string | undefined) => {
  return useQuery({
    queryKey: ['learner', learnerId],
    queryFn: () => getLearnerProfileById(learnerId!),
    enabled: !!learnerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook pour récupérer les cours d'un apprenant
export const useLearnerCourses = (learnerId: string | undefined) => {
  return useQuery({
    queryKey: ['learnerCourses', learnerId],
    queryFn: () => getLearnerCourses(learnerId!),
    enabled: !!learnerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
