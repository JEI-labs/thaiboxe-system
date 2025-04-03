'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggler(): JSX.Element {
  const { theme, setTheme } = useTheme();

  const handleToggleMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      className="w-full justify-normal gap-2 hover:bg-transparent"
      variant="ghost"
      size="icon"
      onClick={handleToggleMode}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] dark:hidden" />
      <Moon className="hidden h-[1.2rem] w-[1.2rem] dark:block" />
      Tema
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
