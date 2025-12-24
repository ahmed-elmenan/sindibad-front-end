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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { UnifiedPhase } from '@/types/PhaseManager';

interface PhaseEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<UnifiedPhase>) => void;
  phase: UnifiedPhase;
}

const PhaseEditModal: React.FC<PhaseEditModalProps> = ({
  open,
  onClose,
  onSave,
  phase,
}) => {
  const [title, setTitle] = useState(phase.title);
  const [description, setDescription] = useState(phase.description || '');
  const [order, setOrder] = useState(phase.order.toString());

  useEffect(() => {
    if (open) {
      setTitle(phase.title);
      setDescription(phase.description || '');
      setOrder(phase.order.toString());
    }
  }, [open, phase]);

  const handleSave = () => {
    onSave({
      title: title.trim(),
      description: description.trim(),
      order: parseInt(order) || phase.order,
    });
    onClose();
  };

  const isValid = title.trim().length > 0 && parseInt(order) > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Modifier la Phase</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la phase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="phase-title" className="text-sm font-bold text-gray-700">
              Titre de la Phase <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phase-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre de la phase..."
              className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="phase-description" className="text-sm font-bold text-gray-700">
              Description
            </Label>
            <Textarea
              id="phase-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez cette phase..."
              rows={4}
              className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="phase-order" className="text-sm font-bold text-gray-700">
              Ordre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phase-order"
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="Ordre de la phase"
              className="border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-gray-500">
              L'ordre détermine la position de la phase dans le cours
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhaseEditModal;
