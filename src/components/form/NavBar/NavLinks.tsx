import { Link } from "react-router-dom"

import { useTranslation } from "react-i18next";

export function NavLinks() {
    const { t } = useTranslation();
    
    return (
        <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse text-sm font-medium">
            <Link to="/home" className="transition-colors hover:text-foreground/80 text-foreground/60">{t("home")}</Link>
            <Link to="/courses" className="transition-colors hover:text-foreground/80 text-foreground/60">{t("courses.headerTitle")}</Link>
            <Link to="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">{t("about")}</Link>
            <Link to="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">{t("pricing")}</Link>
            <Link to="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">{t("contact_navbar")}</Link>
        </nav>
    )
}