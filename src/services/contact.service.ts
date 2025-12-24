// src/services/contactService.ts
import api from "@/lib/axios"

export async function submitContactForm(formData: {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
}): Promise<boolean> {
  try {
    const response = await api.post("/contact", {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    })

    return response.data.success === true
  } catch (error: any) {
    console.error("Erreur d'envoi du message de contact :", error.response?.data || error.message)
    return false
  }
}
