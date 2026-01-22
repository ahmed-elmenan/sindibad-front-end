import { useState } from 'react';
import { useRefuseRequest } from '../../hooks/useSubscriptionRequests';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';

interface RefuseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string | null;
  processedBy: string;
}

export const RefuseDialog = ({
  open,
  onOpenChange,
  subscriptionId,
  processedBy,
}: RefuseDialogProps) => {
  const [reason, setReason] = useState('');
  const refuseMutation = useRefuseRequest();

  const handleSubmit = () => {
    if (!subscriptionId || !reason.trim()) return;

    refuseMutation.mutate(
      {
        subscriptionId,
        data: {
          refusedReason: reason.trim(),
          processedBy,
        },
      },
      {
        onSuccess: () => {
          setReason('');
          onOpenChange(false);
        },
      }
    );
  };

  const handleClose = () => {
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Refuser la demande</DialogTitle>
          <DialogDescription>
            Veuillez indiquer la raison du refus. Cette information sera visible par l'organisation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du refus *</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Le reçu fourni n'est pas valide, informations incomplètes..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              {reason.length} / 500 caractères
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={refuseMutation.isPending}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || refuseMutation.isPending}
          >
            {refuseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refuser la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
