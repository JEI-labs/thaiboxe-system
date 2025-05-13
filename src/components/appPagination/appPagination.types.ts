export type AppPaginationProps = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (_page: number) => void;
  onItemsPerPageChange?: (_value: number) => void;
  itemsPerPageOptions?: Array<number>;
  itemsPerPageLabel?: string;
};
