import { useRouteError, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function ErrorBoundary({ err }: { err?: Error }) {
  const routeError = useRouteError() as Error;
  const error = err || routeError;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full text-center space-y-8">
        {/* SVG Illustration */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <svg
            className="w-48 h-48 mx-auto relative z-10 animate-bounce"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Server body */}
            <rect
              x="60"
              y="80"
              width="80"
              height="100"
              rx="8"
              fill="currentColor"
              className="text-slate-300 dark:text-slate-600"
            />

            {/* Server front panel */}
            <rect
              x="65"
              y="85"
              width="70"
              height="90"
              rx="4"
              fill="currentColor"
              className="text-slate-400 dark:text-slate-500"
            />

            {/* Server lights - off */}
            <circle
              cx="75"
              cy="95"
              r="3"
              fill="#ef4444"
              className="animate-pulse"
            />
            <circle
              cx="85"
              cy="95"
              r="3"
              fill="#ef4444"
              className="animate-pulse"
            />
            <circle cx="95" cy="95" r="3" fill="#6b7280" />

            {/* Server vents */}
            <rect
              x="70"
              y="110"
              width="60"
              height="2"
              rx="1"
              fill="currentColor"
              className="text-slate-500"
            />
            <rect
              x="70"
              y="115"
              width="60"
              height="2"
              rx="1"
              fill="currentColor"
              className="text-slate-500"
            />
            <rect
              x="70"
              y="120"
              width="60"
              height="2"
              rx="1"
              fill="currentColor"
              className="text-slate-500"
            />

            {/* Error symbol */}
            <circle
              cx="100"
              cy="140"
              r="15"
              fill="#fef2f2"
              stroke="#ef4444"
              strokeWidth="2"
              className="animate-pulse"
            />
            <path
              d="M95 135 L105 145 M105 135 L95 145"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Smoke/steam effect */}
            <g className="animate-pulse opacity-60">
              <ellipse
                cx="85"
                cy="70"
                rx="3"
                ry="8"
                fill="currentColor"
                className="text-slate-400"
              />
              <ellipse
                cx="100"
                cy="65"
                rx="4"
                ry="10"
                fill="currentColor"
                className="text-slate-400"
              />
              <ellipse
                cx="115"
                cy="70"
                rx="3"
                ry="8"
                fill="currentColor"
                className="text-slate-400"
              />
            </g>

            {/* Base */}
            <rect
              x="55"
              y="175"
              width="90"
              height="8"
              rx="4"
              fill="currentColor"
              className="text-slate-300 dark:text-slate-600"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-red-500">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Erreur Serveur
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Oups ! Quelque chose s'est mal passé
          </h1>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {error?.message ||
              "Une erreur inattendue est survenue sur nos serveurs. Notre équipe technique a été notifiée et travaille à résoudre le problème."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="group">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Retour à l'accueil
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="group flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Réessayer
          </Button>
        </div>

        {/* Additional help */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Le problème persiste ?{" "}
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2"
            >
              Contactez notre support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
