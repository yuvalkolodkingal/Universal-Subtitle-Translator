import React from 'react';
import { Sun, Moon, Github } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const Header: React.FC = () => {
  const [theme, toggle] = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="/" className="flex items-center gap-2.5 rounded-md" aria-label="Subtitle Translator home">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            Subtitle Translator
          </span>
        </a>

        <div className="flex items-center gap-1">
          <a
            href="https://github.com/yuvalkolodkingal/Universal-Subtitle-Translator"
            target="_blank"
            rel="noreferrer noopener"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
            aria-label="View source on GitHub"
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>
    </header>
  );
};

/** Caption-bar mark — a nod to on-screen subtitles. */
const Logo: React.FC = () => (
  <span
    className="flex h-7 w-7 items-center justify-center rounded-md bg-accent"
    aria-hidden="true"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="4.5" width="12" height="7" rx="2" stroke="var(--accent-ink)" strokeWidth="1.5" />
      <path d="M5 8.25h2.5M9 8.25h2" stroke="var(--accent-ink)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </span>
);
