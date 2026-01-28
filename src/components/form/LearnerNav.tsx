import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, BookOpen, Activity } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function LearnerNav() {
  const { user, logout } = useAuth();
  console.log('LearnerNav user:', user);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // suppress interceptor redirect flag
      if (typeof window !== "undefined") sessionStorage.setItem('suppressSessionRedirect','true');
      await logout();
      navigate("/signin");
    } catch (err) {
      console.error(err);
      setIsLoggingOut(false);
    } finally {
      if (typeof window !== "undefined") {
        setTimeout(() => sessionStorage.removeItem('suppressSessionRedirect'), 1500);
      }
    }
  };

  return (
    <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex items-center gap-2 px-2 py-1 border-0 bg-transparent hover:bg-primary/10 dark:hover:bg-primary/20 rounded-md transition-colors duration-200 ${isLoggingOut ? 'opacity-60 cursor-wait' : ''}`}
            disabled={isLoggingOut}
            aria-disabled={isLoggingOut}
            aria-busy={isLoggingOut}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? ""} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <AvatarFallback className={user?.avatar ? "" : "bg-accent text-white"}>
                {user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{user?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="min-w-[180px] border-0 shadow-none" aria-busy={isLoggingOut}>
          <DropdownMenuLabel className="p-2">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="hover:bg-primary/10 hover:text-primary">
            <Link to="/learners/account">
              <User className="mr-2 h-4 w-4" />Profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-primary/10 hover:text-primary">
            <Link to="/learners/courses">
              <BookOpen className="mr-2 h-4 w-4" />Mes cours
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:bg-primary/10 hover:text-primary">
            <Link to={user?.id ? `/learners/${user.id}/profile` : "/signin"}>
              <Activity className="mr-2 h-4 w-4" />Progression
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className={`cursor-pointer hover:bg-primary/10 hover:text-primary ${isLoggingOut ? 'pointer-events-none opacity-70' : ''}`}
            disabled={isLoggingOut}
            aria-disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Déconnexion...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" /> Déconnexion
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
