import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateFiltersProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onPresetDates: (days: number) => void;
  onClearFilters: () => void;
}

export function DateFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetDates,
  onClearFilters,
}: DateFiltersProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
            size="sm"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate
              ? format(startDate, "dd/MM/yyyy", { locale: ptBR })
              : "Data inicial"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            disabled={(date) => (endDate ? date > endDate : false)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <span className="text-sm text-muted-foreground">até</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
            size="sm"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate
              ? format(endDate, "dd/MM/yyyy", { locale: ptBR })
              : "Data final"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={endDate}
            onSelect={onEndDateChange}
            disabled={(date) => (startDate ? date < startDate : false)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex items-center gap-1 ml-2 border-l pl-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPresetDates(7)}
          className="text-xs h-7 px-2"
        >
          7d
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPresetDates(30)}
          className="text-xs h-7 px-2"
        >
          30d
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-xs h-7 px-1"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
