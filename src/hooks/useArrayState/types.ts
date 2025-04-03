export interface UseArrayStateReturn<T> {
  state: Array<T>;
  actions: {
    add: (_value: T) => Array<T>;
    remove: (_index: number) => Array<T>;
    update: (_index: number, _value: T) => Array<T>;
    setData: (_data: Array<T>) => void;
    clearArray: () => void;
    resetArray: () => void;
  };
}
