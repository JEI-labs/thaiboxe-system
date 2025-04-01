import { useState } from 'react';

import type { UseArrayStateReturn } from './types';

export const useArrayState = <T,>(
  initialState: Array<T> = [],
): UseArrayStateReturn<T> => {
  const [state, setState] = useState<Array<T>>(initialState);

  const add = (value: T): Array<T> => {
    let returnedState = state;

    setState((prevState) => {
      const newState = [...prevState, value];
      returnedState = newState;
      return newState;
    });

    return returnedState;
  };

  const update = (index: number, value: T): Array<T> => {
    let returnedState = state;

    setState((prevState) => {
      const newState = [...prevState];

      newState[index] = value;
      returnedState = newState;
      return newState;
    });

    return returnedState;
  };

  const remove = (index: number): Array<T> => {
    let returnedState = state;

    setState((prevState) => {
      const newState = [...prevState];
      newState.splice(index, 1);
      returnedState = newState;

      return newState;
    });

    return returnedState;
  };

  const setData = (data: Array<T>): void => {
    setState(data);
  };

  const clearArray = (): void => {
    setState([]);
  };

  const resetArray = (): void => {
    setState(initialState);
  };

  return {
    state,
    actions: { add, remove, setData, clearArray, resetArray, update },
  };
};
