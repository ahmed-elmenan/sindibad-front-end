import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface NoDataStateProps {
  hasActiveFilters: boolean;
  resetFilters: () => void;
}

export default function NoDataState({
  hasActiveFilters,
  resetFilters,
}: NoDataStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-10 min-h-[40vh]">
      <img
        src="/no-data.svg"
        alt="Aucune donnée"
        className="w-64 h-64 mb-6 select-none pointer-events-none"
        draggable={false}
      />
      <h3 className="text-lg font-semibold mb-2">
        {hasActiveFilters
          ? t("learnerRanking.noLearnersFound") ?? "Aucun particulier trouvé"
          : t("learnerRanking.noData") ?? "Aucune donnée disponible"}
      </h3>
      <p className="text-muted-foreground mb-4">
        {hasActiveFilters
          ? t("learnerRanking.tryAdjusting") ??
            "Essayez d'ajuster vos filtres de recherche"
          : t("learnerRanking.noData") ??
            "Il n'y a actuellement aucun particulier à afficher"}
      </p>
      {hasActiveFilters && (
        <Button onClick={resetFilters} variant="outline">
          {t("learnerRanking.resetFilters") ?? "Réinitialiser les filtres"}
        </Button>
      )}
    </div>
  );
}
