import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Folder, Save } from 'lucide-react';
import type { UnifiedChapter } from '@/types/ChapterManager';

interface ChapterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string }) => void;
  chapter: UnifiedChapter | null;
}

export const ChapterEditModal: React.FC<ChapterEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  chapter,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title);
      setDescription(chapter.description);
    }
  }, [chapter]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim() });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl bg-white">
        {/* Header with gradient */}
        <DialogHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-muted/10 px-6 py-5 border-b border-gray-200/50 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-muted flex items-center justify-center shadow-lg ring-2 ring-primary/20">
              <Folder className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Modifier le Chapitre
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Modifiez les informations du chapitre ci-dessous
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6 space-y-5 bg-gradient-to-b from-white to-gray-50/30">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              Titre du Chapitre *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre du chapitre..."
              className="
                border-gray-300/60
                focus:border-primary 
                focus:ring-2 
                focus:ring-primary/20 
                transition-all 
                duration-200 
                placeholder:text-gray-400/80
                text-sm
                font-medium
                bg-white
                shadow-sm
                hover:border-gray-400
                hover:shadow
                rounded-lg
                h-12
              "
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le contenu de ce chapitre..."
              rows={4}
              className="
                border-gray-300/60
                focus:border-primary 
                focus:ring-2 
                focus:ring-primary/20 
                transition-all 
                duration-200 
                placeholder:text-gray-400/80
                text-sm
                bg-white
                shadow-sm
                hover:border-gray-400
                hover:shadow
                resize-none
                rounded-lg
              "
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50/50 border-t border-gray-200/50">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="
                flex-1 sm:flex-none
                border-gray-300/60
                hover:!bg-gray-100
                !text-gray-700
                transition-all
                duration-200
                rounded-xl
                h-11
                px-6
                font-semibold
              "
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!title.trim()}
              className="
                flex-1 sm:flex-none
                bg-gradient-to-r from-green-500 to-emerald-600 
                hover:from-green-600 hover:to-emerald-700 
                text-white 
                shadow-md 
                hover:shadow-lg
                ring-2 ring-green-200/50 
                hover:ring-green-300/50
                transition-all 
                duration-300 
                rounded-xl
                h-11
                px-6
                font-semibold
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
