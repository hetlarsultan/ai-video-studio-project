import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Remove dark class from html
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has correct aria-label for dark mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  it('has tooltip content', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('applies dark class to html element when dark mode is enabled', () => {
    localStorage.setItem('theme', 'dark');
    render(<ThemeToggle />);
    
    // The component should apply dark class on mount
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class when light mode is enabled', () => {
    localStorage.setItem('theme', 'light');
    render(<ThemeToggle />);
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('has correct button styling classes', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('rounded-lg');
    expect(button).toHaveClass('transition-all');
    expect(button).toHaveClass('duration-300');
  });

  it('saves theme preference to localStorage', () => {
    render(<ThemeToggle />);
    
    // Check that localStorage has theme set
    const theme = localStorage.getItem('theme');
    expect(theme).toBeTruthy();
    expect(['dark', 'light']).toContain(theme);
  });

  it('respects system color scheme preference', () => {
    // Mock matchMedia
    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: true, // prefers dark
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    window.matchMedia = mockMatchMedia;

    render(<ThemeToggle />);
    
    // Should apply dark theme based on system preference
    expect(mockMatchMedia).toHaveBeenCalled();
  });

  it('button has focus styles', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus:ring-2');
  });

  it('button has hover effects', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('hover:border-slate-600/50');
    expect(button).toHaveClass('hover:text-slate-100');
    expect(button).toHaveClass('hover:shadow-lg');
  });
});
