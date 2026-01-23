import { useState, useEffect } from 'react';
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
import { Upload, Loader2, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { getReceiptPresignedUrl } from '../../services/subscriptionManagement.service';

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
  onReceiptDelete: (subscriptionId: string) => void;
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
  onReceiptDelete,
  isUpdating = false,
}: ManageSubscriptionDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<SubscriptionStatus | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

  useEffect(() => {    
    setReceiptPreviewUrl(null);
    const loadReceiptUrl = async () => {
      if (subscription?.receiptUrl && open) {
        setIsLoadingReceipt(true);
        try {
          const presignedUrl = await getReceiptPresignedUrl(subscription.id);
          setReceiptPreviewUrl(presignedUrl);
        } catch (error) {
          console.error('❌ Erreur chargement reçu:', error);
          setReceiptPreviewUrl(null);
        } finally {
          setIsLoadingReceipt(false);
        }
      } else {
        setReceiptPreviewUrl(null);
      }
    };

    loadReceiptUrl();
  }, [subscription?.id, subscription?.receiptUrl, open]);

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

  const handleDeleteReceipt = () => {
    if (!subscription) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce reçu ? Cette action est irréversible.')) {
      onReceiptDelete(subscription.id);
    }
  };

  const getFileExtension = (filename: string | null) => {
    if (!filename) return '';
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isImageFile = (filename: string | null) => {
    const ext = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const isPdfFile = (filename: string | null) => {
    return getFileExtension(filename) === 'pdf';
  };

  if (!subscription) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
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
            <Label htmlFor="receipt">Reçu de paiement</Label>
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

            {/* Affichage du reçu existant */}
            {subscription.receiptUrl && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Reçu actuel</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteReceipt}
                    disabled={isUpdating}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>

                {isLoadingReceipt ? (
                  <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">Chargement du reçu...</span>
                  </div>
                ) : receiptPreviewUrl ? (
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    {(() => {
                  
                      if (isPdfFile(subscription.receiptFileName)) {
                        return (
                          <iframe
                            src={receiptPreviewUrl}
                            className="w-full h-96"
                            title="Aperçu du reçu PDF"
                          />
                        );
                      } else if (isImageFile(subscription.receiptFileName)) {
                        return (
                          <img
                            src={receiptPreviewUrl}
                            alt="Reçu"
                            className="w-full h-auto max-h-96 object-contain"
                            onError={(e) => {
                              console.error('❌ Erreur chargement image:', e);
                            }}
                          />
                        );
                      } else {
                        return (
                          <div className="flex items-center justify-center py-8">
                            <a
                              href={receiptPreviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              Télécharger le reçu ({subscription.receiptFileName})
                            </a>
                          </div>
                        );
                      }
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-red-500">Impossible de charger le reçu</p>
                )}
              </div>
            )}

            {!subscription.receiptUrl && (
              <p className="text-sm text-muted-foreground mt-2">Aucun reçu disponible</p>
            )}
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
