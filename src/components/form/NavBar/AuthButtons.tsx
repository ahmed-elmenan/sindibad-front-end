import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export function AuthButtons() {
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuth(); // removed logout
    
    if (isAuthenticated) {
        return (
            <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
                <Button variant="ghost" asChild className="flex items-center gap-2 px-2">
                    <Link to="/learners/account">
                        <Avatar className="h-8 w-8">
                            <AvatarImage 
                                src={user?.avatar} 
                                alt={user?.name || t("profile")}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <AvatarFallback>
                                <User className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <span>{user?.name}</span>
                    </Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            <Button variant="ghost" asChild>
                <Link to="/signup">{t("signup")}</Link>
            </Button>
            <Button asChild>
                <Link to="/signin">{t("login")}</Link>
            </Button>
        </div>
    );
}