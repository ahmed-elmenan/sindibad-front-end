import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { useTranslation } from "react-i18next";

    interface QuizWarningDialogProps {
        showQuizWarningDialog: boolean;
        setShowQuizWarningDialog: (open: boolean) => void;
    }

    const QuizWarningDialog: React.FC<QuizWarningDialogProps> = ({
        showQuizWarningDialog,
        setShowQuizWarningDialog,
    }) => {
        const { t } = useTranslation();

        return (
            <Dialog
                open={showQuizWarningDialog}
                onOpenChange={setShowQuizWarningDialog}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-500" />
                            {t("quizWarning.title", "Quiz en cours")}
                        </DialogTitle>
                        <DialogDescription className="text-left">
                            {t(
                                "quizWarning.description",
                                "Vous n'avez pas encore terminé le quiz. Veuillez le terminer avant de passer à la vidéo souhaitée."
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setShowQuizWarningDialog(false)}
                            className="w-full sm:w-auto"
                        >
                            {t("common.close", "Fermer")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    export default QuizWarningDialog;