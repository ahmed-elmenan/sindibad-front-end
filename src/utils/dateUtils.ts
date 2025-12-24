import type { TFunction } from 'i18next';
import i18n from '../i18n';

/**
 * Formate une date en temps relatif (ex: "il y a 2 heures")
 * @param dateString - La date à formater (format ISO string)
 * @param t - La fonction de traduction i18next
 * @returns Le temps relatif formaté
 */
export function formatRelativeTime(dateString: string, t: TFunction): string {
  // S'assurer que la date est valide
  if (!dateString) return t("time.justNow");
  
  try {
    const now = new Date();
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return t("time.justNow");
    }
    
    const diffMs = now.getTime() - date.getTime();
    // Si la différence est négative ou très petite, c'est maintenant
    if (diffMs < 1000) return t("time.justNow");
    
    const diff = Math.floor(diffMs / 1000); // en secondes
    
    if (diff < 60)
      return `${t("time.ago")} ${diff} ${t("time.seconds")}`;
    if (diff < 3600)
      return `${t("time.ago")} ${Math.floor(diff / 60)} ${t("time.minutes")}`;
    if (diff < 86400)
      return `${t("time.ago")} ${Math.floor(diff / 3600)} ${t("time.hours")}`;
    if (diff < 2592000)
      return `${t("time.ago")} ${Math.floor(diff / 86400)} ${t("time.days")}`;
    if (diff < 31536000)
      return `${t("time.ago")} ${Math.floor(diff / 2592000)} ${t("time.months")}`;
    
    const years = Math.floor(diff / 31536000);
    return `${t("time.ago")} ${years} ${years > 1 ? t("time.years") : t("time.year")}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return t("time.justNow");
  }
}

/**
 * Mapping des codes de langue i18n vers les locales DateTimeFormat
 */
const LANGUAGE_TO_LOCALE_MAP: Record<string, string> = {
  fr: "fr-FR",
  ar: "ar-MA",
  en: "en-US",
  // Ajouter d'autres mappings selon les besoins
};

/**
 * Obtient la locale appropriée pour la langue courante
 * @param language - Le code de langue (optionnel, utilise la langue courante de i18n par défaut)
 * @returns La locale correspondante
 */
export function getCurrentLocale(language?: string): string {
  const currentLanguage = language || i18n.language || "fr";
  return LANGUAGE_TO_LOCALE_MAP[currentLanguage] || LANGUAGE_TO_LOCALE_MAP.fr;
}

/**
 * Formate une date au format court (ex: "15/08/2024")
 * @param dateString - La date à formater
 * @param currentLanguage - La langue actuelle de i18n (optionnel, utilise "fr" par défaut)
 * @param t - Fonction de traduction optionnelle pour les messages d'erreur
 * @returns La date formatée
 */
export function formatDate(dateString: string | undefined, currentLanguage: string = "fr", t?: TFunction): string {
  if (!dateString) return t ? t("lessonPage.unknownDate") : "Date inconnue";
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return t ? t("lessonPage.unknownDate") : "Date invalide";
    }

    // Obtenir la locale correspondante à la langue courante
    const locale = LANGUAGE_TO_LOCALE_MAP[currentLanguage] || LANGUAGE_TO_LOCALE_MAP.fr;
    
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return t ? t("lessonPage.unknownDate") : "Date invalide";
  }
}

/**
 * Formate une date au format court en utilisant automatiquement la langue courante de i18n
 * @param dateString - La date à formater
 * @param t - Fonction de traduction optionnelle pour les messages d'erreur
 * @returns La date formatée
 */
export function formatDateWithCurrentLocale(dateString: string | undefined, t?: TFunction): string {
  return formatDate(dateString, i18n.language, t);
}

/**
 * Formate une durée en secondes en format lisible (ex: "2h 30min")
 * @param seconds - Durée en secondes
 * @param t - La fonction de traduction i18next
 * @returns La durée formatée
 */
export function formatDuration(seconds: number, t: TFunction): string {
  if (seconds < 60) return `${seconds} ` + t("time.seconds");

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (seconds < 3600) {
    return `${minutes} ` + t("time.minutes") + `${remainingSeconds > 0 ? ` ${remainingSeconds} ` + t("time.seconds") : ""}`;
  }

  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);

  return `${hours} ` + t("time.hours") + `${remainingMinutes > 0 ? ` ${remainingMinutes} ` + t("time.minutes") : ""}${remainingSeconds > 0 ? ` ${remainingSeconds} ` + t("time.seconds") : ""}`;
}

/**
 * Formate une durée en secondes en format court (ex: "1h 40min 20sec")
 * N'affiche que les unités non nulles
 * @param totalSeconds - Durée totale en secondes
 * @returns La durée formatée (ex: "1h 40min 20sec", "45min 30sec", "30sec")
 */
export function formatDurationSimple(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0sec";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}min`);
  }
  if (seconds > 0) {
    parts.push(`${seconds}sec`);
  }

  return parts.join(" ") || "0sec";
}
