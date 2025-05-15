export interface ISheetEditPlan {
  isOpen: boolean;
  setIsOpen: (_open: boolean) => void;
  planId: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  refetch?: () => void;
}
