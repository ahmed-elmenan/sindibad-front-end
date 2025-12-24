import api from "@/lib/axios";
import type { Skill } from "@/types/Skill";

/**
 * Fetch all skills from the backend
 */
export const getAllSkills = async (): Promise<Skill[]> => {
  try {
    const response = await api.get("/admin/skills");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    throw new Error(
      `Failed to fetch skills: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Create a new skill
 */
export const createSkill = async (data: {
  name: string;
  level: string;
  description?: string;
}): Promise<Skill> => {
  try {
    const response = await api.post("/skills", data);
    return response.data;
  } catch (error) {
    console.error("Failed to create skill:", error);
    throw new Error(
      `Failed to create skill: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Update an existing skill
 */
export const updateSkill = async (
  skillId: string,
  data: {
    name?: string;
    level?: string;
    description?: string;
  }
): Promise<Skill> => {
  try {
    const response = await api.patch(`/skills/${skillId}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update skill:", error);
    throw new Error(
      `Failed to update skill: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Delete a skill
 */
export const deleteSkill = async (skillId: string): Promise<void> => {
  try {
    await api.delete(`/skills/${skillId}`);
  } catch (error) {
    console.error("Failed to delete skill:", error);
    throw new Error(
      `Failed to delete skill: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Get skills for a specific lesson
 */
export const getLessonSkills = async (lessonId: string): Promise<Skill[]> => {
  try {
    const response = await api.get(`/lessons/${lessonId}/skills`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch lesson skills:", error);
    throw new Error(
      `Failed to fetch lesson skills: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Update skills for a lesson
 */
export const updateLessonSkills = async (
  lessonId: string,
  skillIds: string[]
): Promise<void> => {
  try {
    await api.put(`/lessons/${lessonId}/skills`, { skillIds });
  } catch (error) {
    console.error("Failed to update lesson skills:", error);
    throw new Error(
      `Failed to update lesson skills: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
