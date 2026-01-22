import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  useSubscriptionRequests,
  useAcceptRequest,
} from "../../hooks/useSubscriptionRequests";

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
import { ReceiptDialog } from "../../components/admin/ReceiptDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { RefreshCw, FileCheck, FileX, Clock } from "lucide-react";

const RequestsPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SubscriptionFilters>({
    page: 0,
    size: 20,
  });

  // Dialogs state
  const [refuseDialogOpen, setRefuseDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  // Queries & Mutations
  const { data, isLoading, refetch } = useSubscriptionRequests(filters);
  const acceptMutation = useAcceptRequest();

  // Statistics
  const stats = {
    pending: data?.content.filter((r) => r.status === "PENDING").length || 0,
    accepted: data?.content.filter((r) => r.status === "ACCEPTED").length || 0,
    refused: data?.content.filter((r) => r.status === "REFUSED").length || 0,
  };

  const handleAccept = (id: string) => {
    if (!user?.email) return;
    acceptMutation.mutate({
      subscriptionId: id,
      data: { processedBy: user.email },
    });
  };

  const handleRefuse = (id: string) => {
    setSelectedRequestId(id);
    setRefuseDialogOpen(true);
  };

  const handleViewReceipt = (id: string) => {
    setSelectedRequestId(id);
    setReceiptDialogOpen(true);
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
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Demandes à traiter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
            <FileCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">Demandes validées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refusées</CardTitle>
            <FileX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.refused}</div>
            <p className="text-xs text-muted-foreground">Demandes rejetées</p>
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
            onViewReceipt={handleViewReceipt}
            currentPage={filters.page || 0}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RefuseDialog
        open={refuseDialogOpen}
        onOpenChange={setRefuseDialogOpen}
        subscriptionId={selectedRequestId}
        processedBy={user?.email || ""}
      />

      <ReceiptDialog
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        subscriptionId={selectedRequestId}
      />
    </div>
  );
};

export default RequestsPage;
