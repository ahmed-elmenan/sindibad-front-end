import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Menu, Home, BookOpen, Info, DollarSign, Phone, X } from "lucide-react"
import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";

export function MobileMenu() {
    const { t } = useTranslation();
    return (
        <Sheet>
            <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label={t("navbar.mobile_menu.open")}> <Menu className="h-5 w-5" /> </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full max-w-full rounded-b-2xl p-0 bg-background/95 border-b border-muted-foreground/10 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-none [&_.sheet-overlay]:bg-transparent">
                {/* Header - visually connected to navbar */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-muted-foreground/10">
                    <Logo />
                    <SheetClose asChild>
                        <Button variant="ghost" size="icon" aria-label={t("navbar.mobile_menu.close")}> <X className="h-6 w-6" /> </Button>
                    </SheetClose>
                </div>
                {/* Navigation */}
                <nav className="flex flex-col gap-2 px-4 py-6">
                    <Link to="/" className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-colors hover:bg-accent/10 text-foreground">
                        <Home className="h-5 w-5" /> {t("home")}
                    </Link>
                    <Link to="/courses" className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-colors hover:bg-accent/10 text-foreground/80">
                        <BookOpen className="h-5 w-5" /> {t("courses.headerTitle")}
                    </Link>
                    <Link to="/about" className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-colors hover:bg-accent/10 text-foreground/80">
                        <Info className="h-5 w-5" /> {t("about")}
                    </Link>
                    <Link to="/pricing" className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-colors hover:bg-accent/10 text-foreground/80">
                        <DollarSign className="h-5 w-5" /> {t("pricing")}
                    </Link>
                    <Link to="/contact" className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-colors hover:bg-accent/10 text-foreground/80">
                        <Phone className="h-5 w-5" /> {t("contact.title")}
                    </Link>
                </nav>
                {/* Divider */}
                <div className="border-t border-muted-foreground/10 mx-4" />
                {/* Actions at bottom */}
                <div className="flex flex-col gap-3 px-4 py-6">
                    <Button variant="outline" asChild className="w-full text-base font-semibold">
                        <Link to="/signup">{t("signup")}</Link>
                    </Button>
                    <Button asChild className="w-full text-base font-semibold">
                        <Link to="/signin">{t("login")}</Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}