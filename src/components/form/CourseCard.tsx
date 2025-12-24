import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CourseCardProps {
    title: string
    description: string
    imageUrl: string
    duration: string
    level: string
    instructor: string
}

export function CourseCard({ title, description, imageUrl, duration, level, instructor }: CourseCardProps) {
    return (
        <Card className="overflow-hidden bg-white rounded-2xl shadow-md border border-muted-foreground/10 flex flex-col h-full">
            <div className="aspect-video w-full overflow-hidden">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            </div>
            <CardContent className="flex-1 flex flex-col justify-between p-6 pt-3">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2">
                            <span className="bg-muted-foreground/10 text-foreground/80 text-xs font-medium px-3 py-1 rounded-full">{duration}</span>
                            <span className="bg-muted-foreground/10 text-foreground/80 text-xs font-medium px-3 py-1 rounded-full">{level}</span>
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">By {instructor}</span>
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground mb-1 text-left pt-4">{title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mb-4 text-left">{description}</CardDescription>
                </div>
                <Button className="w-full mt-2" variant="outline">Get it Now</Button>
            </CardContent>
        </Card>
    )
}