import axios from "@/lib/axios"

const certificateService = {
  // Download certificate PDF from Spring Boot backend
  async downloadCertificate(courseId: string): Promise<Blob> {
    try {
      const response = await axios.get(`/api/certificates/download/${courseId}`, {
        responseType: "blob",
      })
      return response.data
    } catch (error) {
      console.error("Error downloading certificate:", error)
      throw new Error("Failed to download certificate")
    }
  },

  // Check if certificate exists (optional - if you have this endpoint)
  async certificateExists(courseId: string): Promise<boolean> {
    try {
      // This assumes you have a HEAD request or similar to check existence
      await axios.head(`/api/certificates/download/${courseId}`)
      return true
    } catch (error) {
      return false
    }
  },
}

export default certificateService
