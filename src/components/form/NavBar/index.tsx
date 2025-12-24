import { Logo } from "./Logo"
import { NavLinks } from "./NavLinks"
import { AuthButtons } from "./AuthButtons"
import { MobileMenu } from "./MobileMenu"
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function NavBar() {

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
                {/* Left side for LTR, Right side for RTL */}
                <div className="flex items-center space-x-6 rtl:space-x-reverse">
                    <Logo />
                    <NavLinks />
                </div>

                {/* Right side for LTR, Left side for RTL */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <LanguageSwitcher />
                    <AuthButtons />
                    <MobileMenu />
                </div>
            </div>
        </header>
    )
}