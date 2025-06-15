import { ICreateFinanceEntry } from '@/server/validations/finance';

export interface IEditRevenues {
  side: 'right' | 'bottom';
  isOpen: boolean;
  setIsOpen: (_open: boolean) => void;
  entry: ICreateFinanceEntry & { id: string };
  refetch?: () => void;
}
