import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Moved outside component for better performance
import {
  Crown,
  Trophy,
  Medal,
  Star,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import type { CourseRanking, LearnerRanking } from "@/types";
import { useNavigate } from "react-router-dom";

interface RankingTableProps {
  learners: LearnerRanking[];
  isLoading: boolean;
  itemsPerPage: number;
  currentPage: number;
  selectedFormation?: CourseRanking;
  userRole?: string;
  onViewLearner?: (learner: LearnerRanking) => void;
  onEditLearner?: (learner: LearnerRanking) => void;
  onDeleteLearner?: (learner: LearnerRanking) => void;
}

const getRankingIcon = (ranking: number) => {
  switch (ranking) {
    case 1:
      return (
        <div className="relative flex items-center justify-center">
          {/* Couronne dorée avec effet brillant */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-20 animate-pulse"></div>
          <Crown className="h-6 w-6 text-yellow-500 drop-shadow-lg relative z-10" />
          <Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
        </div>
      );
    case 2:
      return (
        <div className="relative flex items-center justify-center">
          {/* Trophée argenté */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full opacity-15"></div>
          <Trophy className="h-5 w-5 text-gray-500 drop-shadow-md relative z-10" />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full border border-white shadow-sm"></div>
        </div>
      );
    case 3:
      return (
        <div className="relative flex items-center justify-center">
          {/* Médaille de bronze */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full opacity-15"></div>
          <Medal className="h-5 w-5 text-amber-700 drop-shadow-md relative z-10" />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full border border-white shadow-sm"></div>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-muted/20 to-muted/40 border border-muted/50">
          <span className="text-sm font-bold text-muted-foreground">
            #{ranking}
          </span>
        </div>
      );
  }
};

export default function RankingTable({
  learners,
  isLoading,
  itemsPerPage,
  currentPage,
  selectedFormation,
  userRole,
  onEditLearner,
  onDeleteLearner,
}: RankingTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Support for different role naming conventions

  const canManageLearners =
    userRole === "ADMIN" ||
    userRole === "admin" ||
    userRole === "SUPER_ADMIN" ||
    userRole === "super_admin" ||
    userRole === "ORGANISATION" ||
    userRole === "organisation";

  const getInitials = (fullName: string) =>
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  // Fonction pour afficher correctement le score
  const displayScore = (score?: number) =>
    score !== undefined && score !== null ? score : "-";

  // === Header dynamique ===
  const headers = [
    t("learnerRanking.rank") ?? "Rang",
    t("learnerRanking.avatar") ?? "Avatar",
    t("learnerRanking.fullName") ?? "Nom complet",
    t("learnerRanking.username") ?? "Nom d'utilisateur",
    selectedFormation
      ? (t("learnerRanking.formationScore") ?? "Score de la formation")
      : (t("learnerRanking.globalScore") ?? "Score global"),
  ];

  if (selectedFormation) {
    headers.push(t("learnerRanking.globalScore") ?? "Score global");
  }

  // Add status column
  headers.push(t("learnerRanking.status") ?? "Statut");

  if (canManageLearners) {
    headers.push(t("learnerRanking.actions") ?? "Actions");
  }

  return (
    <div className="w-full">
      <Card className="p-0 w-full overflow-hidden">
        <CardContent className="p-0 w-full">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse table-fixed min-w-full">
              <colgroup>
                <col style={{ width: "8%" }} /> {/* Rang */}
                <col style={{ width: "10%" }} /> {/* Avatar */}
                <col
                  style={{ width: selectedFormation ? "20%" : "24%" }}
                />{" "}
                {/* Nom complet */}
                <col
                  style={{ width: selectedFormation ? "18%" : "22%" }}
                />{" "}
                {/* Username */}
                <col style={{ width: "15%" }} /> {/* Score */}
                {selectedFormation && <col style={{ width: "15%" }} />}{" "}
                {/* Score global */}
                <col style={{ width: "10%" }} /> {/* Statut */}
                {canManageLearners && (
                  <col style={{ width: selectedFormation ? "4%" : "6%" }} />
                )}{" "}
                {/* Actions */}
              </colgroup>
              <thead className="sticky top-0 bg-[#f8fafc] z-[5] shadow-sm">
                <tr className="border-b w-full">
                  {headers.map((label, i) => (
                    <th
                      key={i}
                      className="text-center border-b border-gray-300 bg-[#f8fafc] font-semibold h-10 px-2 sm:px-4 align-middle text-xs sm:text-sm"
                    >
                      <div className="truncate">{label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {isLoading
                  ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                      <tr key={`loading-${idx}`} className="border-b w-full">
                        {/* Rang */}
                        <td className="text-center border-b border-gray-300 p-2 sm:p-3">
                          <div className="flex justify-center items-center">
                            <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                          </div>
                        </td>

                        {/* Avatar */}
                        <td className="text-center border-b border-gray-300 p-2 sm:p-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse mx-auto" />
                        </td>

                        {/* Nom complet */}
                        <td className="text-center border-b border-gray-300 p-2 sm:p-3">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
                        </td>

                        {/* Nom d'utilisateur */}
                        <td className="text-center border-b border-gray-300 p-2 sm:p-3">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                        </td>

                        {/* Score formation ou global */}
                        <td className="text-center border-b border-gray-300 p-2 sm:p-3">
                          <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse mx-auto" />
                        </td>

                        {/* Score global ssi formation sélectionnée */}
                        {selectedFormation && (
                          <td className="text-center border-b border-gray-300 p-2 sm:p-3">
                            <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse mx-auto" />
                          </td>
                        )}

                        {/* Status column for loading state */}
                        <td className="text-center border-b border-gray-300 p-2 sm:p-3">
                          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse mx-auto" />
                        </td>

                        {/* Actions column for loading state */}
                        {canManageLearners && (
                          <td className="text-center border-b border-gray-300 p-2 sm:p-3">
                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
                          </td>
                        )}
                      </tr>
                    ))
                  : learners.map((learner, idx) => {
                      const isLastRow = idx === learners.length - 1;

                      return (
                        <tr
                          key={learner.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer w-full"
                          onClick={() => {
                            // Navigation vers le profil analytics du learner
                            const basePath =
                              userRole === "admin" || userRole === "ADMIN"
                                ? "/admin"
                                : userRole === "organisation" || userRole === "ORGANISATION"
                                  ? "/organisation"
                                  : "";

                            navigate(
                              `${basePath}/learners/${learner.id}/profile`,
                            );
                          }}
                        >
                          {/* Rang */}
                          <td
                            className={`text-center p-2 sm:p-3 ${
                              isLastRow ? "" : "border-b border-gray-300"
                            }`}
                          >
                            <div className="flex justify-center items-center">
                              {getRankingIcon(
                                idx + 1 + (currentPage - 1) * itemsPerPage,
                              )}
                            </div>
                          </td>

                          {/* Avatar */}
                          <td
                            className={`text-center p-2 sm:p-3 ${
                              isLastRow ? "" : "border-b border-gray-300"
                            }`}
                          >
                            <Avatar className="h-10 w-10 mx-auto">
                              <AvatarImage
                                src={
                                  learner.profilePicture ||
                                  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200"
                                }
                                alt={learner.fullName}
                              />
                              <AvatarFallback className="text-xs">
                                {getInitials(learner.fullName)}
                              </AvatarFallback>
                            </Avatar>
                          </td>

                          {/* Nom complet */}
                          <td
                            className={`text-center p-2 sm:p-3 ${
                              isLastRow ? "" : "border-b border-gray-300"
                            }`}
                          >
                            <div
                              className="font-medium truncate px-1"
                              title={learner.fullName}
                            >
                              {learner.fullName}
                            </div>
                          </td>

                          {/* Nom d'utilisateur */}
                          <td
                            className={`text-center p-2 sm:p-3 ${
                              isLastRow ? "" : "border-b border-gray-300"
                            }`}
                          >
                            <div
                              className="text-muted-foreground truncate px-1"
                              title={`@${learner.username}`}
                            >
                              @{learner.username}
                            </div>
                          </td>

                          {/* Score formation ou global */}
                          <td
                            className={`text-center p-2 sm:p-3 ${
                              isLastRow ? "" : "border-b border-gray-300"
                            }`}
                          >
                            <Badge
                              variant={
                                selectedFormation
                                  ? learner.formationScore !== undefined &&
                                    learner.formationScore !== null
                                    ? learner.formationScore >= 80
                                      ? "default"
                                      : learner.formationScore >= 60
                                        ? "secondary"
                                        : "destructive"
                                    : "outline"
                                  : learner.score >= 80
                                    ? "default"
                                    : learner.score >= 60
                                      ? "secondary"
                                      : "destructive"
                              }
                              className="font-semibold"
                            >
                              {selectedFormation
                                ? displayScore(
                                    learner.formationScore !== undefined &&
                                      learner.formationScore !== null
                                      ? Number(
                                          learner.formationScore.toFixed(2),
                                        )
                                      : undefined,
                                  )
                                : displayScore(
                                    learner.score !== undefined &&
                                      learner.score !== null
                                      ? Number(learner.score.toFixed(2))
                                      : undefined,
                                  )}
                            </Badge>
                          </td>

                          {/* Score global ssi formation sélectionnée */}
                          {selectedFormation && (
                            <td
                              className={`text-center p-2 sm:p-3 ${
                                isLastRow ? "" : "border-b border-gray-300"
                              }`}
                            >
                              <Badge
                                variant={
                                  learner.score !== undefined &&
                                  learner.score !== null
                                    ? learner.score >= 80
                                      ? "default"
                                      : learner.score >= 60
                                        ? "secondary"
                                        : "destructive"
                                    : "outline"
                                }
                                className="font-semibold text-xs"
                              >
                                {displayScore(
                                  learner.score !== undefined &&
                                    learner.score !== null
                                    ? Number(learner.score.toFixed(2))
                                    : undefined,
                                )}
                              </Badge>
                            </td>
                          )}

                          {/* Status column */}
                          <td
                            className={`text-center p-2 sm:p-3 ${
                              isLastRow ? "" : "border-b border-gray-300"
                            }`}
                          >
                            <Badge
                              variant={
                                learner.isActive ? "default" : "secondary"
                              }
                              className="font-medium"
                            >
                              {learner.isActive
                                ? (t("learnerRanking.active") ?? "Actif")
                                : (t("learnerRanking.inactive") ?? "Inactif")}
                            </Badge>
                          </td>

                          {/* Actions column */}
                          {canManageLearners && (
                            <td
                              className={`text-center p-2 sm:p-3 ${
                                isLastRow ? "" : "border-b border-gray-300"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 border-0 hover:bg-transparent"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="z-[100]"
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const basePath =
                                        userRole === "admin" || userRole === "ADMIN"
                                          ? "/admin"
                                          : userRole === "organisation" ||
                                              userRole === "ORGANISATION"
                                            ? "/organisation"
                                            : "";

                                      console.log(
                                        "Navigating to1:",
                                        `${basePath}/learners/${learner.id}/profile`,
                                      );
                                      navigate(
                                        `${basePath}/learners/${learner.id}/profile`,
                                      );
                                    }}
                                    className="cursor-pointer hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("common.view") ?? "Voir"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => onEditLearner?.(learner)}
                                    className="cursor-pointer hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t("common.edit") ?? "Modifier"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => onDeleteLearner?.(learner)}
                                    className="cursor-pointer text-destructive focus:text-destructive hover:bg-gray-100 focus:bg-gray-100"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("common.delete") ?? "Supprimer"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          )}
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
