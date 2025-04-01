/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import * as React from 'react';
import { type ThemeProviderProps } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function QueryProvider({
  children,
  // eslint-disable-next-line no-unused-vars
  ...props
}: ThemeProviderProps): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}> {children}</QueryClientProvider>
  );
}
