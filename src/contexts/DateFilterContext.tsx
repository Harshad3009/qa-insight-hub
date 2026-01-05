import { createContext, useContext, useState, ReactNode } from 'react';

type DateFilterValue = '7' | '15' | '30' | '60' | '90';

interface DateFilterContextType {
  days: DateFilterValue;
  setDays: (days: DateFilterValue) => void;
  daysNumber: number;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState<DateFilterValue>('30');

  return (
    <DateFilterContext.Provider value={{ days, setDays, daysNumber: parseInt(days) }}>
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
}
