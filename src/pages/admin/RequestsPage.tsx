import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  useSubscriptionRequests,
  useAcceptRequest,
} from "../../hooks/useSubscriptionRequests";
import {
  updateSubscriptionStatus,
  replaceSubscriptionReceipt,
  getReceiptPresignedUrl,
} from "../../services/subscriptionManagement.service";
import { toast } from "sonner";

// Types définis localement
type SubscriptionRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REFUSED"
  | "ACTIVE"
  | "EXPIRED";

interface SubscriptionFilters {
  searchTerm?: string;
  status?: SubscriptionRequestStatus;
  startDate?: number;
  endDate?: number;
  page?: number;
  size?: number;
}

import { SubscriptionRequestsTable } from "../../components/admin/SubscriptionRequestsTable";
import { SubscriptionRequestFilters } from "../../components/admin/SubscriptionRequestFilters";
import { RefuseDialog } from "../../components/admin/RefuseDialog";
import { ManageSubscriptionDialog } from "../../components/admin/ManageSubscriptionDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { RefreshCw, FileCheck, FileX, Clock } from "lucide-react";

const RequestsPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SubscriptionFilters>({
    page: 0,
    size: 20,
  });

  // Dialogs state
  const [refuseDialogOpen, setRefuseDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  
  // Loading states
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [refusingId, setRefusingId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  // Queries & Mutations
  const { data, isLoading, refetch } = useSubscriptionRequests(filters);
  const acceptMutation = useAcceptRequest();

  // Statistics
  const stats = {
    pending: data?.content.filter((r) => r.status === "PENDING").length || 0,
    accepted: data?.content.filter((r) => 
      r.status === "ACTIVE" || r.status === "SUSPENDED" || r.status === "EXPIRED"
    ).length || 0,
    refused: data?.content.filter((r) => r.status === "REFUSED").length || 0,
  };

  const handleAccept = async (id: string) => {
    if (!user?.email) return;
    setAcceptingId(id);
    try {
      await acceptMutation.mutateAsync({
        subscriptionId: id,
        data: { processedBy: user.email },
      });
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRefuse = (id: string) => {
    setSelectedRequestId(id);
    setRefusingId(id);
    setRefuseDialogOpen(true);
  };
  
  const handleManage = (id: string) => {
    setSelectedRequestId(id);
    setManageDialogOpen(true);
  };
  
  const handleStatusChange = async (subscriptionId: string, newStatus: any) => {
    setIsUpdatingStatus(true);
    try {
      await updateSubscriptionStatus(subscriptionId, newStatus);
      toast.success(`Statut mis à jour vers ${newStatus}`);
      refetch();
      setManageDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la mise à jour du statut");
      console.error('Erreur changement de statut:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  const handleReceiptUpload = async (subscriptionId: string, file: File) => {
    setIsUploadingReceipt(true);
    try {
      await replaceSubscriptionReceipt(subscriptionId, file);
      toast.success("Reçu remplacé avec succès");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de l'upload du reçu");
      console.error('Erreur upload reçu:', error);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleReceiptDelete = async (subscriptionId: string) => {
    // TODO: Implémenter l'API de suppression de reçu
    toast.info("Fonctionnalité de suppression de reçu à venir");
    console.log('Suppression reçu:', subscriptionId);
  };

  const handleFilterChange = (newFilters: Partial<SubscriptionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="container mx-auto py-8 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-muted bg-clip-text text-transparent">
            Demandes & Abonnements
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les demandes d'abonnement des organisations
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2 bg-gray-200" />
                <Skeleton className="h-4 w-32 bg-gray-200" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Demandes à traiter</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
            <FileCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2 bg-gray-200" />
                <Skeleton className="h-4 w-32 bg-gray-200" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.accepted}</div>
                <p className="text-xs text-muted-foreground">Demandes validées</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refusées</CardTitle>
            <FileX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2 bg-gray-200" />
                <Skeleton className="h-4 w-32 bg-gray-200" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.refused}</div>
                <p className="text-xs text-muted-foreground">Demandes rejetées</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <SubscriptionRequestFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes</CardTitle>
          <CardDescription>
            {data?.totalElements || 0} demande(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionRequestsTable
            data={data}
            isLoading={isLoading}
            onAccept={handleAccept}
            onRefuse={handleRefuse}
            onManage={handleManage}
            currentPage={filters.page || 0}
            onPageChange={handlePageChange}
            acceptingId={acceptingId}
            refusingId={refusingId}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RefuseDialog
        open={refuseDialogOpen}
        onOpenChange={(open) => {
          setRefuseDialogOpen(open);
          if (!open) {
            setRefusingId(null);
            setSelectedRequestId(null);
          }
        }}
        subscriptionId={selectedRequestId}
      />
      
      <ManageSubscriptionDialog
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
        subscription={selectedRequestId ? data?.content.find(r => r.id === selectedRequestId) : null}
        onStatusChange={handleStatusChange}
        onReceiptUpload={handleReceiptUpload}
        onReceiptDelete={handleReceiptDelete}
        isUpdating={isUpdatingStatus || isUploadingReceipt}
      />
    </div>
  );
};

export default RequestsPage;
