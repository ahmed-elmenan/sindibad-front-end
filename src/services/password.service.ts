import axios from "@/lib/axios";

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const passwordService = {
  changePassword: async (data: ChangePasswordDTO): Promise<void> => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await axios.get("/learners/profile");
      const userEmail = response.data.email;
      if (!userEmail) {
        throw new Error("errors.auth.email_not_found");
      }
      await axios.post("/auth/change-password", {
        ...data,
        confirmNewPassword: data.newPassword
      }, {
        headers: {
          'X-User-Email': userEmail
        }
      });
    } catch (error: any) {
      
      throw error;
    }
  }
};