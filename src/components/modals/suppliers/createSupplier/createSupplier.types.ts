export interface ICreateSheetSupplier {
  isOpen: boolean;
  setIsOpen: (_open: boolean) => void;
  refetch: () => void;
}
