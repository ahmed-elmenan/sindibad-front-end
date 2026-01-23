import { useState, useRef } from 'react';
import {
  useReceiptPresignedUrl,
  useUploadReceipt,
  useDeleteReceipt,
  useReplaceReceipt,
} from '../../hooks/useSubscriptionRequests';
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
import { Input } from '../ui/input';
import { Loader2, Upload, Trash2, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string | null;
}

export const ReceiptDialog = ({ open, onOpenChange, subscriptionId }: ReceiptDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries & Mutations
  const { data: presignedData, isLoading: isLoadingUrl } = useReceiptPresignedUrl(
    open ? subscriptionId : null
  );
  const uploadMutation = useUploadReceipt();
  const deleteMutation = useDeleteReceipt();
  const replaceMutation = useReplaceReceipt();

  const hasReceipt = !!presignedData?.presignedUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez PDF ou image (JPG, PNG)');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      toast.error('Le fichier ne doit pas dépasser 10 MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!subscriptionId || !selectedFile) return;

    if (hasReceipt) {
      // Remplacer
      replaceMutation.mutate(
        { subscriptionId, file: selectedFile },
        {
          onSuccess: () => {
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          },
        }
      );
    } else {
      // Upload nouveau
      uploadMutation.mutate(
        { subscriptionId, file: selectedFile },
        {
          onSuccess: () => {
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!subscriptionId) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce reçu ?')) {
      deleteMutation.mutate(subscriptionId, {
        onSuccess: () => {
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      });
    }
  };

  const handleViewReceipt = () => {
    if (presignedData?.presignedUrl) {
      window.open(presignedData.presignedUrl, '_blank');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onOpenChange(false);
  };

  const isUploading = uploadMutation.isPending || replaceMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px] bg-white">
        <DialogHeader>
          <DialogTitle>Gestion du reçu</DialogTitle>
          <DialogDescription>
            Uploadez, visualisez ou supprimez le reçu de paiement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Reçu existant */}
          {isLoadingUrl ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : hasReceipt ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Reçu disponible</p>
                  <p className="text-xs text-muted-foreground">
                    URL valide pendant {presignedData.expiresIn}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleViewReceipt}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualiser
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Supprimer
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun reçu disponible</p>
            </div>
          )}

          {/* Upload nouveau reçu */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <Label htmlFor="receipt-file">
                {hasReceipt ? 'Remplacer le reçu' : 'Uploader un reçu'}
              </Label>
              <div className="mt-2 space-y-2">
                <Input
                  id="receipt-file"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Formats acceptés: PDF, JPG, PNG (max 10 MB)
                </p>
                {selectedFile && (
                  <p className="text-sm text-primary">
                    Fichier sélectionné: {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Fermer
          </Button>
          {selectedFile && (
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Upload className="mr-2 h-4 w-4" />
              {hasReceipt ? 'Remplacer' : 'Uploader'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
