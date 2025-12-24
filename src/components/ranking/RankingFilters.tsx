import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Formation {
  id: string;
  name: string;
}

interface RankingFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  genderFilter: string;
  setGenderFilter: (gender: string) => void;
  formationFilter: string;
  setFormationFilter: (formationId: string) => void;
  formations: Formation[];
  isLoadingFormations: boolean;
  resetFilters: () => void;
  totalItems?: number;
  displayedItems?: number;
  isLoading?: boolean;
}

export default function RankingFilters({
  searchTerm,
  setSearchTerm,
  genderFilter,
  setGenderFilter,
  formationFilter,
  setFormationFilter,
  formations,
  isLoadingFormations,
  resetFilters,
  totalItems,
  displayedItems,
  isLoading,
}: RankingFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilters = searchTerm || genderFilter !== "ALL" || formationFilter !== "ALL";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t("learnerRanking.filters") ?? "Filtres et Recherche"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={
                t("learnerRanking.searchPlaceholder") ??
                "Rechercher par nom ou nom d'utilisateur..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Gender Filter */}
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue
                placeholder={
                  t("learnerRanking.filterByGender") ?? "Filtrer par genre"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("learnerRanking.allGenders") ?? "Tous les genres"}
              </SelectItem>
              <SelectItem value="MALE">
                {t("learnerRanking.male") ?? "Homme"}
              </SelectItem>
              <SelectItem value="FEMALE">
                {t("learnerRanking.female") ?? "Femme"}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Formation Filter */}
          <Select
            value={formationFilter}
            onValueChange={setFormationFilter}
            disabled={isLoadingFormations}
          >
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue
                placeholder={
                  t("learnerRanking.filterByFormation") ??
                  "Filtrer par formation..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("learnerRanking.allFormations") ?? "Toutes les formations"}
              </SelectItem>
              {formations.map((formation) => (
                <SelectItem key={formation.id} value={formation.id}>
                  {formation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="default"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {t("learnerRanking.resetFilters") ?? "Réinitialiser"}
            </Button>
          )}
        </div>

        {/* Results Summary */}
        {totalItems !== undefined && (
          <div className="mt-4 text-sm text-muted-foreground">
            {t("learnerRanking.showing") ?? "Affichage de"}{" "}
            {displayedItems ?? 0}{" "}
            {t("learnerRanking.of") ?? "sur"} {totalItems}{" "}
            {t("learnerRanking.learners") ?? "particuliers"}
            {isLoading && (
              <span className="ml-2 text-primary">
                • {t("learnerRanking.loading") ?? "Chargement..."}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
