import { IconTrendingUp, IconCertificate, IconUsers, IconBook, IconCreditCard } from "@tabler/icons-react"

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Données statiques pour les cartes
const cardsData = [
  {
    id: 1,
    icon: IconUsers,
    title: "Nombre total d'apprenants actifs",
    value: 125,
    trend: "+15%",
    trendPositive: true,
    description: "Croissance régulière des inscriptions",
    subDescription: "15 nouveaux apprenants ce mois-ci"
  },
  {
    id: 2,
    icon: IconBook,
    title: "Cours complétés",
    value: 42,
    trend: "+8%",
    trendPositive: true,
    description: "Progression constante",
    subDescription: "5 cours complétés cette semaine"
  },
  {
    id: 3,
    icon: IconCertificate,
    title: "Certificats émis",
    value: 28,
    trend: "+12%",
    trendPositive: true,
    description: "Bonne progression ce trimestre",
    subDescription: "3 nouveaux certificats cette semaine"
  },
  {
    id: 4,
    icon: IconCreditCard,
    title: "Paiements reçus (DHS)",
    value: "15,800",
    trend: "+20%",
    trendPositive: true,
    description: "Forte croissance des revenus",
    subDescription: "3 paiements aujourd'hui via CashPlus"
  }
]

export function SectionCardsForAdmin() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cardsData.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.id} className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <div className="flex justify-center items-center min-w-[22px] min-h-[22px]">
                  <Icon size={28} stroke={2.5} style={{width: "22px", height: "22px"}} className="text-primary" />
                </div>
                {card.title}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge 
                  variant="outline" 
                  className={card.trendPositive 
                    ? "text-emerald-600 border-emerald-600/20 bg-emerald-50"
                    : "text-red-600 border-red-600/20 bg-red-50"
                  }
                >
                  <IconTrendingUp 
                    size={18} 
                    stroke={2.5} 
                    style={{width: "18px", height: "18px", marginRight: "4px"}} 
                  />
                  {card.trend}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.description} 
                <IconTrendingUp size={20} stroke={2.5} style={{width: "20px", height: "20px"}} className="text-emerald-500" />
              </div>
              <div className="text-muted-foreground">
                {card.subDescription}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
