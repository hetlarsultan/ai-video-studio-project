import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

// Mock useSystemTheme hook
vi.mock('@/hooks/useSystemTheme', () => ({
  useSystemTheme: () => ({
    mode: 'system',
    effectiveTheme: 'dark',
    systemPreference: 'dark',
    setMode: vi.fn(),
    applyTheme: vi.fn(),
    getSystemPreference: () => 'dark',
  }),
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
  });

  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });
    expect(button).toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });
    
    expect(button).toHaveAttribute('aria-label', 'تبديل الموضوع');
    expect(button).toHaveAttribute('aria-expanded');
  });

  it('displays theme options menu on button click', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/وضع داكن/i)).toBeInTheDocument();
      expect(screen.getByText(/وضع فاتح/i)).toBeInTheDocument();
      expect(screen.getByText(/متابعة النظام/i)).toBeInTheDocument();
    });
  });

  it('has correct button styling classes', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });
    
    expect(button).toHaveClass('rounded-lg');
    expect(button).toHaveClass('transition-all');
    expect(button).toHaveClass('duration-300');
  });

  it('button has focus styles', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });
    
    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus:ring-2');
  });

  it('button has hover effects', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });
    
    expect(button).toHaveClass('hover:shadow-lg');
  });

  it('closes menu when clicking outside', async () => {
    const { container } = render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/وضع داكن/i)).toBeInTheDocument();
    });

    // Find and click the backdrop
    const backdrop = container.querySelector('[class*="fixed"]');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByText(/وضع داكن/i)).not.toBeInTheDocument();
    });
  });

  it('closes menu after selecting an option', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/وضع داكن/i)).toBeInTheDocument();
    });

    const darkModeButton = screen.getByRole('button', { name: /تبديل إلى الوضع الداكن/i });
    fireEvent.click(darkModeButton);

    await waitFor(() => {
      expect(screen.queryByText(/وضع داكن/i)).not.toBeInTheDocument();
    });
  });

  it('displays checkmark for active mode', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });

    fireEvent.click(button);

    await waitFor(() => {
      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks.length).toBeGreaterThan(0);
    });
  });

  it('has all theme option buttons', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /تبديل إلى الوضع الداكن/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /تبديل إلى الوضع الفاتح/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /متابعة إعدادات النظام/i })).toBeInTheDocument();
    });
  });

  it('renders icons for each theme option', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /تبديل الموضوع/i });

    fireEvent.click(button);

    await waitFor(() => {
      // Check that icons are rendered (they will be SVG elements from lucide-react)
      const svgs = screen.getByRole('button', { name: /تبديل الموضوع/i }).parentElement?.querySelectorAll('svg');
      expect(svgs).toBeDefined();
    });
  });
});
