// Types définis localement pour éviter les problèmes de cache
type SubscriptionRequestStatus = 'PENDING' | 'REFUSED' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';

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

import { Card, CardContent } from '../ui/card';
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
import { Check, X, Settings, FileText, Loader2 } from 'lucide-react';
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
  onManage: (id: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  acceptingId?: string | null;
  refusingId?: string | null;
}

const statusConfig = {
  PENDING: { label: 'En attente', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800' },
  REFUSED: { label: 'Refusée', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
  ACTIVE: { label: 'Active', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
  SUSPENDED: { label: 'Suspendue', variant: 'default' as const, className: 'bg-orange-100 text-orange-800' },
  EXPIRED: { label: 'Expirée', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' },
};

export const SubscriptionRequestsTable = ({
  data,
  isLoading,
  onAccept,
  onRefuse,
  onManage,
  currentPage,
  onPageChange,
  acceptingId,
  refusingId,
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
      <Card className="p-0 w-full overflow-hidden">
        <CardContent className="p-0 w-full">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
            <Table className="w-full border-collapse table-fixed min-w-full">
              <colgroup>
                <col style={{ width: '12%' }} /> {/* Organisation */}
                <col style={{ width: '15%' }} /> {/* Responsable */}
                <col style={{ width: '14%' }} /> {/* Cours */}
                <col style={{ width: '13%' }} /> {/* Pack */}
                <col style={{ width: '10%' }} /> {/* Montant */}
                <col style={{ width: '10%' }} /> {/* Statut */}
                <col style={{ width: '10%' }} /> {/* Date */}
                <col style={{ width: '16%' }} /> {/* Actions */}
              </colgroup>
              <TableHeader className="sticky top-0 bg-[#f8fafc] z-[5] shadow-sm">
                <TableRow className="border-b">
                  <TableHead className="text-center border-b border-gray-300 bg-[#f8fafc] font-semibold h-10 px-2 sm:px-4 align-middle text-xs sm:text-sm"><div className="truncate">Organisation</div></TableHead>
                  <TableHead className="text-center border-b border-gray-300 bg-[#f8fafc] font-semibold h-10 px-2 sm:px-4 align-middle text-xs sm:text-sm"><div className="truncate">Responsable</div></TableHead>
                  <TableHead className="text-center border-b border-gray-300 bg-[#f8fafc] font-semibold h-10 px-2 sm:px-4 align-middle text-xs sm:text-sm"><div className="truncate">Cours</div></TableHead>
                  <TableHead className="text-center border-b border-gray-300 bg-[#f8fafc] font-semibold h-10 px-2 sm:px-4 align-middle text-xs sm:text-sm"><div className="truncate">Pack</div></TableHead>
                  <TableHead className="text-center border-b border-gray-300 bg-[#f8fafc] font-semibold h-10 px-2 sm:px-4 align-middle text-xs sm:text-sm"><div className="truncate">Montant</div></TableHead>
                  <TableHead className="text-center border-b border-gray-300 bg-[#f8fafc] font-semibold h-10 px-2 sm:px-4 align-middle text-xs sm:text-sm"><div className="truncate">Statut</div></TableHead>
                  <TableHead className="text-center border-b border-gray-300 bg-[#f8fafc] font-semibold h-10 px-2 sm:px-4 align-middle text-xs sm:text-sm"><div className="truncate">Date</div></TableHead>
                  <TableHead className="text-center border-b border-gray-300 bg-[#f8fafc] font-semibold h-10 px-2 sm:px-4 align-middle text-xs sm:text-sm"><div className="truncate">Actions</div></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-0">
                {data.content.map((request: SubscriptionRequest) => (
                  <TableRow key={request.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="text-center border-b border-gray-300 p-2 sm:p-3 font-medium">{request.organisationName}</TableCell>
                    
                    <TableCell className="text-center border-b border-gray-300 p-2 sm:p-3">
                      <div className="text-sm">
                        <div className="font-medium">{request.responsibleFullName}</div>
                        <div className="text-muted-foreground text-xs truncate">{request.responsibleEmail}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center border-b border-gray-300 p-2 sm:p-3">{request.courseName}</TableCell>
                    
                    <TableCell className="text-center border-b border-gray-300 p-2 sm:p-3">
                      <div className="text-sm">
                        {request.packName}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center border-b border-gray-300 p-2 sm:p-3">
                      <div className="text-sm">
                        <div className="font-semibold">{formatCurrency(request.amount)}</div>
                        {request.discountPercentage > 0 && (
                          <div className="text-green-600 text-xs">-{request.discountPercentage}%</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center border-b border-gray-300 p-2 sm:p-3">
                      <Badge className={statusConfig[request.status].className}>
                        {statusConfig[request.status].label}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center border-b border-gray-300 p-2 sm:p-3">
                      <div className="text-sm">
                        <div>{formatDate(request.createdAt)}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center border-b border-gray-300 p-2 sm:p-3">
                      <div className="flex justify-center gap-2 flex-wrap">
                        {request.status === 'PENDING' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAccept(request.id)}
                              disabled={acceptingId === request.id || refusingId === request.id}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              {acceptingId === request.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              Accepter
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRefuse(request.id)}
                              disabled={acceptingId === request.id || refusingId === request.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {refusingId === request.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <X className="h-4 w-4 mr-1" />
                              )}
                              Refuser
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onManage(request.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Gérer
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
