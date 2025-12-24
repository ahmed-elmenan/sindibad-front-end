import { IconTrendingUp, IconCertificate, IconUsers, IconProgress, IconClock } from "@tabler/icons-react"

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <div className="flex justify-center items-center min-w-[22px] min-h-[22px]">
              <IconUsers size={28} stroke={2.5} style={{width: "22px", height: "22px"}} className="text-primary" />
            </div>
            Nombre total d'apprenants actifs
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            125
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-600 border-emerald-600/20 bg-emerald-50">
              <IconTrendingUp size={18} stroke={2.5} style={{width: "18px", height: "18px", marginRight: "4px"}} />
              +15%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Croissance régulière des inscriptions 
            <IconTrendingUp size={20} stroke={2.5} style={{width: "20px", height: "20px"}} className="text-emerald-500" />
          </div>
          <div className="text-muted-foreground">
            15 nouveaux apprenants ce mois-ci
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <div className="flex justify-center items-center min-w-[22px] min-h-[22px]">
              <IconProgress size={28} stroke={2.5} style={{width: "22px", height: "22px"}} className="text-primary" />
            </div>
            Taux de complétion des cours
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            78%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-600 border-emerald-600/20 bg-emerald-50">
              <IconTrendingUp size={18} stroke={2.5} style={{width: "18px", height: "18px", marginRight: "4px"}} />
              +8%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Progression constante 
            <IconTrendingUp size={20} stroke={2.5} style={{width: "20px", height: "20px"}} className="text-emerald-500" />
          </div>
          <div className="text-muted-foreground">
            Engagement des apprenants en hausse
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <div className="flex justify-center items-center min-w-[22px] min-h-[22px]">
              <IconCertificate size={28} stroke={2.5} style={{width: "22px", height: "22px"}} className="text-primary" />
            </div>
            Certificats délivrés
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            42
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-600 border-emerald-600/20 bg-emerald-50">
              <IconTrendingUp size={18} stroke={2.5} style={{width: "18px", height: "18px", marginRight: "4px"}} />
              +12%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Bonne progression ce trimestre 
            <IconTrendingUp size={20} stroke={2.5} style={{width: "20px", height: "20px"}} className="text-emerald-500" />
          </div>
          <div className="text-muted-foreground">
            5 nouveaux certificats ce mois-ci
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <div className="flex justify-center items-center min-w-[22px] min-h-[22px]">
              <IconClock size={28} stroke={2.5} style={{width: "22px", height: "22px"}} className="text-primary" />
            </div>
            Heures de formation consommées
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            256
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-600 border-emerald-600/20 bg-emerald-50">
              <IconTrendingUp size={18} stroke={2.5} style={{width: "18px", height: "18px", marginRight: "4px"}} />
              +20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Forte augmentation de l'engagement 
            <IconTrendingUp size={20} stroke={2.5} style={{width: "20px", height: "20px"}} className="text-emerald-500" />
          </div>
          <div className="text-muted-foreground">
            Dépasse les objectifs de formation
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
