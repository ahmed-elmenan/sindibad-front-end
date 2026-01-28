import api from "@/lib/axios";
import type { SummaryProfile } from "@/types/User";
import type { LearnerPayload } from '../types/Learner';
import { isAxiosError } from 'axios';

const TOKEN_KEY = "accessToken";

// Fonctions pour gérer le token dans localStorage
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    if (response.data.isActive === false || response.data.isActive === "false") {
      return { success: false, message: "Account is inactive", isActive: false };
    }

    if (response.data.accessToken) {
      setToken(response.data.accessToken);

      return {
        success: true,
        token: response.data.accessToken,
        id: response.data.id, 
        role: response.data.role,
        email: response.data.email,
        isActive: response.data.isActive === true || response.data.isActive === "true"
      };
    }

    return { success: false };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
};

export const logoutUser = (): void => {
  removeToken();
};

export const registerLearner = async (learnerData: LearnerPayload & { profilePicture?: File }) => {
  try {
    const formData = new FormData();
    
    // Add learner data as JSON string
    const learnerDto = {
      firstName: learnerData.firstName,
      lastName: learnerData.lastName,
      email: learnerData.email,
      phoneNumber: learnerData.phoneNumber,
      password: learnerData.password,
      dateOfBirth: learnerData.dateOfBirth ? new Date(learnerData.dateOfBirth).toLocaleDateString('fr-FR') : '',
      gender: learnerData.gender,
      isActive: learnerData.isActive ?? true,
      ...(learnerData.organisationId && { organisationId: learnerData.organisationId }),
    };
    
    // Add JSON data as a blob
    formData.append('learner', new Blob([JSON.stringify(learnerDto)], { type: 'application/json' }));
    
    // Add profile picture if provided
    if (learnerData.profilePicture) {
      formData.append('profilePicture', learnerData.profilePicture);
    }

    const response = await api.post("/learners/register", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("💥 Erreur dans registerLearner:", error);
    if (isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      const errorMessage = errorData?.error || errorData?.message || error.message;
      console.error("  Erreur backend:", errorMessage);
      
      if (error.response.status === 409) {
        // 409 Conflict - User already exists or duplicate data
        return {
          success: false,
          message: errorMessage || "A user with this email already exists.",
          field: errorData?.field // May contain which field caused the conflict
        };
      }
      
      if (error.response.status === 400) {
        // 400 Bad Request - Validation errors
        return {
          success: false,
          message: errorMessage || "Invalid data provided.",
          errors: errorData // May contain field-level errors
        };
      }
      
      return { success: false, message: errorMessage };
    } else {
      console.error("Error registering learner:", error);
      return { success: false, message: "An unexpected error occurred." };
    }
  }
};

export const activateAndResetPassword = async (
  token: string,
  newPassword: string
) => {
  try {
    const response = await api.post("/auth/activate-account-reset-password", {
      token,
      newPassword,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error activating and resetting password:", error);
    if (isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || error.message;
      return { success: false, message: errorMessage };
    } else {
      console.error("Error activating and resetting password:", error);
      return { success: false, message: "An unexpected error occurred." };
    }
  }
};

export const sendOTP = async (email: string) => {
  try {
    const response = await api.post("/auth/send-otp", { email });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error sending OTP:", error);
    if (isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || error.message;
      return { success: false, message: errorMessage };
    } else {
      console.error("Error sending OTP:", error);
      return { success: false, message: "An unexpected error occurred." };
    }
  }
};

export const verifyOTP = async (email: string, otp: string) => {
  try {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    if (isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || error.message;
      return { success: false, message: errorMessage };
    } else {
      console.error("Error verifying OTP:", error);
      return { success: false, message: "An unexpected error occurred." };
    }
  }
};

export const resetPassword = async (email: string, newPassword: string) => {
  try {
    const response = await api.post("/auth/reset-password", {
      email,
      newPassword,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error resetting password:", error);
    if (isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || error.message;
      return { success: false, message: errorMessage };
    } else {
      console.error("Error resetting password:", error);
      return { success: false, message: "An unexpected error occurred." };
    }
  }
};

export const getSummaryProfile = async (): Promise<
  SummaryProfile | undefined
> => {
  try {
    const response = await api.get("/auth/profile/summary");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const handleLogoutUser = async () => {
  try {
    await api.post("/auth/logout");
    removeToken();
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
