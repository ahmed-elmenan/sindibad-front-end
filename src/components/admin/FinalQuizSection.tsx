import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Plus, Edit, Clock, Award, BookOpen } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { quizManagementService } from "@/services/quizManagement.service";
import type { QuizDetailResponse } from "@/types/QuizManagement";
import type { Skill } from "@/types/Skill";
import QuizManagementModal from "./QuizManagementModal";

interface FinalQuizSectionProps {
  courseId: string;
  courseTitle: string;
  availableSkills: Skill[];
}

const FinalQuizSection: React.FC<FinalQuizSectionProps> = ({
  courseId,
  courseTitle,
  availableSkills,
}) => {
  const [existingQuiz, setExistingQuiz] = useState<QuizDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuizModal, setShowQuizModal] = useState(false);

  useEffect(() => {
    loadQuiz();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadQuiz = async () => {
    setIsLoading(true);
    try {
      const quiz = await quizManagementService.getQuizByCourseId(courseId);
      setExistingQuiz(quiz);
    } catch (error) {
      console.error("Error loading final quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageQuiz = () => {
    setShowQuizModal(true);
  };

  const handleQuizSuccess = () => {
    toast.success({
      title: "Succès",
      description: "Le quiz final a été enregistré avec succès",
    });
    loadQuiz();
    setShowQuizModal(false);
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-white">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3" />
            <p className="text-sm text-gray-600">Chargement du quiz final...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`
        border-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl
        ${existingQuiz 
          ? 'border-primary/40 bg-gradient-to-br from-primary/5 via-white to-secondary/5' 
          : 'border-dashed border-gray-300 bg-white'
        }
      `}>
        <CardHeader className={`
          ${existingQuiz 
            ? 'border-b-2 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20' 
            : 'bg-white border-transparent'
          }
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ring-2
                ${existingQuiz 
                  ? 'bg-gradient-to-br from-primary to-secondary ring-primary/40' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 ring-gray-400/40'
                }
              `}>
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  {existingQuiz ? existingQuiz.title : "Quiz Final du Cours"}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {existingQuiz 
                    ? `${existingQuiz.numberOfQuestions} questions • ${existingQuiz.duration} minutes`
                    : "Aucun quiz final créé pour ce cours"
                  }
                </CardDescription>
              </div>
            </div>

            <Button
              onClick={handleManageQuiz}
              className={`
                shadow-md hover:shadow-lg transition-all duration-300
                ${existingQuiz 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white'
                }
              `}
            >
              {existingQuiz ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier le quiz
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le quiz final
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {existingQuiz && (
          <CardContent className="pt-4 space-y-4">
            {/* Description */}
            {existingQuiz.description && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Description:</strong> {existingQuiz.description}
                </p>
              </div>
            )}

            {/* Quiz Details */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-600 font-medium">Durée</p>
                  <p className="text-sm font-bold text-blue-900">{existingQuiz.duration} min</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-3 border border-purple-200">
                <Award className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600 font-medium">Timer Points</p>
                  <p className="text-sm font-bold text-purple-900">{existingQuiz.timerPoints}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3 border border-green-200">
                <BookOpen className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Questions</p>
                  <p className="text-sm font-bold text-green-900">{existingQuiz.numberOfQuestions}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            {existingQuiz.skills && existingQuiz.skills.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Compétences évaluées:</p>
                <div className="flex flex-wrap gap-2">
                  {existingQuiz.skills.map((skill) => (
                    <div
                      key={skill.skillId}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm"
                    >
                      <span>{skill.skillName}</span>
                      <span className="bg-primary/20 px-2 py-0.5 rounded-full text-xs font-bold">
                        {skill.numberOfQuestions}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Quiz Management Modal (always mounted to avoid unmount-while-open issues) */}
      <QuizManagementModal
        open={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        quizType="FINAL_QUIZ"
        resourceId={courseId}
        resourceTitle={courseTitle}
        availableSkills={availableSkills}
        existingQuiz={existingQuiz}
        onSuccess={handleQuizSuccess}
      />
    </>
  );
};

export default FinalQuizSection;
