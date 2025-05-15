export interface ICreateSheetPlan {
  side: 'left' | 'right';
  isOpen: boolean;
  setIsOpen: (_open: boolean) => void;
  refetch?: () => void;
}
