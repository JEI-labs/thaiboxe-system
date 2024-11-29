export interface UseArrayStateReturn<T> {
  state: Array<T>;
  actions: {
    add: (value: T) => T[];
    remove: (index: number) => T[];
    update: (index: number, value: T) => T[];
    setData: (data: Array<T>) => void;
    clearArray: () => void;
    resetArray: () => void;
  };
}
