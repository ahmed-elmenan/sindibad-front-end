import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import type { UnifiedVideo } from '@/types/PhaseManager';

interface VideoEditModalProps {
  open: boolean;
  onClose: () => void;
  video: UnifiedVideo;
  onSave: (updatedVideo: Partial<UnifiedVideo>) => void;
}

const VideoEditModal: React.FC<VideoEditModalProps> = ({
  open,
  onClose,
  video,
  onSave,
}) => {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [referenceUrl, setReferenceUrl] = useState(video.referenceUrl || '');

  useEffect(() => {
    if (open) {
      setTitle(video.title);
      setDescription(video.description);
      setReferenceUrl(video.referenceUrl || '');
    }
  }, [open, video]);

  const handleSave = () => {
    onSave({
      title,
      description,
      referenceUrl,
    });
    onClose();
  };

  const isValid = title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Modifier la vidéo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="video-title" className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              Titre de la vidéo
            </Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre de la vidéo..."
              className="border-gray-300/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="video-description" className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              Description
            </Label>
            <Textarea
              id="video-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le contenu de cette vidéo..."
              rows={4}
              className="border-gray-300/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg resize-none"
            />
          </div>

          {/* Reference URL */}
          <div className="space-y-2">
            <Label htmlFor="video-reference" className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                URL de référence (PDF, optionnel)
            </Label>
            <Input
              id="video-reference"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="https://..."
              className="border-gray-300/60 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
            />
          </div>

          {/* File Info Display */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200/50">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Nom du fichier:</span>
                <span className="text-gray-600">{video.fileName || video.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Position:</span>
                <span className="text-gray-600">
                  Phase {video.phaseNumber} - Chapitre {video.chapterNumber} - Vidéo {video.videoNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-lg"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-primary to-muted hover:from-primary/90 hover:to-muted/90 rounded-lg"
            disabled={!isValid}
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoEditModal;
