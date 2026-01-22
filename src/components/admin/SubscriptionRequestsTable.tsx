// Types définis localement pour éviter les problèmes de cache
type SubscriptionRequestStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'ACTIVE' | 'EXPIRED';

interface SubscriptionRequest {
  id: string;
  organisationName: string;
  responsibleFullName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  courseId: string;
  courseName: string;
  packId: string;
  packName: string;
  minLearners: number;
  maxLearners: number;
  unitPrice: number;
  discountPercentage: number;
  amount: number;
  status: SubscriptionRequestStatus;
  createdAt: string;
  receiptUrl: string | null;
  receiptFileName: string | null;
  refusedReason: string | null;
  processedBy: string | null;
  processedAt: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface SubscriptionRequestsResponse {
  content: SubscriptionRequest[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, X, Eye, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

interface SubscriptionRequestsTableProps {
  data?: SubscriptionRequestsResponse;
  isLoading: boolean;
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
  onViewReceipt: (id: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const statusConfig = {
  PENDING: { label: 'En attente', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Acceptée', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
  REFUSED: { label: 'Refusée', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
  ACTIVE: { label: 'Active', variant: 'default' as const, className: 'bg-blue-100 text-blue-800' },
  EXPIRED: { label: 'Expirée', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' },
};

export const SubscriptionRequestsTable = ({
  data,
  isLoading,
  onAccept,
  onRefuse,
  onViewReceipt,
  currentPage,
  onPageChange,
}: SubscriptionRequestsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Aucune demande trouvée</p>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organisation</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Cours</TableHead>
              <TableHead>Pack</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reçu</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.content.map((request: SubscriptionRequest) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.organisationName}</TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{request.responsibleFullName}</div>
                    <div className="text-muted-foreground">{request.responsibleEmail}</div>
                  </div>
                </TableCell>
                
                <TableCell>{request.courseName}</TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <div>{request.packName}</div>
                    <div className="text-muted-foreground">
                      {request.minLearners}-{request.maxLearners} apprenants
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <div className="font-semibold">{formatCurrency(request.amount)}</div>
                    {request.discountPercentage > 0 && (
                      <div className="text-green-600">-{request.discountPercentage}%</div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge className={statusConfig[request.status].className}>
                    {statusConfig[request.status].label}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <div className="text-muted-foreground">Créée:</div>
                    <div>{formatDate(request.createdAt)}</div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {request.receiptUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewReceipt(request.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {request.status === 'PENDING' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAccept(request.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accepter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRefuse(request.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </>
                    )}
                    {request.status === 'REFUSED' && request.refusedReason && (
                      <div className="text-xs text-red-600 max-w-[200px] truncate" title={request.refusedReason}>
                        {request.refusedReason}
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(currentPage - 1)}
                className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: data.totalPages }, (_, i) => i).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                className={
                  currentPage === data.totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
