import { FinanceEntry } from '@prisma/client';

export interface IFinanceEntry {
  data: FinanceEntry;
}

export interface IFinanceEntriesList {
  entries: Array<FinanceEntry>;
  isLoading: boolean;
  onEdit?: (_id: string) => void;
  onDelete?: (_id: string) => void;
}
