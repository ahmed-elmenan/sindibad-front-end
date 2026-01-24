import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslation } from "react-i18next";

interface Formation {
  id: string;
  name: string;
}

interface RankingHeaderProps {
  selectedFormation?: Formation;
}

export default function RankingHeader({
  selectedFormation,
}: RankingHeaderProps) {
  usePageTitle("manageLearners");
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-2">
      <h1
        className="text-3xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-fr)" }}
      >
        🏆{" "}
        <span className="bg-gradient-to-r from-primary to-muted bg-clip-text text-transparent">
          {t("learnerRanking.title") ?? "Classement des particuliers"}
        </span>
      </h1>
      <p className="text-muted-foreground">
        {selectedFormation
          ? `${t("learnerRanking.rankingFor") ?? "Classement pour"} ${
              selectedFormation.name
            }`
          : (t("learnerRanking.subtitle") ??
            "Découvrez le classement de tous les particuliers")}
      </p>
    </div>
  );
}
