import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Clock,
  Users,
  BarChart3,
  Star,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  useAdminCourseDetails,
} from "@/hooks/useCourseQueries";
import StarRating from "@/components/course/StarRating";
import ChapterAccordion from "@/components/course/ChapterAccordion";
import PackDisplay from "@/components/course/PackDisplay";
import { BookOpen } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { deleteCourse } from "@/services/course.service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import QuizManagementPage from "./QuizManagementPage";
import SkeletonCourseDetailsPage from "@/components/course/SkeletonCourseDetailsPage";

export default function AdminCourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  usePageTitle("courseDetails"); // Définit le titre de la page

  // OPTIMIZED: Single query that fetches all data in one request
  // This reduces network latency from 4 requests to 1 request
  const {
    data: adminData,
    isLoading,
    isFetching,
    refetch: refetchAllData,
  } = useAdminCourseDetails(courseId);

  // Extract data from the combined response
  const course = adminData?.course;
  const reviews = adminData?.reviews || [];
  const chapters = adminData?.chapters || [];
  const packs = adminData?.packs || [];

  const [isQuizzesOpen, setIsQuizzesOpen] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  // Recharger les données quand on revient de QuizManagementPage
  useEffect(() => {
    if (!isQuizzesOpen && courseId) {
      setIsRefetching(true);
      refetchAllData().finally(() => {
        setIsRefetching(false);
      });
    }
  }, [isQuizzesOpen, courseId, refetchAllData]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  // Loading states are now simplified with single query
  const isActuallyFetching = isFetching || isRefetching;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  // Traduire le niveau du cours en français
  const translateLevel = (level: string): string => {
    const levelTranslations: { [key: string]: string } = {
      BEGINNER: "Débutant",
      INTERMEDIATE: "Intermédiaire",
      ADVANCED: "Avancé",
    };
    return levelTranslations[level] || level;
  };

  // Fonction pour supprimer le cours
  const handleDeleteCourse = async () => {
    if (!courseId) return;

    // Vérifier que l'utilisateur a tapé le bon nom
    if (confirmationText !== course?.title) {
      toast.error("Nom du cours incorrect", {
        description:
          "Veuillez taper exactement le nom du cours pour confirmer la suppression.",
      });
      return;
    }

    setIsDeleting(true);

    // 1. Sauvegarder l'état précédent pour rollback
    const previousCourses = queryClient.getQueryData(["admin-courses"]);

    try {
      // 2. Mise à jour optimiste : supprimer immédiatement du cache
      queryClient.setQueryData(["admin-courses"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((c: any) => c.id !== courseId);
      });

      // 3. Fermer le modal immédiatement
      setDeleteDialogOpen(false);
      setConfirmationText("");

      // 4. Rediriger immédiatement vers la liste des cours
      navigate("/admin/courses");

      // 5. Afficher le toast de succès
      toast.success("Cours supprimé avec succès", {
        description:
          "Le cours et tout son contenu ont été supprimés définitivement.",
      });

      // 6. Effectuer la suppression en arrière-plan
      await deleteCourse(courseId);

      // 7. Invalider les caches pour synchroniser avec le serveur
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    } catch (error: any) {
      console.error("Error deleting course:", error);

      // ROLLBACK: Restaurer l'état précédent
      if (previousCourses) {
        queryClient.setQueryData(["admin-courses"], previousCourses);
      }

      // Rediriger vers la page du cours
      navigate(`/admin/courses/${courseId}`);

      toast.error("Erreur lors de la suppression", {
        description:
          error.message ||
          "Une erreur s'est produite lors de la suppression du cours.",
        action: {
          label: "Réessayer",
          onClick: () => {
            setDeleteDialogOpen(true);
            setConfirmationText("");
          },
        },
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <SkeletonCourseDetailsPage />;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 px-4">
        <Card className="max-w-md w-full shadow-2xl border-0">
          <CardContent className="pt-12 pb-8 px-6 text-center">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <AlertTriangle className="w-10 h-10 text-orange-600" />
            </div>
            
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-3">
              Cours introuvable
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 text-sm sm:text-base mb-8 leading-relaxed">
              Le cours que vous recherchez n'existe pas ou a été supprimé.
            </p>
            
            {/* Button */}
            <Link to="/admin/courses" className="block">
              <Button className="w-full bg-gradient-to-r from-primary via-muted to-secondary text-white hover:shadow-xl hover:scale-105 transition-all duration-300 group h-12 text-base font-semibold">
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Retour aux cours
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isQuizzesOpen && course) {
    return (
      <QuizManagementPage
        courseTitle={course.title}
        onBack={() => setIsQuizzesOpen(false)}
      />
    );
  }

  // Afficher le skeleton pendant le rechargement
  if (isActuallyFetching && !isLoading) {
    return <SkeletonCourseDetailsPage />;
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full lg:w-auto">
          <Link to={`/admin/courses`}>
            <Button
              variant="ghost"
              size="icon"
              className="group rounded-full h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 bg-gray-100 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-200 transition-all duration-300 hover:scale-105 shadow-sm flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-orange-600 transition-colors duration-300" />
            </Button>
          </Link>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 line-clamp-2">
            {course.title}
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto lg:flex-shrink-0">
          <Button
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base w-full sm:w-auto"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span className="truncate">Supprimer</span>
          </Button>
          <Button onClick={() => setIsQuizzesOpen(true)} variant="secondary" className="text-sm sm:text-base w-full sm:w-auto">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span className="truncate">Gérer les Quiz</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Course Image */}
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-white flex items-center justify-center p-1 sm:p-2">
            <img
              src={course.imgUrl || "/placeholder.svg?height=400&width=800"}
              alt={course.title}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
          </div>

          {/* Course Description */}
          <Card>
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{course.description}</p>
            </CardContent>
          </Card>

          {/* Course Features */}
          {course.features && course.features.length > 0 && (
            <Card>
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Fonctionnalités du Cours</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <ul className="grid gap-2 sm:gap-3">
                  {course.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Course Content */}
          <Card>
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">Contenu du Cours</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              {chapters.map((chapter, index) => (
                <ChapterAccordion
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                />
              ))}
            </CardContent>
          </Card>

          {/* Packs de Réduction */}
          <PackDisplay packs={packs} coursePrice={course.price || 0} />

          {/* Reviews */}
          <Card>
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">Avis des Étudiants</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {reviews.length === 0 ? (
                <p className="text-sm sm:text-base text-gray-500 text-center py-4">
                  Aucun avis pour le moment
                </p>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <StarRating rating={averageRating} size="lg" />
                    <span className="text-base sm:text-lg font-medium text-gray-700">
                      {averageRating.toFixed(1)} ({reviews.length} avis)
                    </span>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-100 pb-3 sm:pb-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs sm:text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Course Stats */}
          <Card>
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
              <CardTitle className="text-base sm:text-lg">Informations sur le Cours</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pt-2 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 truncate">
                    {course.duration} h
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 truncate">
                    {course.participants}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 truncate">
                    {translateLevel(course.level)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 truncate">
                    {averageRating.toFixed(1)} / 5
                  </span>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">{course.category}</Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    {translateLevel(course.level)}
                  </Badge>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-gray-100">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {course.price} MAD
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
            <Card>
            <CardHeader className="px-4 sm:px-6 pt-3 sm:pt-4 pb-1 sm:pb-2">
              <CardTitle className="text-base sm:text-lg">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-3 sm:pb-4 flex flex-col gap-2">
              <Link to={`/admin/courses/${courseId}/edit`} className="w-full">
              <Button className="w-full text-sm sm:text-base" variant="outline">
                Modifier le Cours
              </Button>
              </Link>
              <Link
              to={`/admin/courses/${courseId}/chapters`}
              className="w-full"
              >
              <Button className="w-full text-sm sm:text-base" variant="outline">
                Gérer les Chapitres
              </Button>
              </Link>
              <Link
              to={`/admin/courses/${courseId}/reviews`}
              className="w-full"
              >
              <Button className="w-full text-sm sm:text-base" variant="outline">
                Gérer les Avis
              </Button>
              </Link>
            </CardContent>
            </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 rounded-full bg-red-100 flex-shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-lg sm:text-xl lg:text-2xl">
                Supprimer le cours ?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <p className="font-semibold text-gray-900 leading-relaxed break-words">
                Vous êtes sur le point de supprimer définitivement le cours "
                <span className="text-red-600">{course?.title}</span>".
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 space-y-2">
                <p className="font-medium text-red-900 text-sm sm:text-base">
                  ⚠️ Cette action est irréversible et entraînera :
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-800 ml-2 text-xs sm:text-sm">
                  <li>La suppression du cours</li>
                  <li>
                    La suppression de tous les chapitres ({chapters.length}{" "}
                    chapitre{chapters.length > 1 ? "s" : ""})
                  </li>
                  <li>La suppression de toutes les vidéos associées</li>
                  <li>La suppression de tous les quiz</li>
                  <li>La perte de tous les avis ({reviews.length} avis)</li>
                  <li>La désinscription de tous les participants</li>
                </ul>
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">
                Êtes-vous absolument sûr de vouloir continuer ?
              </p>

              {/* Input de confirmation */}
              <div className="space-y-2 mt-3 sm:mt-4">
                <Label
                  htmlFor="confirmation-input"
                  className="text-xs sm:text-sm font-medium text-gray-900 leading-relaxed"
                >
                  Pour confirmer, tapez le nom du cours :{" "}
                  <span className="font-bold text-red-600 break-words">
                    {course?.title}
                  </span>
                </Label>
                <Input
                  id="confirmation-input"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Tapez le nom du cours"
                  className="border-red-300 focus:border-red-500 focus:ring-red-200 text-sm sm:text-base"
                  disabled={isDeleting}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setConfirmationText("")}
              className="w-full sm:w-auto text-sm sm:text-base bg-gray-100 hover:bg-gray-200 text-gray-900 hover:text-gray-900 transition-colors duration-200"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={isDeleting || confirmationText !== course?.title}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-sm sm:text-base"
            >
              {isDeleting ? (
                <>
                  <span className="truncate">Suppression...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Supprimer</span>
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
