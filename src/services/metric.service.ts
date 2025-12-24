import api from "@/lib/axios";
import type { AxiosError } from "axios";
import type { CompletedLessonsMetrics, MetricsOrganisation } from "@/types/Metrics";

/**
 * Vérifie et récupère la leçon sécurisée depuis le backend.
 * @param lessonId L'identifiant de la leçon
 */
export async function fetchMetricsForOrganisation(): Promise<MetricsOrganisation> {
  try {
    const response = await api.get(`/organisations/metrics`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch organisation metrics: ${error}`);
    handleApiError(error);
  }
}

export async function fetchCompletedLessons(period: string): Promise<CompletedLessonsMetrics> {
  try {
    const response = await api.get(`/organisations/metrics/completed-lessons`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch organisation metrics: ${error}`);
    handleApiError(error);
  }
}

function handleApiError(error: unknown): never {
  const axiosError = error as AxiosError;
  const message =
    typeof axiosError.response?.data === "string"
      ? axiosError.response.data
      : "Unknown error";
  console.error("API Error:", message);
  throw new Error(message);
}
