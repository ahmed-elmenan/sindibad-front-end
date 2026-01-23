import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Eye, Upload, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';

type SubscriptionStatus = 'PENDING' | 'REFUSED' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';

interface ManageSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: {
    id: string;
    organisationName: string;
    courseName: string;
    status: SubscriptionStatus;
    receiptUrl: string | null;
    receiptFileName: string | null;
  } | null;
  onStatusChange: (subscriptionId: string, newStatus: SubscriptionStatus) => void;
  onReceiptUpload: (subscriptionId: string, file: File) => void;
  onViewReceipt: (subscriptionId: string) => void;
  isUpdating?: boolean;
}

const statusConfig = {
  PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
  REFUSED: { label: 'Refusée', className: 'bg-red-100 text-red-800' },
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800' },
  SUSPENDED: { label: 'Suspendue', className: 'bg-orange-100 text-orange-800' },
  EXPIRED: { label: 'Expirée', className: 'bg-gray-100 text-gray-800' },
};

export const ManageSubscriptionDialog = ({
  open,
  onOpenChange,
  subscription,
  onStatusChange,
  onReceiptUpload,
  onViewReceipt,
  isUpdating = false,
}: ManageSubscriptionDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<SubscriptionStatus | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleClose = () => {
    setSelectedStatus('');
    setSelectedFile(null);
    onOpenChange(false);
  };

  const handleStatusChange = () => {
    if (!subscription || !selectedStatus) return;
    onStatusChange(subscription.id, selectedStatus);
    setSelectedStatus('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (!subscription || !selectedFile) return;
    onReceiptUpload(subscription.id, selectedFile);
    setSelectedFile(null);
  };

  if (!subscription) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Gérer l'abonnement</DialogTitle>
          <DialogDescription>
            {subscription.organisationName} - {subscription.courseName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Statut actuel */}
          <div className="space-y-2">
            <Label>Statut actuel</Label>
            <div>
              <Badge className={statusConfig[subscription.status].className}>
                {statusConfig[subscription.status].label}
              </Badge>
            </div>
          </div>

          {/* Changer le statut */}
          <div className="space-y-2">
            <Label htmlFor="status">Modifier le statut</Label>
            <div className="flex gap-2">
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as SubscriptionStatus)}
              >
                <SelectTrigger id="status" className="flex-1">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendue</SelectItem>
                  <SelectItem value="EXPIRED">Expirée</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusChange}
                disabled={!selectedStatus || isUpdating || selectedStatus === subscription.status}
                size="sm"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Appliquer'
                )}
              </Button>
            </div>
          </div>

          {/* Gestion du reçu */}
          <div className="space-y-2">
            <Label>Reçu de paiement</Label>
            {subscription.receiptUrl ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground flex-1 truncate">
                  {subscription.receiptFileName || 'Reçu disponible'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewReceipt(subscription.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Voir
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun reçu disponible</p>
            )}
          </div>

          {/* Upload nouveau reçu */}
          <div className="space-y-2">
            <Label htmlFor="receipt">Uploader un nouveau reçu</Label>
            <div className="flex gap-2">
              <Input
                id="receipt"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || isUpdating}
                size="sm"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
