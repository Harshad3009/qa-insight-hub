import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDateFilter } from '@/contexts/DateFilterContext';

export function GlobalDateFilter() {
  const { days, setDays } = useDateFilter();

  return (
    <Select value={days} onValueChange={(value) => setDays(value as typeof days)}>
      <SelectTrigger className="w-[150px] bg-background/50 border-border">
        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">Last 7 days</SelectItem>
        <SelectItem value="15">Last 15 days</SelectItem>
        <SelectItem value="30">Last 30 days</SelectItem>
        <SelectItem value="60">Last 60 days</SelectItem>
        <SelectItem value="90">Last 90 days</SelectItem>
      </SelectContent>
    </Select>
  );
}
