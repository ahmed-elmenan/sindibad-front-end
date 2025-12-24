import type { AxiosError, AxiosResponse } from "axios";
import api from "@/lib/axios";
import type { CourseRanking, LearnerRanking } from "@/types";
import type { RankingFilters } from "@/types/Ranking";
import type { PaginatedResponse } from "@/types/Pagination";

export async function getLearnersRanking(
  filters: RankingFilters,
  userRole: string = "learners"
): Promise<PaginatedResponse<LearnerRanking>> {
  try {
    const params: Record<string, unknown> = {
      page: filters.page,
      size: filters.size,
    };

    // Ajout des filtres optionnels
    if (filters.gender && filters.gender !== "ALL") {
      params.gender = filters.gender;
    }

    if (filters.search && filters.search.trim() !== "") {
      params.search = filters.search.trim();
    }

    if (filters.formationId && filters.formationId !== "ALL") {
      params.formationId = filters.formationId;
    }

    const response: AxiosResponse<PaginatedResponse<LearnerRanking>> =
      await api.get(`/${userRole}/ranking`, { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getCoursesForRanking(): Promise<CourseRanking[]> {
  try {
    const response: AxiosResponse<CourseRanking[]> = await api.get(
      "/courses/ranking"
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

function handleApiError(error: unknown): never {
  let message: string;

  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError;
    const data = axiosError.response?.data;

    if (typeof data === "string") {
      message = data;
    } else if (data && typeof data === "object" && "message" in data) {
      message = (data as { message: string }).message;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = "Unknown error";
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = "Unknown error";
  }

  console.error("API Error:", message);
  throw new Error(message);
}
