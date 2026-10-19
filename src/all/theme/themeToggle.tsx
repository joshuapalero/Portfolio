import { Monitor, Sun, Moon } from 'lucide-react';
import type { CSSProperties, MouseEvent } from 'react';
import { useTheme } from './useTheme';
import { Theme, type ThemeType } from './ThemeContext';
import './theme_toggle.css';

interface ThemeOption {
  readonly value: ThemeType;
  readonly label: string;
  readonly icon: typeof Monitor;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: Theme.SYSTEM, label: 'System', icon: Monitor },
  { value: Theme.LIGHT, label: 'Light', icon: Sun },
  { value: Theme.DARK, label: 'Dark', icon: Moon },
];

export interface ThemeToggleProps {
  readonly embedded?: boolean;
  readonly showLabels?: boolean;
  readonly className?: string;
}

export default function ThemeToggle({
  embedded = false,
  showLabels = false,
  className = '',
}: ThemeToggleProps = {}) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const activeIndex = Math.max(
    0,
    THEME_OPTIONS.findIndex((opt) => opt.value === theme),
  );

  const switcherStyle: CSSProperties = {
    ['--active-index' as string]: activeIndex,
  };

  const handleSelectTheme = (value: ThemeType, e: MouseEvent<HTMLButtonElement>) => {
    setTheme(value, e);
  };

  return (
    <nav
      className={`theme-switcher-wrapper ${embedded ? 'is-embedded' : ''} ${showLabels ? 'has-labels' : ''} ${className}`.trim()}
      role="radiogroup"
      aria-label="Theme preference switcher"
    >
      <div className={`theme-switcher ${showLabels ? 'has-labels' : ''}`} style={switcherStyle}>
        {/* Animated sliding highlight indicator pill */}
        <div className="theme-switcher-indicator" aria-hidden="true" />

        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const isActive = theme === value;
          const isSystem = value === Theme.SYSTEM;
          const titleDesc = isSystem
            ? `System preference (currently ${resolvedTheme})`
            : `${label} mode`;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`theme-switcher-btn ${isActive ? 'active' : ''} theme-switcher-${value}`}
              onClick={(e) => handleSelectTheme(value, e)}
              title={titleDesc}
              aria-label={titleDesc}
            >
              <Icon size={showLabels ? 14 : 15} className="theme-btn-icon" aria-hidden="true" />
              {showLabels && <span className="theme-btn-label">{label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
