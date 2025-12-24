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
} from "lucide-react";
import {
  useCourse,
  useCourseReviews,
  useCourseChapters,
  useCoursePacks,
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

  // Fetch course data
  const {
    data: course,
    isLoading: courseLoading,
    isFetching: courseFetching,
    refetch: refetchCourse,
  } = useCourse(courseId);
  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    isFetching: reviewsFetching,
    refetch: refetchReviews,
  } = useCourseReviews(courseId);
  const {
    data: chapters = [],
    isLoading: chaptersLoading,
    isFetching: chaptersFetching,
    refetch: refetchChapters,
  } = useCourseChapters(courseId);
  const {
    data: packs = [],
    isLoading: packsLoading,
    isFetching: packsFetching,
    refetch: refetchPacks,
  } = useCoursePacks(courseId);

  const [isQuizzesOpen, setIsQuizzesOpen] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  // Recharger les données quand on revient de QuizManagementPage
  useEffect(() => {
    if (!isQuizzesOpen && courseId) {
      setIsRefetching(true);
      Promise.all([
        refetchCourse(),
        refetchReviews(),
        refetchChapters(),
        refetchPacks(),
      ]).finally(() => {
        setIsRefetching(false);
      });
    }
  }, [isQuizzesOpen, courseId, refetchCourse, refetchReviews, refetchChapters, refetchPacks]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const isLoading = courseLoading || reviewsLoading || chaptersLoading || packsLoading;
  const isFetching =
    courseFetching || reviewsFetching || chaptersFetching || packsFetching || isRefetching;

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
    try {
      await deleteCourse(courseId);

      toast.success("Cours supprimé avec succès", {
        description:
          "Le cours et tout son contenu ont été supprimés définitivement.",
      });

      // Fermer le modal seulement après le succès
      setDeleteDialogOpen(false);
      setConfirmationText("");

      // Invalider tous les caches de cours pour mettre à jour la liste
      await queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      await queryClient.invalidateQueries({ queryKey: ["courses"] });

      // Rediriger vers la liste des cours après un court délai pour voir le toast
      setTimeout(() => {
        navigate("/admin/courses");
      }, 500);
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast.error("Erreur lors de la suppression", {
        description:
          error.message ||
          "Une erreur s'est produite lors de la suppression du cours.",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <SkeletonCourseDetailsPage />;
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Cours introuvable
        </h2>
        <Link to="/admin/courses">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/admin/courses`)}
            className="rounded-full h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
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
  if (isFetching && !isLoading) {
    return <SkeletonCourseDetailsPage />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/courses">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/admin/courses`)}
              className="rounded-full h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {course.title}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer le Cours
          </Button>
          <Button onClick={() => setIsQuizzesOpen(true)} variant="secondary">
            <BookOpen className="w-4 h-4 mr-2" />
            Gérer les Quiz
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Course Image */}
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-white flex items-center justify-center p-2">
            <img
              src={course.imgUrl || "/placeholder.svg?height=400&width=800"}
              alt={course.title}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
          </div>

          {/* Course Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{course.description}</p>
            </CardContent>
          </Card>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu du Cours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            <CardHeader>
              <CardTitle>Avis des Étudiants</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun avis pour le moment
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <StarRating rating={averageRating} size="lg" />
                    <span className="text-lg font-medium text-gray-700">
                      {averageRating.toFixed(1)} ({reviews.length} avis)
                    </span>
                  </div>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-100 pb-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Informations sur le Cours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {course.duration} semaines
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {course.participants} participants
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {translateLevel(course.level)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {averageRating.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant="outline">
                    {translateLevel(course.level)}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="text-2xl font-bold text-primary">
                  {course.price} MAD
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link to={`/admin/courses/${courseId}/edit`} className="w-full">
                <Button className="w-full" variant="outline">
                  Modifier le Cours
                </Button>
              </Link>
              <Link
                to={`/admin/courses/${courseId}/chapters`}
                className="w-full"
              >
                <Button className="w-full" variant="outline">
                  Gérer les Chapitres
                </Button>
              </Link>
              <Link
                to={`/admin/courses/${courseId}/reviews`}
                className="w-full"
              >
                <Button className="w-full" variant="outline">
                  Gérer les Avis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-2xl">
                Supprimer le cours ?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3 text-base">
              <p className="font-semibold text-gray-900">
                Vous êtes sur le point de supprimer définitivement le cours "
                {course?.title}".
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <p className="font-medium text-red-900">
                  ⚠️ Cette action est irréversible et entraînera :
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-800 ml-2">
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
              <p className="text-gray-700 font-medium">
                Êtes-vous absolument sûr de vouloir continuer ?
              </p>

              {/* Input de confirmation */}
              <div className="space-y-2 mt-4">
                <Label
                  htmlFor="confirmation-input"
                  className="text-sm font-medium text-gray-900"
                >
                  Pour confirmer, tapez le nom du cours :{" "}
                  <span className="font-bold text-red-600">
                    {course?.title}
                  </span>
                </Label>
                <Input
                  id="confirmation-input"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Tapez le nom du cours"
                  className="border-red-300 focus:border-red-500 focus:ring-red-200"
                  disabled={isDeleting}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setConfirmationText("")}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={isDeleting || confirmationText !== course?.title}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Oui, supprimer définitivement
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
