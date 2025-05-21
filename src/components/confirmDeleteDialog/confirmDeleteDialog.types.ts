export interface IConfirmDeleteDialog<T> {
  item: T;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onConfirm: (_item: T) => Promise<void>;
}
