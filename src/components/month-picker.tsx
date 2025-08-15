'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getMonthName = (monthIndex: number) => {
  const date = new Date();
  date.setMonth(monthIndex);
  return format(date, 'MMMM', { locale: es });
};

interface MonthPickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function MonthPicker({ date, onDateChange }: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [year, setYear] = React.useState(date.getFullYear());

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(year, monthIndex, 1);
    onDateChange(newDate);
    setOpen(false);
  };

  const nextYear = () => setYear(year + 1);
  const prevYear = () => setYear(year - 1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(date, 'MMMM yyyy', { locale: es })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Button onClick={prevYear} variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold">{year}</div>
            <Button onClick={nextYear} variant="outline" size="icon" className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Button
                key={i}
                onClick={() => handleMonthSelect(i)}
                variant={date.getMonth() === i && date.getFullYear() === year ? 'default' : 'ghost'}
              >
                {getMonthName(i).charAt(0).toUpperCase() + getMonthName(i).slice(1, 3)}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
