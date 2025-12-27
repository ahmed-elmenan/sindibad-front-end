"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Building2, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

interface AccountOption {
  id: string
  titleKey: string
  descriptionKey: string
  icon: React.ReactNode
  color: string
  featuresKeys: string[]
  disabled?: boolean
}

const ChooseAccountType: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const accountOptions: AccountOption[] = [
    {
      id: "learner",
      titleKey: "chooseAccountType.learner.title",
      descriptionKey: "chooseAccountType.learner.description",
      icon: <GraduationCap className="size-8" />,
      color: "bg-gradient-to-br from-accent to-accent/70",
      featuresKeys: [
        "chooseAccountType.learner.features.skills",
        "chooseAccountType.learner.features.tracking",
        "chooseAccountType.learner.features.certificates",
      ],
      disabled: true,
    },
    {
      id: "organisation",
      titleKey: "chooseAccountType.organisation.title",
      descriptionKey: "chooseAccountType.organisation.description",
      icon: <Building2 className="size-8" />,
      color: "bg-gradient-to-br from-primary to-primary/70",
      featuresKeys: [
        "chooseAccountType.organisation.features.management",
        "chooseAccountType.organisation.features.dashboard",
        "chooseAccountType.organisation.features.ranking",
      ],
    },
  ]

  const handleAccountSelect = (accountType: string) => {
    navigate(`/signup?account=${accountType}`)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-3">{t("chooseAccountType.title")}</h1>
        <p className="text-muted-foreground max-w-md">{t("chooseAccountType.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {accountOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={option.disabled ? {} : { scale: 1.03 }}
            whileTap={option.disabled ? {} : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card
              className={`h-full relative ${
                option.disabled
                  ? "cursor-not-allowed bg-gray-50 border-2 border-gray-200 opacity-75"
                  : `cursor-pointer border-2 ${
                      option.id === "learner" ? "hover:border-accent" : "hover:border-primary"
                    }`
              } overflow-hidden`}
              onClick={() => !option.disabled && handleAccountSelect(option.id)}
            >
              {option.disabled && (
                <Badge
                  variant="secondary"
                  className="absolute top-4 right-4 z-10 bg-yellow-400 text-black border-yellow-500 font-medium shadow-sm"
                >
                  {t("chooseAccountType.comingSoon")}
                </Badge>
              )}

              <div className={`h-2 ${option.disabled ? "bg-gray-300" : option.color}`} />
              <CardHeader className="relative">
                <div
                  className={`absolute top-0 -mt-1 p-2 ${option.disabled ? "bg-gray-400 text-gray-600" : `${option.color} text-white`}
                    right-0 -mr-1 rounded-bl-lg
                    rtl:right-auto rtl:left-0 rtl:-ml-1 rtl:rounded-bl-none rtl:rounded-br-lg`}
                >
                  {option.icon}
                </div>
                <CardTitle className={`text-xl ${option.disabled ? "text-gray-500" : ""}`}>
                  {t(option.titleKey)}
                </CardTitle>
                <CardDescription className={option.disabled ? "text-gray-400" : ""}>
                  {t(option.descriptionKey)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {option.featuresKeys.map((featureKey, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div
                        className={`size-1.5 rounded-full ${
                          option.disabled ? "bg-gray-300" : option.id === "learner" ? "bg-accent" : "bg-primary"
                        }`}
                      />
                      <span className={option.disabled ? "text-gray-500" : ""}>{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={option.id === "learner" ? "accent" : "default"}
                  className={`w-full group ${
                    option.disabled ? "bg-gray-300 text-gray-500 hover:bg-gray-300 cursor-not-allowed" : ""
                  }`}
                  disabled={option.disabled}
                >
                  <span>{t("chooseAccountType.continue")}</span>
                  <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1 rtl:ml-0 rtl:mr-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ChooseAccountType
