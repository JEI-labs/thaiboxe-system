export interface ISheetEditCategory {
  side: 'left' | 'right' | 'bottom' | 'top';
  isOpen: boolean;
  setIsOpen: (_open: boolean) => void;
  categoryId: string;
  refetch?: () => void;
}
