export interface ICreateSheetPlan {
  side?: 'left' | 'right' | 'top' | 'bottom';
  isOpen: boolean;
  setIsOpen: (_open: boolean) => void;
  refetch?: () => void;
}
