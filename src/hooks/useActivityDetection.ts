import { useState, useEffect, useRef } from "react";

/**
 * Hook pour détecter l'activité de l'utilisateur
 * Marque l'utilisateur comme inactif après un certain délai sans interaction
 * 
 * @param timeoutMinutes Délai d'inactivité en minutes (défaut: 10)
 * @returns isActive - true si l'utilisateur est actif, false sinon
 * 
 * @example
 * ```tsx
 * const isActive = useActivityDetection(10);
 * 
 * if (!isActive) {
 *   console.log("L'utilisateur est inactif depuis 10 minutes");
 * }
 * ```
 */
export function useActivityDetection(timeoutMinutes: number = 10) {
  const [isActive, setIsActive] = useState(true);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetActivityTimer = () => {
      setIsActive(true);
      
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      // Marquer comme inactif après X minutes sans interaction
      activityTimeoutRef.current = setTimeout(() => {
        setIsActive(false);
      }, timeoutMinutes * 60 * 1000);
    };

    // Événements qui indiquent une activité
    const events = [
      'mousedown', 
      'mousemove', 
      'keypress', 
      'scroll', 
      'touchstart', 
      'click',
      'wheel'
    ];
    
    events.forEach(event => {
      document.addEventListener(event, resetActivityTimer, true);
    });

    resetActivityTimer(); // Init

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetActivityTimer, true);
      });
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [timeoutMinutes]);

  return isActive;
}
