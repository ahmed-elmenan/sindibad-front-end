import { Card } from "@/components/ui/card"

interface TeamMemberCardProps {
    name: string
    role: string
    imageUrl: string
}

export function TeamMemberCard({ name, role, imageUrl }: TeamMemberCardProps) {
    return (
        <Card className="relative flex flex-col items-center pt-12 p-6 px-4 bg-white rounded-2xl shadow-md border border-muted-foreground/10 overflow-visible">
            {/* Pop-out Avatar */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full shadow-lg border-4 border-white bg-white overflow-hidden flex items-center justify-center">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover rounded-full"
                />
            </div>
            {/* Name and Role */}
            <div className="mt-10 text-center w-full">
                <div className="font-bold text-xl text-foreground mb-1">{name}</div>
                <div className="text-sm text-muted-foreground mb-4">{role}</div>
            </div>
            {/* Social Icons Row (placeholders) */}
            <div className="flex justify-center gap-3 ">
                <a href="#" className="p-2 rounded-full bg-muted-foreground/10 hover:bg-muted-foreground/20 transition-colors">
                    <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 10.268h-3v-4.604c0-1.099-.021-2.513-1.531-2.513-1.531 0-1.767 1.197-1.767 2.434v4.683h-3v-9h2.881v1.233h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v4.731z"/></svg>
                </a>
                <a href="#" className="p-2 rounded-full bg-muted-foreground/10 hover:bg-muted-foreground/20 transition-colors">
                    <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.555-2.005.959-3.127 1.184a4.916 4.916 0 0 0-8.38 4.482c-4.083-.205-7.697-2.162-10.125-5.138a4.822 4.822 0 0 0-.666 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417a9.867 9.867 0 0 1-6.102 2.104c-.396 0-.787-.023-1.175-.069a13.945 13.945 0 0 0 7.548 2.212c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636a10.012 10.012 0 0 0 2.457-2.548z"/></svg>
                </a>
            </div>
        </Card>
    )
}