import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export function Logo() {
    const { t } = useTranslation();
    
    return (
        <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse" title={t("navbar.logo.title")}>
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center" aria-label={t("navbar.logo.alt")}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </Link>
    )
}