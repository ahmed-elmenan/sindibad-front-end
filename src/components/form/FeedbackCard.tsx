import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface FeedbackCardProps {
    name: string
    feedback: string
    imageUrl: string
    rating: number
}

export function FeedbackCard({ name, feedback, imageUrl, rating }: FeedbackCardProps) {
    return (
        <Card className="rounded-2xl border border-muted-foreground/10 bg-white shadow-sm flex flex-col justify-between h-full">
            <CardContent className="flex flex-col h-full p-8 pb-6">
                <div className="text-left text-lg text-foreground mb-4 flex-1">
                    {feedback}
                </div>
                <div className="flex items-center mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                            key={i}
                            className={`h-5 w-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted-foreground/20 text-muted-foreground/20'}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-muted-foreground/10 mt-auto">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={imageUrl} alt={name} />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-lg text-foreground">{name}</span>
                </div>
            </CardContent>
        </Card>
    )
}