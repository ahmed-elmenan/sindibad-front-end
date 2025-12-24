import { useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trophy, GraduationCap } from "lucide-react";
import {
  useLearnerProfile,
  useLearnerCourses,
} from "@/hooks/useLearnerQueries";
import { toast } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import LearnerProfileSkeleton from "@/components/learners/LearnerProfileSkeleton";


export default function LearnerProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { i18n } = useTranslation();
  
  // Fonction utilitaire pour formater la date avec l'heure
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return t('common.invalidDate');
      }
      return new Intl.DateTimeFormat(i18n.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return t('common.invalidDate');
    }
  };

  // Fonction pour formater la date de naissance (sans heure)
  const formatBirthDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return t('common.invalidDate');
      }
      return new Intl.DateTimeFormat(i18n.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return t('common.invalidDate');
    }
  };

  const {
    data: learner,
    isLoading: isLearnerLoading,
    error: learnerError,
  } = useLearnerProfile(id);

  const {
    data: courses = [],
    isLoading: isCoursesLoading,
    error: coursesError,
  } = useLearnerCourses(id);

  useEffect(() => {
    if (learnerError || coursesError) {
      // Éviter les toasts en double si les deux erreurs existent
      toast.error({
        title: t("errors.fetchError"),
        description: t("errors.tryAgain"),
      });
    }
  }, [learnerError, coursesError, t]);

  if (isLearnerLoading || isCoursesLoading) {
    return <LearnerProfileSkeleton />;
  }

  if (!learner) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {t("learnerProfile.notFound")}
          </h2>
          <p className="text-gray-600">
            {t("learnerProfile.notFoundDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <main className="container mx-auto px-2 sm:px-4 py-4 md:py-8 max-w-4xl">
        <Card className="bg-white border border-orange-100/50 shadow-sm mb-8">
          <CardHeader className="flex flex-col items-center gap-4">
            <img
              src={learner.profilePicture || "/logo.png"}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/logo.png";
              }}
              alt={learner.userName}
              className="w-28 h-28 rounded-full object-cover border-4 border-orange-200 shadow-md"
            />
            <CardTitle className="text-2xl font-bold text-gray-800">
              {learner.firstName} {learner.lastName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-50/80 text-orange-700 border-orange-200/60">
                {learner.role}
              </Badge>
              <Badge
                className={`${
                  learner.isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {learner.isActive
                  ? t("learnerProfile.active")
                  : t("learnerProfile.inactive")}
              </Badge>
            </div>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-6">
              {/* Ranking Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 shadow-sm border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-yellow-800">
                      {t("learnerProfile.ranking")}
                    </h3>
                  </div>
                  <div className="text-xl font-bold text-yellow-700">
                    #{learner.globalRanking}
                  </div>
                </div>
              </div>

              {/* Score Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-blue-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <h3 className="font-semibold text-blue-800">
                      {t("learnerProfile.totalScore")}
                    </h3>
                  </div>
                  <div className="text-xl font-bold text-blue-700">
                    {learner.totalScore != null ? learner.totalScore.toFixed(2) : "0.00"}
                  </div>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="w-full max-w-2xl">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 text-sm">
                  {t("learnerProfile.username")}: {learner.userName}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {/* Contact Information */}
              <div className="space-y-3 p-4 bg-orange-50/30 rounded-lg">
                <h3 className="font-semibold text-orange-700 mb-2">
                  {t("learnerProfile.contactInfo")}
                </h3>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-gray-600 text-sm">{learner.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-gray-600 text-sm">
                    {learner.phoneNumber}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-3 p-4 bg-blue-50/30 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">
                  {t("learnerProfile.personalInfo")}
                </h3>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                  </svg>
                  <span className="text-gray-600 text-sm">
                    {formatBirthDate(learner.dateOfBirth)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-600 text-sm">
                    {learner.gender}
                  </span>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-3 p-4 bg-purple-50/30 rounded-lg">
                <h3 className="font-semibold text-purple-700 mb-2">
                  {t("learnerProfile.accountInfo")}
                </h3>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-600 text-sm">
                    {t("learnerProfile.status")}:{" "}
                    {learner.isActive
                      ? t("learnerProfile.active")
                      : t("learnerProfile.inactive")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 100 12 6 6 0 000-12zm1 1a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 8.586V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-600 text-sm">
                    {t("learnerProfile.lastUpdated")}:{" "}
                    {formatDate(learner.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white border border-orange-100/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-orange-500" />
              <CardTitle className="text-xl font-semibold text-gray-800">
                {t("learnerProfile.enrolledCourses")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {t("learnerProfile.noCourses")}
                  </p>
                </div>
              ) : (
                courses.map((course, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-gray-100 p-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-700 text-lg">
                          {course.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {t("learnerProfile.rank")} #{course.learnerRank}
                        </Badge>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        {t("learnerProfile.score")}: {course.learnerScore != null ? course.learnerScore.toFixed(2) : "0.00"}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 font-medium text-sm">
                            {t("learnerProfile.progress")}
                          </span>
                        </div>
                        <div className="flex flex-col pl-6 text-sm">
                          <span className="text-gray-600">
                            <span className="font-medium">
                              {t("learnerProfile.chapter")}:
                            </span>{" "}
                            {course.currentChapter}
                          </span>
                          <span className="text-gray-600">
                            <span className="font-medium">
                              {t("learnerProfile.lesson")}:
                            </span>{" "}
                            {course.currentLesson}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-700 font-medium text-sm">
                            {t("learnerProfile.completion")}
                          </span>
                        </div>
                        <div className="pl-6">
                          <span className="text-gray-600 text-sm">
                            {Number(course.completionPercentage).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
