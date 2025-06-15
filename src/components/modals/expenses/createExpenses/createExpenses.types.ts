export interface ICreateExpenses {
  side: 'left' | 'right' | 'bottom' | 'top';
  isOpen: boolean;
  setIsOpen: (_open: boolean) => void;
  refetch?: () => void;
}
