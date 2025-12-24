import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getLearnersRanking,
  getCoursesForRanking,
} from "@/services/ranking.service";
import { useDebounce } from "@/hooks/useDebounce";
import type { RankingFilters } from "@/types/Ranking";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import des composants extraits
import {
  RankingFilters as FiltersComponent,
  RankingTable as TableComponent,
  RankingPagination as PaginationComponent,
  NoDataState as NoDataComponent,
  RankingHeader as HeaderComponent,
} from "@/components/ranking";

export default function LearnersRankingPage({
  userRole,
}: {
  userRole?: string;
}) {
  // useTranslation n'est plus utilisé ici car les textes sont gérés dans les composants
  // mais on garde l'import pour une utilisation éventuelle future

  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");
  const [formationFilter, setFormationFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce de la recherche pour éviter trop de requêtes
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Chargement des formations
  const { data: formations = [], isLoading: isLoadingFormations } = useQuery({
    queryKey: ["formations"],
    queryFn: getCoursesForRanking,
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
  });

  // Construction des filtres pour l'API
  const filters: RankingFilters = {
    page: currentPage - 1,
    size: itemsPerPage,
    gender: genderFilter !== "ALL" ? genderFilter : undefined,
    search: debouncedSearchTerm || undefined,
    formationId: formationFilter !== "ALL" ? formationFilter : undefined,
  };

  // Chargement des learners avec tous les filtres
  const {
    data: learnersPage,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["learnersRanking", filters, userRole],
    queryFn: () => getLearnersRanking(filters, userRole),
  });

  

  // Reset à la première page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, genderFilter, formationFilter, itemsPerPage]);

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setGenderFilter("ALL");
    setFormationFilter("ALL");
    setCurrentPage(1);
  }, []);

  // Gestion du changement de formation
  const handleFormationChange = useCallback((value: string) => {
    setFormationFilter(value);
  }, []);

  // Gestion d'erreur
  if (isError) {
    return <ErrorBoundary err={error} />;
  }

  // Si pas de données
  if (!isLoading && (!learnersPage || learnersPage.content.length === 0)) {
    const hasActiveFilters = !!(
      searchTerm ||
      genderFilter !== "ALL" ||
      formationFilter !== "ALL"
    );

    return (
      <div className="container mx-auto p-6 space-y-6">
        <HeaderComponent />

        <FiltersComponent
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          genderFilter={genderFilter}
          setGenderFilter={setGenderFilter}
          formationFilter={formationFilter}
          setFormationFilter={handleFormationChange}
          formations={formations}
          isLoadingFormations={isLoadingFormations}
          resetFilters={resetFilters}
        />

        <NoDataComponent
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
        />
      </div>
    );
  }

  const totalPages = learnersPage?.totalPages ?? 0;
  const selectedFormation = formations.find((f) => f.id === formationFilter);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <HeaderComponent selectedFormation={selectedFormation} />

      <FiltersComponent
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        formationFilter={formationFilter}
        setFormationFilter={handleFormationChange}
        formations={formations}
        isLoadingFormations={isLoadingFormations}
        resetFilters={resetFilters}
        totalItems={learnersPage?.totalElements}
        displayedItems={learnersPage?.content.length}
        isLoading={isLoading}
      />

      <TableComponent
        learners={learnersPage?.content || []}
        isLoading={isLoading}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        selectedFormation={selectedFormation}
        userRole={userRole}
      />

      {totalPages > 1 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
        />
      )}
    </div>
  );
}
