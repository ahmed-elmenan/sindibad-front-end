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
import { AlertTriangle } from 'lucide-react';

interface ChapterDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chapterTitle: string;
  videoCount: number;
}

export const ChapterDeleteModal: React.FC<ChapterDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  chapterTitle,
  videoCount,
}) => {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  const isConfirmValid = confirmText === chapterTitle;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl bg-white">
        {/* Header with gradient */}
        <DialogHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 px-6 py-5 border-b border-red-200/50 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-orange-600 flex items-center justify-center shadow-lg ring-2 ring-red-200/50 animate-pulse">
              <AlertTriangle className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Supprimer le Chapitre
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Cette action est irréversible
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6 space-y-4 bg-white">
          <div className="space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer le chapitre{' '}
              <span className="font-bold text-gray-900">"{chapterTitle}"</span> ?
            </p>
            
            {videoCount > 0 && (
              <div className="bg-orange-50 border border-orange-200/50 rounded-xl p-4">
                <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Ce chapitre contient {videoCount} vidéo{videoCount > 1 ? 's' : ''} qui {videoCount > 1 ? 'seront' : 'sera'} également supprimée{videoCount > 1 ? 's' : ''}.
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 italic">
              Cette action ne peut pas être annulée. Toutes les données associées seront définitivement perdues.
            </p>

            <div className="pt-2 space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-red-500 rounded-full" />
                Tapez le nom du chapitre pour confirmer *
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={chapterTitle}
                className="
                  border-red-300/60
                  focus:border-red-500 
                  focus:ring-2 
                  focus:ring-red-500/20 
                  transition-all 
                  duration-200 
                  placeholder:text-gray-400/80
                  text-sm
                  font-medium
                  bg-white
                  shadow-sm
                  hover:border-red-400
                  hover:shadow
                  rounded-lg
                  h-11
                "
              />
              <p className="text-xs text-gray-500">
                Tapez exactement <span className="font-semibold text-gray-700">"{chapterTitle}"</span> pour activer le bouton de suppression
              </p>
            </div>
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
                hover:bg-gray-100
                text-gray-700
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
              onClick={onConfirm}
              disabled={!isConfirmValid}
              className="
                flex-1 sm:flex-none
                bg-gradient-to-r from-red-500 to-red-600 
                hover:from-red-600 hover:to-red-700 
                text-white 
                shadow-md 
                hover:shadow-lg
                ring-2 ring-red-200/50 
                hover:ring-red-300/50
                transition-all 
                duration-300 
                rounded-xl
                h-11
                px-6
                font-semibold
                disabled:opacity-50
                disabled:cursor-not-allowed
                disabled:hover:from-red-500
                disabled:hover:to-red-600
              "
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
