import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Crown, Trophy, Medal, Star, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
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
  onViewLearner,
  onEditLearner,
  onDeleteLearner,
}: RankingTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Debug: log userRole to check the actual value
  console.log("RankingTable - userRole:", userRole, "Type:", typeof userRole);

  // Support for different role naming conventions
  const canManageLearners = 
    userRole === "admin" || 
    userRole === "ADMIN" ||
    userRole === "organisations" || 
    userRole === "organisation" ||
    userRole === "ORGANISATION";

  console.log("RankingTable - canManageLearners:", canManageLearners);

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
      ? t("learnerRanking.formationScore") ?? "Score de la formation"
      : t("learnerRanking.globalScore") ?? "Score global",
  ];

  if (selectedFormation) {
    headers.push(t("learnerRanking.globalScore") ?? "Score global");
  }

  if (canManageLearners) {
    headers.push(t("learnerRanking.actions") ?? "Actions");
  }

  const colCount = headers.length;
  const getColWidthClass = (colCount: number) => {
    switch (colCount) {
      case 5:
        return "w-1/5";
      case 6:
        return "w-1/6";
      default:
        return "w-auto";
    }
  };
  const colWidthClass = getColWidthClass(colCount);

  return (
    <Card className="p-0">
      <CardContent className="p-0 w-full"> 
        <div className="overflow-x-auto w-full">
          <Table className="w-full table-fixed m-0"> 
            <TableHeader className="sticky top-0 bg-card z-10 m-0 p-0"> {/* Ajoute m-0 p-0 */}
              <TableRow>
                {headers.map((label, i) => {
                  // Check if this is the Score global header
                  const isGlobalScoreHeader =
                    label === t("learnerRanking.globalScore") ||
                    label === "Score global";

                  // Apply different width based on whether a formation is selected
                  const widthClass = isGlobalScoreHeader
                    ? selectedFormation
                      ? "!w-[13rem]"
                      : "!w-[16rem]"
                    : colWidthClass;

                  return (
                    <TableHead
                      key={i}
                      className={`text-center border-b border-gray-300 bg-[#f8fafc] font-semibold ${widthClass}`}
                    >
                      {label}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                    <TableRow
                      key={`loading-${idx}`}
                    >
                      {/* Rang */}
                      <TableCell
                        className={`text-center border-b border-gray-300 ${colWidthClass}`}
                      >
                        <div className="flex justify-center items-center">
                          <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                        </div>
                      </TableCell>

                      {/* Avatar */}
                      <TableCell
                        className={`text-center border-b border-gray-300 ${colWidthClass}`}
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse mx-auto" />
                      </TableCell>

                      {/* Nom complet */}
                      <TableCell
                        className={`text-center border-b border-gray-300 ${colWidthClass}`}
                      >
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
                      </TableCell>

                      {/* Nom d'utilisateur */}
                      <TableCell
                        className={`text-center border-b border-gray-300 ${colWidthClass}`}
                      >
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                      </TableCell>

                      {/* Score formation ou global */}
                      <TableCell
                        className={`text-center border-b border-gray-300 ${colWidthClass}`}
                      >
                        <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse mx-auto" />
                      </TableCell>

                      {/* Score global ssi formation sélectionnée */}
                      {selectedFormation && (
                        <TableCell
                          className={`text-center border-b border-gray-300 ${colWidthClass}`}
                        >
                          <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse mx-auto" />
                        </TableCell>
                      )}

                      {/* Actions column for loading state */}
                      {canManageLearners && (
                        <TableCell
                          className={`text-center border-b border-gray-300 ${colWidthClass}`}
                        >
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                : learners.map((learner, idx) => {
                    const isLastRow = idx === learners.length - 1;

                    return (
                      <TableRow
                        key={learner.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          userRole === "admin" || userRole === "organisations"
                            ? "cursor-pointer"
                            : ""
                        }`}
                        onClick={() => {
                          if (
                            userRole === "organisations"
                          ) {
                            navigate(`/organisation/learners/${learner.id}`);
                          }
                        }}
                      >
                        {/* Rang */}
                        <TableCell
                          className={`text-center ${
                            isLastRow ? "" : "border-b border-gray-300"
                          } ${colWidthClass}`}
                        >
                          <div className="flex justify-center items-center">
                            {getRankingIcon(
                              idx + 1 + (currentPage - 1) * itemsPerPage
                            )}
                          </div>
                        </TableCell>

                        {/* Avatar */}
                        <TableCell
                          className={`text-center ${
                            isLastRow ? "" : "border-b border-gray-300"
                          } ${colWidthClass}`}
                        >
                          <Avatar className="h-10 w-10 mx-auto">
                            <AvatarImage
                              src={learner.avatarUrl || "/placeholder.svg"}
                              alt={learner.fullName}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(learner.fullName)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>

                        {/* Nom complet */}
                        <TableCell
                          className={`text-center ${
                            isLastRow ? "" : "border-b border-gray-300"
                          } ${colWidthClass}`}
                        >
                          <span className="font-medium">
                            {learner.fullName}
                          </span>
                        </TableCell>

                        {/* Nom d'utilisateur */}
                        <TableCell
                          className={`text-center ${
                            isLastRow ? "" : "border-b border-gray-300"
                          } ${colWidthClass}`}
                        >
                          <span className="text-muted-foreground">
                            @{learner.username}
                          </span>
                        </TableCell>

                        {/* Score formation ou global */}
                        <TableCell
                          className={`text-center ${
                            isLastRow ? "" : "border-b border-gray-300"
                          } ${colWidthClass}`}
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
                                  learner.formationScore !== undefined && learner.formationScore !== null
                                    ? Number(learner.formationScore.toFixed(2))
                                    : undefined
                                )
                              : displayScore(
                                  learner.score !== undefined && learner.score !== null
                                    ? Number(learner.score.toFixed(2))
                                    : undefined
                                )}
                          </Badge>
                        </TableCell>

                        {/* Score global ssi formation sélectionnée */}
                        {selectedFormation && (
                          <TableCell
                            className={`text-center ${
                              isLastRow ? "" : "border-b border-gray-300"
                            } ${colWidthClass}`}
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
                                learner.score !== undefined && learner.score !== null
                                  ? Number(learner.score.toFixed(2))
                                  : undefined
                              )}
                            </Badge>
                          </TableCell>
                        )}

                        {/* Actions column */}
                        {canManageLearners && (
                          <TableCell
                            className={`text-center ${
                              isLastRow ? "" : "border-b border-gray-300"
                            } ${colWidthClass}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 border-0 hover:bg-transparent"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onViewLearner?.(learner)}
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
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
