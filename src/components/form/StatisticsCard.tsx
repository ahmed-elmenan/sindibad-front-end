import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface StatisticsCardProps {
    title: string
    value: number
    description: string
    duration?: number
}

export function StatisticsCard({ title, value, description, duration = 2000 }: StatisticsCardProps) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTimestamp: number
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp
            const progress = timestamp - startTimestamp

            const percentage = Math.min(progress / duration, 1)
            setCount(Math.floor(value * percentage))

            if (progress < duration) {
                window.requestAnimationFrame(step)
            }
        }

        window.requestAnimationFrame(step)
    }, [value, duration])

    return (
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">{count}+</CardTitle>
                <CardDescription className="text-lg font-semibold">{title}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">{description}</p>
            </CardContent>
        </Card>
    )
}