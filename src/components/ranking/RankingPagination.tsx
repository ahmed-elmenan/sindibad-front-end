import { useCallback, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface RankingPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (size: number) => void;
}

export default function RankingPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
}: RankingPaginationProps) {
  const { t } = useTranslation();

  const renderPaginationNumbers = useCallback(() => {
    const items: ReactNode[] = [];
    const maxPagesToShow = 4;

    if (totalPages <= maxPagesToShow) {
      // Affiche toutes les pages si peu de pages
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
              className={currentPage === i ? "bg-primary text-white" : ""}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      return items;
    }

    // Toujours afficher la première page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => setCurrentPage(1)}
          className={currentPage === 1 ? "bg-primary text-white" : ""}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Ellipsis après la première page si besoin
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Pages autour de la page courante
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => setCurrentPage(i)}
            className={currentPage === i ? "bg-primary text-white" : ""}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Ellipsis avant la dernière page si besoin
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Toujours afficher la dernière page
    items.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          isActive={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={currentPage === totalPages ? "bg-primary text-white" : ""}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );

    return items;
  }, [currentPage, totalPages, setCurrentPage]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Card>
      <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
        {/* Select lignes par page */}
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <span className="text-sm text-muted-foreground">
            {t("learnerRanking.rowsPerPage") ?? "Lignes par page"}:
          </span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto justify-center md:justify-end">
          <div className="w-full flex justify-center md:justify-end items-center text-sm text-muted-foreground text-center gap-1 whitespace-nowrap">
            {t("learnerRanking.page") ?? "Page"} {currentPage}{" "}
            {t("learnerRanking.of") ?? "sur"} {totalPages}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {renderPaginationNumbers()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
