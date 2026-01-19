import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLearnersRanking,
  getCoursesForRanking,
} from "@/services/ranking.service";
import { deleteLearner } from "@/services/learner.service";
import { getAllOrganisations } from "@/services/organisation.service";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import type { RankingFilters } from "@/types/Ranking";
import type { LearnerRanking } from "@/types/Learner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { toast } from "sonner";

// Import des composants extraits
import {
  RankingFilters as FiltersComponent,
  RankingTable as TableComponent,
  RankingPagination as PaginationComponent,
  NoDataState as NoDataComponent,
  RankingHeader as HeaderComponent,
} from "@/components/ranking";

// Import des nouveaux composants
import { LearnerFormModal, DeleteLearnerDialog } from "@/components/learners";

export default function LearnersRankingPage({
  userRole: userRoleProp,
}: {
  userRole?: string;
}) {
  // Get user role from auth context if not provided as prop
  const { user } = useAuth();
  const userRole = userRoleProp || user?.role;

  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");
  const [formationFilter, setFormationFilter] = useState<string>("ALL");
  const [organisationFilter, setOrganisationFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // États pour les modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<"add" | "view" | "edit">("add");
  const [selectedLearner, setSelectedLearner] = useState<LearnerRanking | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryClient = useQueryClient();

  // Debounce de la recherche pour éviter trop de requêtes
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Chargement des formations
  const { data: formations = [], isLoading: isLoadingFormations } = useQuery({
    queryKey: ["formations"],
    queryFn: getCoursesForRanking,
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
  });

  // Vérifier si l'utilisateur est admin ou super admin
  const canFilterByOrganisation = 
    userRole === "admin" || 
    userRole === "ADMIN" ||
    userRole === "super_admin" ||
    userRole === "SUPER_ADMIN";

  // Chargement des organisations (uniquement pour admin/super admin)
  const { data: organisations = [], isLoading: isLoadingOrganisations } = useQuery({
    queryKey: ["organisations"],
    queryFn: getAllOrganisations,
    staleTime: 5 * 60 * 1000,
    enabled: canFilterByOrganisation, // Ne charge que si l'utilisateur est admin
  });

  // Construction des filtres pour l'API
  const filters: RankingFilters = {
    page: currentPage - 1,
    size: itemsPerPage,
    gender: genderFilter !== "ALL" ? genderFilter : undefined,
    search: debouncedSearchTerm || undefined,
    formationId: formationFilter !== "ALL" ? formationFilter : undefined,
    organisationId: canFilterByOrganisation && organisationFilter !== "ALL" ? organisationFilter : undefined,
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
  }, [debouncedSearchTerm, genderFilter, formationFilter, organisationFilter, itemsPerPage]);

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setGenderFilter("ALL");
    setFormationFilter("ALL");
    setOrganisationFilter("ALL");
    setCurrentPage(1);
  }, []);

  // Gestion du changement de formation
  const handleFormationChange = useCallback((value: string) => {
    setFormationFilter(value);
  }, []);

  // Handlers pour les actions sur les learners
  const handleAddLearner = () => {
    setSelectedLearner(undefined);
    setFormModalMode("add");
    setIsFormModalOpen(true);
  };

  const handleViewLearner = (learner: LearnerRanking) => {
    setSelectedLearner(learner);
    setFormModalMode("view");
    setIsFormModalOpen(true);
  };

  const handleEditLearner = (learner: LearnerRanking) => {
    setSelectedLearner(learner);
    setFormModalMode("edit");
    setIsFormModalOpen(true);
  };

  const handleDeleteLearner = (learner: LearnerRanking) => {
    setSelectedLearner(learner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteLearner = async () => {
    if (!selectedLearner) return;

    setIsDeleting(true);
    try {
      await deleteLearner(selectedLearner.id);
      toast.success("Succès", {
        description: "L'apprenant a été supprimé avec succès",
      });
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["learnersRanking"] });
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error("Erreur", {
        description: error.message || "Impossible de supprimer l'apprenant",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    // Rafraîchir les données après ajout/modification
    queryClient.invalidateQueries({ queryKey: ["learnersRanking"] });
  };

  // Gestion d'erreur
  if (isError) {
    return <ErrorBoundary err={error} />;
  }

  // Si pas de données
  if (!isLoading && (!learnersPage || learnersPage.content.length === 0)) {
    const hasActiveFilters = !!(
      searchTerm ||
      genderFilter !== "ALL" ||
      formationFilter !== "ALL" ||
      (canFilterByOrganisation && organisationFilter !== "ALL")
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
          organisationFilter={canFilterByOrganisation ? organisationFilter : undefined}
          setOrganisationFilter={canFilterByOrganisation ? setOrganisationFilter : undefined}
          organisations={canFilterByOrganisation ? organisations : undefined}
          isLoadingOrganisations={canFilterByOrganisation ? isLoadingOrganisations : undefined}
          resetFilters={resetFilters}
          onAddLearner={handleAddLearner}
          userRole={userRole}
        />

        <NoDataComponent
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
        />

        {/* Modals */}
        <LearnerFormModal
          open={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          mode={formModalMode}
          learner={selectedLearner}
          onSuccess={handleFormSuccess}
        />

        <DeleteLearnerDialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteLearner}
          learnerName={selectedLearner?.fullName || ""}
          isDeleting={isDeleting}
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
        organisationFilter={canFilterByOrganisation ? organisationFilter : undefined}
        setOrganisationFilter={canFilterByOrganisation ? setOrganisationFilter : undefined}
        organisations={canFilterByOrganisation ? organisations : undefined}
        isLoadingOrganisations={canFilterByOrganisation ? isLoadingOrganisations : undefined}
        resetFilters={resetFilters}
        totalItems={learnersPage?.totalElements}
        displayedItems={learnersPage?.content.length}
        isLoading={isLoading}
        onAddLearner={handleAddLearner}
        userRole={userRole}
      />

      <TableComponent
        learners={learnersPage?.content || []}
        isLoading={isLoading}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        selectedFormation={selectedFormation}
        userRole={userRole}
        onViewLearner={handleViewLearner}
        onEditLearner={handleEditLearner}
        onDeleteLearner={handleDeleteLearner}
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

      {/* Modals */}
      <LearnerFormModal
        open={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        mode={formModalMode}
        learner={selectedLearner}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
