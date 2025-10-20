'use client';

import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useStore } from '@/lib/store';

export default function ThemeToggle() {
  const { theme, setTheme } = useStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!theme) return null;

  return (
    <Button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      size="icon"
      variant="outline"
    >
      {theme ? (theme === 'light' ? (<Moon className="h-5 w-5" />) : (<Sun className="h-5 w-5" />)) : (<Moon className="h-5 w-5" />)}
    </Button>
  );
}
