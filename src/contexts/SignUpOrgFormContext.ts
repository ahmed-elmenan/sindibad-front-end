"use client"

import { createContext, useContext } from "react"
import type { SignUpOrgFormData } from "@/schemas/signUpOrgFormShema"

interface FormContextType {
  formData: Partial<SignUpOrgFormData>
  updateFormData: (step: keyof SignUpOrgFormData, data: unknown) => void
  currentStep: number
  setCurrentStep: (step: number) => void
}

export const SignUpOrgFormContext = createContext<FormContextType>({
  formData: {},
  updateFormData: () => {},
  currentStep: 0,
  setCurrentStep: () => {},
})

export const useFormContext = () => {
  const context = useContext(SignUpOrgFormContext)
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider")
  }
  return context
}
