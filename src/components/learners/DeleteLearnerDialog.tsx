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
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

interface DeleteLearnerDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  learnerName: string;
  isDeleting?: boolean;
}

export default function DeleteLearnerDialog({
  open,
  onClose,
  onConfirm,
  learnerName,
  isDeleting = false,
}: DeleteLearnerDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la fermeture automatique
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">
            {t("learners.deleteLearner")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t("learners.deleteConfirmation", { name: learnerName })}
            <br />
            <span className="text-destructive font-semibold">
              {t("learners.deleteWarning")}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel disabled={isDeleting} className="hover:bg-gray-100 hover:text-black">
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                {t("common.deleting")}
              </>
            ) : (
              t("common.delete")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
