import { useState } from 'react';

// Types définis localement
type SubscriptionRequestStatus = 'PENDING' | 'REFUSED' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';

interface SubscriptionFilters {
  searchTerm?: string;
  status?: SubscriptionRequestStatus;
  startDate?: number;
  endDate?: number;
  page?: number;
  size?: number;
}

import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface SubscriptionRequestFiltersProps {
  filters: SubscriptionFilters;
  onFilterChange: (filters: Partial<SubscriptionFilters>) => void;
}

export const SubscriptionRequestFilters = ({
  filters,
  onFilterChange,
}: SubscriptionRequestFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.searchTerm || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  const handleSearch = () => {
    onFilterChange({ searchTerm: searchInput || undefined });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onFilterChange({ searchTerm: undefined });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      status: value === 'all' ? undefined : (value as SubscriptionRequestStatus),
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    onFilterChange({ startDate: date ? date.getTime() : undefined });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    onFilterChange({ endDate: date ? date.getTime() : undefined });
  };



  const handleResetFilters = () => {
    setSearchInput('');
    setStartDate(undefined);
    setEndDate(undefined);
    onFilterChange({
      searchTerm: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Ligne 1: Recherche textuelle et bouton rechercher */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Organisation, responsable, cours..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-8"
                />
                {searchInput && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>

          {/* Ligne 2: Statut, dates et bouton réinitialiser */}
          <div className="flex flex-wrap gap-2 items-end">
            {/* Filtre par statut */}
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="status" className="w-40">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="REFUSED">Refusées</SelectItem>
                  <SelectItem value="ACTIVE">Actives</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendues</SelectItem>
                  <SelectItem value="EXPIRED">Expirées</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Plage de dates */}
            <div className="space-y-2">
              <Label>Période</Label>
              <div className="flex gap-2 items-center">
                {/* Bouton calendrier début */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex items-center justify-start text-left font-normal h-9 px-3 overflow-hidden w-40',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate block">
                        {startDate ? format(startDate, 'dd/MM/yyyy', { locale: fr }) : 'Du'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      locale={fr}
                      disabled={(date: Date) => endDate ? date > endDate : false}
                    />
                  </PopoverContent>
                </Popover>

                {/* Bouton calendrier fin */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex items-center justify-start text-left font-normal h-9 px-3 overflow-hidden w-40',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate block">
                        {endDate ? format(endDate, 'dd/MM/yyyy', { locale: fr }) : 'Au'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      locale={fr}
                      disabled={(date: Date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Bouton réinitialiser les filtres */}
            <Button variant="outline" onClick={handleResetFilters}>
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
