import type { Learner, LearnerProfile, LearnerCourse } from "@/types/Learner";
import axios from "@/lib/axios";
import api from "@/lib/axios";
import type { UpdateLearnerProfileDTO, ResetPasswordDTO } from "@/schemas/learnerServiceSchema";

export const learnerService = {
  getLearnerProfile: async (): Promise<Learner> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await axios.get("/learners/profile", {
        headers: {
          'X-User-Email': localStorage.getItem('userEmail') || ''
        }
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  updateLearnerProfile: async (data: UpdateLearnerProfileDTO): 
  Promise<Learner> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await axios.put("/learners/profile", data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  deleteLearnerAccount: async (): Promise<void> => {
    // eslint-disable-next-line no-useless-catch
    try {
      await axios.post("/learners/deactivate");
    } catch (error: any) {
      throw error;
    }
  },

  resetPassword: async (data: ResetPasswordDTO): Promise<void> => {
    // eslint-disable-next-line no-useless-catch
    try {
      await axios.post("/learners/reset-password", data);
    } catch (error) {
      throw error;
    }
  },
};

export const getLearnerProfileById = async (id: string): Promise<LearnerProfile> => {
  try {
    const res = await api.get(`/learners/${id}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching learner profile:', error);
    throw new Error(error.response?.data?.message || 'Error fetching learner profile');
  }
};

export const getLearnerCourses = async (id: string): Promise<LearnerCourse[]> => {
  try {
    const res = await api.get(`/learners/${id}/courses`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching learner courses:', error);
    throw new Error(error.response?.data?.message || 'Error fetching learner courses');
  }
};
