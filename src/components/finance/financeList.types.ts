import { Prisma } from '@prisma/client';

export type IFinanceEntryWithStudent = Prisma.FinanceEntryGetPayload<{
  include: { student: true };
}>;

export interface IFinanceEntriesList {
  entries: Array<IFinanceEntryWithStudent>;
  isLoading: boolean;
  onEdit?: (_id: string) => void;
  onDelete?: (_id: string) => void;
}
