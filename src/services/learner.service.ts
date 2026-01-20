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

export const getLearnerFormData = async (id: string): Promise<any> => {
  try {
    const res = await api.get(`/learners/${id}/form-data`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching learner form data:', error);
    throw new Error(error.response?.data?.message || 'Error fetching learner form data');
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

export const updateLearner = async (id: string, data: Partial<Learner>): Promise<Learner> => {
  try {
    const res = await api.put(`/learners/${id}`, data);
    return res.data;
  } catch (error: any) {
    console.error('Error updating learner:', error);
    throw new Error(error.response?.data?.message || 'Error updating learner');
  }
};

export const deleteLearner = async (id: string): Promise<void> => {
  try {
    await api.delete(`/learners/${id}`);
  } catch (error: any) {
    console.error('Error deleting learner:', error);
    throw new Error(error.response?.data?.message || 'Error deleting learner');
  }
};

export const uploadProfilePicture = async (id: string, file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await api.post(`/learners/${id}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    throw new Error(error.response?.data?.message || 'Error uploading profile picture');
  }
};

export const sendPasswordResetEmail = async (id: string): Promise<void> => {
  try {
    await api.post(`/learners/${id}/reset-password`);
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    throw new Error(error.response?.data?.message || 'Error sending password reset email');
  }
};

export const toggleLearnerActiveStatus = async (id: string, isActive: boolean): Promise<void> => {
  try {
    await api.patch(`/learners/${id}/active-status`, null, {
      params: { isActive }
    });
  } catch (error: any) {
    console.error('Error toggling active status:', error);
    throw new Error(error.response?.data?.message || 'Error toggling active status');
  }
};
