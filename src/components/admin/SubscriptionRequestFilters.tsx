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
    onFilterChange({ startDate: date?.getTime() });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    onFilterChange({ endDate: date?.getTime() });
  };

  const handleClearDates = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onFilterChange({ startDate: undefined, endDate: undefined });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche textuelle */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="search">Rechercher</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
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
              <Button onClick={handleSearch}>Rechercher</Button>
            </div>
          </div>

          {/* Filtre par statut */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status">
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
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy', { locale: fr }) : 'Du'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy', { locale: fr }) : 'Au'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>

              {(startDate || endDate) && (
                <Button variant="ghost" size="icon" onClick={handleClearDates}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
