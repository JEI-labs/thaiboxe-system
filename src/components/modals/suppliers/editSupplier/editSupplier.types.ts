export interface IEditSheetSupplier {
  isOpen: boolean;
  setIsOpen: (_open: boolean) => void;
  supplierId: string;
  refetch: () => void;
}
