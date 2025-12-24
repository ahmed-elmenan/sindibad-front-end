import { Badge } from "@/components/ui/badge";
import {
  Lock,
  GraduationCap,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { formatDuration } from "@/utils/dateUtils";
import type { QuizSummary } from "@/types/QuizSummary";
import type { TFunction } from "i18next";

interface FinalExamDescriptionCardProps {
  finalExam: QuizSummary;
  t: TFunction;
  isRTL: boolean;
  handleFinalExamClick: () => void;
  progressPercentage: number;
}

export function FinalExamCard({
  finalExam,
  t,
  isRTL,
  handleFinalExamClick,
  progressPercentage,
}: FinalExamDescriptionCardProps) {
  return (
    <div className="relative">
      {/* Divider with gradient */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-gray-500 font-medium tracking-wider">
            {t("finalExam.divider", "Examen Final")}
          </span>
        </div>
      </div>

      <div className="mx-4 mb-6">
        <button
          type="button"
          onClick={handleFinalExamClick}
          disabled={finalExam.isLocked}
          className={`
            group relative w-full overflow-hidden rounded-2xl transition-all duration-500
            ${
              finalExam.isLocked
                ? "opacity-60 cursor-not-allowed"
                : "cursor-pointer hover:scale-[1.02] hover:shadow-2xl"
            }
          `}
        >
          {/* Premium gradient background */}
          <div
            className={`
            relative p-6 backdrop-blur-sm
            ${
              finalExam.isLocked
                ? "bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100"
                : finalExam.isActive
                ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"
                : finalExam.isCompleted
                ? "bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700"
                : "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500"
            }
          `}
          >
            {/* Animated background pattern */}
            {!finalExam.isLocked && (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />
                {finalExam.isActive && (
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                )}
              </>
            )}

            {/* Content */}
            <div className="relative z-10">
              {/* Header with icon and status */}
              <div
                className={`flex items-center justify-between mb-4 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`
                    p-3 rounded-full border-2 backdrop-blur-sm
                    ${
                      finalExam.isLocked
                        ? "border-gray-300 bg-gray-100/80"
                        : "border-white/30 bg-white/20"
                    }
                  `}
                  >
                    {finalExam.isLocked ? (
                      <Lock className="w-6 h-6 text-gray-500" />
                    ) : (
                      <GraduationCap className="w-6 h-6 text-white drop-shadow-sm" />
                    )}
                  </div>

                  <div className={isRTL ? "text-right" : ""}>
                    <h3
                      className={`
                      font-bold text-lg leading-tight
                      ${
                        finalExam.isLocked
                          ? "text-gray-600"
                          : "text-white drop-shadow-sm"
                      }
                    `}
                    >
                      {finalExam.title}
                    </h3>
                    <p
                      className={`
                      text-sm font-medium opacity-90
                      ${
                        finalExam.isLocked
                          ? "text-gray-500"
                          : "text-white/90"
                      }
                    `}
                    >
                      {t("finalExam.subtitle", "Validez vos connaissances")}
                    </p>
                  </div>
                </div>

                {/* Status badges */}
                <div
                  className={`flex flex-col gap-2 ${
                    isRTL ? "ml-2" : "mr-2"
                  }`}
                >
                  {finalExam.isCompleted && (
                    <Badge className="flex items-center gap-1 text-white border-white/30 backdrop-blur-sm shadow-lg bg-primary">
                      <CheckCircle className="w-3 h-3" />
                      <span className="font-semibold">
                        {t("finalExam.completed", "Complété")}
                      </span>
                    </Badge>
                  )}

                  {finalExam.isActive && !finalExam.isCompleted && (
                    <Badge className="flex items-center gap-1 bg-white text-emerald-600 border-0 shadow-lg animate-pulse">
                      <div className="relative">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping" />
                        <div className="absolute inset-0 w-2 h-2 bg-emerald-600 rounded-full" />
                      </div>
                      <span className="font-bold">
                        {t("finalExam.inProgress", "En cours")}
                      </span>
                    </Badge>
                  )}

                  {finalExam.isLocked && (
                    <Badge
                      variant="outline"
                      className="border-gray-400 text-gray-600 bg-gray-50"
                    >
                      {t("finalExam.locked", "Verrouillé")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Course progress indicator */}
              {!finalExam.isLocked && (
                <div className="mb-4">
                  <div
                    className={`flex items-center justify-between mb-2 text-xs font-medium ${
                      finalExam.isLocked
                        ? "text-gray-600"
                        : "text-white/90"
                    }`}
                  >
                    <span>
                      {t("finalExam.courseProgress", "Progression du cours")}
                    </span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-700 ease-out shadow-inner"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Details */}
              <div
                className={`flex items-center justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex items-center gap-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex items-center gap-1 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Clock
                      className={`w-4 h-4 ${
                        finalExam.isLocked
                          ? "text-gray-500"
                          : "text-white/80"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        finalExam.isLocked
                          ? "text-gray-600"
                          : "text-white/90"
                      }`}
                    >
                      {formatDuration(finalExam.duration, t)}
                    </span>
                  </div>
                </div>

                {/* Call-to-action arrow */}
                {!finalExam.isLocked && (
                  <div className="flex items-center">
                    <ChevronRight
                      className={`
                      w-5 h-5 text-white/80 transition-transform duration-500
                      ${isRTL ? "rotate-180" : ""}
                      group-hover:translate-x-1 group-hover:text-white
                    `}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>

        {/* Premium description card */}
        {!finalExam.isLocked && (
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 backdrop-blur-sm">
            <p
              className={`text-sm text-gray-700 leading-relaxed ${
                isRTL ? "text-right" : ""
              }`}
            >
              {finalExam.isCompleted
                ? t(
                    "finalExam.completedDescription",
                    "Félicitations ! Vous avez réussi l'examen final avec succès."
                  )
                : finalExam.isActive
                ? t(
                    "finalExam.activeDescription",
                    "Votre examen est en cours. Terminez-le pour obtenir votre certification."
                  )
                : t(
                    "finalExam.description",
                    "Testez vos connaissances acquises tout au long du cours avec cet examen complet."
                  )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}