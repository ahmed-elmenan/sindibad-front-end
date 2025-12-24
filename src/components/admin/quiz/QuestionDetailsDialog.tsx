import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { type QuizQuestionAdminResponse } from '@/services/quiz-management.service';
import { Edit, Trash } from 'lucide-react';

interface QuestionDetailsDialogProps {
  question: QuizQuestionAdminResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (question: QuizQuestionAdminResponse) => void;
  onDelete: (id: string) => void;
}

export default function QuestionDetailsDialog({
  question,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: QuestionDetailsDialogProps) {
  if (!question) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <div className="p-2 bg-slate-50 rounded-md">{question.question}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Option 1</Label>
              <div className="p-2 bg-slate-50 rounded-md">{question.option1}</div>
            </div>
            <div className="space-y-2">
              <Label>Option 2</Label>
              <div className="p-2 bg-slate-50 rounded-md">{question.option2}</div>
            </div>
            <div className="space-y-2">
              <Label>Option 3</Label>
              <div className="p-2 bg-slate-50 rounded-md">{question.option3}</div>
            </div>
            <div className="space-y-2">
              <Label>Option 4</Label>
              <div className="p-2 bg-slate-50 rounded-md">{question.option4}</div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Correct Option(s)</Label>
            <div className="p-2 bg-slate-50 rounded-md">{question.correctOptions}</div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onEdit(question)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(question.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}