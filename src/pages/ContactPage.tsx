"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import  LoadingSpinner from "@/components/LoadingSpinner" // Assurez-vous que le chemin est correct
import { AlertCircle, CheckCircle, Send } from "lucide-react"
import { submitContactForm } from "@/services/contact.service" // Importez le service

export default function ContactPage() {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const isRTL = i18n.language === "ar"

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("contact.first_name_required")
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t("contact.last_name_required")
    }
    if (!formData.email) {
      newErrors.email = t("contact.email_required")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("contact.email_invalid")
    }
    if (!formData.message.trim()) {
      newErrors.message = t("contact.message_required")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setMessage(null)

    try {
      const success = await submitContactForm(formData) // Appel du service

      if (success) {
        setMessage({ type: "success", text: t("contact.message_sent") })
        setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" })
      } else {
        setMessage({ type: "error", text: t("contact.send_error") })
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire:", error)
      setMessage({ type: "error", text: t("contact.send_error") })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div
      className={`h-[80vh] flex items-center justify-center p-4 ${isRTL ? "rtl" : "ltr"}`}
      style={{ backgroundColor: "var(--background2)" }}
    >
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-primary">{t("contact.title")}</CardTitle>
            <CardDescription>{t("contact.description")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("contact.first_name")}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-destructive" : ""}
                    placeholder={t("contact.first_name")}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("contact.last_name")}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-destructive" : ""}
                    placeholder={t("contact.last_name")}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("contact.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                  placeholder={t("contact.email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">{t("contact.subject_optional")}</Label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder={t("contact.subject")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("contact.message")}</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className={`${errors.message ? "border-destructive" : ""} min-h-[120px]`}
                  placeholder={t("contact.message")}
                  disabled={isLoading}
                />
                {errors.message && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.message}
                  </p>
                )}
              </div>

              {message && (
                <div
                  className={`relative w-full rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${
                    message.type === "error" ? "border-destructive bg-destructive/10" : "border-accent bg-accent/10"
                  }`}
                >
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                  )}
                  <div className="text-foreground flex-1">
                    {" "}
                    {/* AJOUT DE flex-1 ICI */}
                    {message.text}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    {t("contact.loading")}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {t("contact.send")}
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
