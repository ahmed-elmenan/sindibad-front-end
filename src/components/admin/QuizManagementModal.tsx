import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { quizManagementService } from "@/services/quizManagement.service";
import type {
  QuizDetailResponse,
  QuizManagementRequest,
  QuizSkillRequest,
} from "@/types/QuizManagement";
import type { Skill } from "@/types/Skill";
import { Trash2, Plus, Clock, Award, BookOpen } from "lucide-react";

interface QuizManagementModalProps {
  open: boolean;
  onClose: () => void;
  quizType: "SIMPLE_QUIZ" | "PHASE_QUIZ" | "FINAL_QUIZ";
  resourceId: string; // lessonId, chapterId, or courseId
  resourceTitle: string; // for display
  availableSkills: Skill[]; // Skills available for this quiz
  existingQuiz?: QuizDetailResponse | null;
  onSuccess?: () => void;
  loading?: boolean;
}

const QuizManagementModal: React.FC<QuizManagementModalProps> = ({
  open,
  onClose,
  quizType,
  resourceId,
  resourceTitle,
  availableSkills,
  existingQuiz,
  onSuccess,
  loading = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [timerPoints, setTimerPoints] = useState(25);
  const [selectedSkills, setSelectedSkills] = useState<QuizSkillRequest[]>([]);

  useEffect(() => {
    console.log("Existing Quiz:", existingQuiz);
    console.log("Selected Skills:", selectedSkills);
  }, [existingQuiz, selectedSkills]);

  // Initialize form with existing quiz data
  useEffect(() => {
    if (existingQuiz) {
      setTitle(existingQuiz.title);
      setDescription(existingQuiz.description || "");
      setDuration(existingQuiz.duration);
      setTimerPoints(existingQuiz.timerPoints);
      setSelectedSkills(
        existingQuiz.skills.map((s) => ({
          skillName: s.skillName,
          numberOfQuestions: s.numberOfQuestions,
        }))
      );
    } else {
      // Reset form for new quiz
      setTitle("");
      setDescription("");
      setDuration(30);
      setTimerPoints(25);
      setSelectedSkills([]);
    }
  }, [existingQuiz, open]);

  const getQuizTypeLabel = () => {
    switch (quizType) {
      case "SIMPLE_QUIZ":
        return "Quiz de Leçon";
      case "PHASE_QUIZ":
        return "Quiz de Phase";
      case "FINAL_QUIZ":
        return "Quiz Final";
    }
  };

  const handleAddSkill = () => {
    if (availableSkills.length === 0) {
      toast.error({
        title: "Aucune compétence disponible",
        description: "Il n'y a pas de compétences disponibles pour ce quiz",
      });
      return;
    }

    // Find first skill not already added
    const availableSkill = availableSkills.find(
      (skill) => !selectedSkills.some((s) => s.skillName === skill.name)
    );

    if (!availableSkill) {
      toast.error({
        title: "Toutes les compétences sont déjà ajoutées",
        description: "Vous avez déjà ajouté toutes les compétences disponibles",
      });
      return;
    }

    console.log("Adding skill:", availableSkill);

    setSelectedSkills([
      ...selectedSkills,
      { skillName: availableSkill.name, numberOfQuestions: 1 },
    ]);
  };

  const handleRemoveSkill = (index: number) => {
    setSelectedSkills(selectedSkills.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index: number, skillName: string) => {
    const updatedSkills = [...selectedSkills];
    updatedSkills[index].skillName = skillName;
    setSelectedSkills(updatedSkills);
  };

  const handleNumberOfQuestionsChange = (index: number, value: number) => {
    const updatedSkills = [...selectedSkills];
    updatedSkills[index].numberOfQuestions = Math.max(1, value);
    setSelectedSkills(updatedSkills);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error({
        title: "Titre requis",
        description: "Veuillez entrer un titre pour le quiz",
      });
      return false;
    }

    if (duration < 1) {
      toast.error({
        title: "Durée invalide",
        description: "La durée doit être d'au moins 1 minute",
      });
      return false;
    }

    if (selectedSkills.length === 0) {
      toast.error({
        title: "Compétences requises",
        description: "Veuillez ajouter au moins une compétence",
      });
      return false;
    }

    // Check for duplicate skills
    const skillIds = selectedSkills.map((s) => s.skillName);
    const uniqueSkillIds = new Set(skillIds);
    if (skillIds.length !== uniqueSkillIds.size) {
      toast.error({
        title: "Compétences en double",
        description: "Vous ne pouvez pas ajouter la même compétence plusieurs fois",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const request: QuizManagementRequest = {
        title,
        description: description.trim() || undefined,
        duration,
        timerPoints,
        skills: selectedSkills,
      };

      if (existingQuiz) {
        // Update existing quiz
        await quizManagementService.updateQuiz(existingQuiz.id, request);
        toast.success({
          title: "Quiz modifié",
          description: "Le quiz a été modifié avec succès",
        });
      } else {
        // Create new quiz
        if (quizType === "SIMPLE_QUIZ") {
          await quizManagementService.createSimpleQuiz(resourceId, request);
        } else if (quizType === "PHASE_QUIZ") {
          await quizManagementService.createPhaseQuiz(resourceId, request);
        } else if (quizType === "FINAL_QUIZ") {
          await quizManagementService.createFinalQuiz(resourceId, request);
        }

        toast.success({
          title: "Quiz créé",
          description: "Le quiz a été créé avec succès",
        });
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingQuiz) return;

    setIsDeleting(true);

    try {
      await quizManagementService.deleteQuiz(existingQuiz.id);
      toast.success({
        title: "Quiz supprimé",
        description: "Le quiz a été supprimé avec succès",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error({
        title: "Erreur de suppression",
        description: error.response?.data?.message || "Impossible de supprimer le quiz",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const totalQuestions = selectedSkills.reduce(
    (sum, skill) => sum + skill.numberOfQuestions,
    0
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              {existingQuiz ? "Modifier le quiz" : "Créer un quiz"}
            </DialogTitle>
            <DialogDescription>
              {getQuizTypeLabel()} pour "{resourceTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quiz Type (readonly) */}
            <div className="space-y-2">
              <Label>Type de quiz</Label>
              {loading ? (
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
              ) : (
                <Input
                  value={getQuizTypeLabel()}
                  disabled
                  className="bg-gray-100"
                />
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre <span className="text-red-500">*</span>
              </Label>
              {loading ? (
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
              ) : (
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez le titre du quiz"
                  maxLength={255}
                />
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              {loading ? (
                <div className="h-20 bg-gray-200 rounded w-full animate-pulse" />
              ) : (
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Entrez une description (optionnelle)"
                  rows={3}
                  maxLength={1000}
                />
              )}
            </div>

            {/* Duration and Timer Points */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Durée (minutes) <span className="text-red-500">*</span>
                </Label>
                {loading ? (
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
                ) : (
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timerPoints" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Points Timer <span className="text-red-500">*</span>
                </Label>
                {loading ? (
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
                ) : (
                  <Input
                    id="timerPoints"
                    type="number"
                    min="0"
                    value={timerPoints}
                    onChange={(e) => setTimerPoints(parseInt(e.target.value) || 0)}
                  />
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Compétences <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddSkill}
                  className="h-8"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>

              {loading ? (
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
              ) : selectedSkills.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                  Aucune compétence ajoutée. Cliquez sur "Ajouter" pour commencer.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <Select
                          value={skill.skillName}
                          onValueChange={(value) => handleSkillChange(index, value)}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une compétence" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSkills.map((s) => (
                              <SelectItem
                                key={s.id}
                                value={s.name}
                                disabled={selectedSkills.some(
                                  (selected, i) => i !== index && selected.skillName === s.name
                                )}
                              >
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-32">
                        <Input
                          type="number"
                          min="1"
                          value={skill.numberOfQuestions}
                          onChange={(e) =>
                            handleNumberOfQuestionsChange(
                              index,
                              parseInt(e.target.value) || 1
                            )
                          }
                          placeholder="Nb. questions"
                          disabled={loading}
                        />
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveSkill(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Questions Summary */}
              {!loading && selectedSkills.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-900">
                    Total de questions : <span className="text-lg">{totalQuestions}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div>
              {existingQuiz && !loading && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting || isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading || isDeleting}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || isDeleting || loading}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {existingQuiz ? "Modification..." : "Création..."}
                  </>
                ) : (
                  <>{existingQuiz ? "Modifier" : "Créer"}</>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est
                irréversible.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
              <p className="text-sm font-medium text-red-900">
                {existingQuiz?.title}
              </p>
              <p className="text-xs text-red-700 mt-1">
                {existingQuiz?.numberOfQuestions} question(s) • {existingQuiz?.duration} minutes
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer définitivement
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default QuizManagementModal;
