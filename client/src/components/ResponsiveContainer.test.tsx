import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResponsiveContainer from './ResponsiveContainer';

describe('ResponsiveContainer', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <ResponsiveContainer>
        <div>Test Content</div>
      </ResponsiveContainer>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have responsive-container class', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const element = container.querySelector('.responsive-container');
    expect(element).toBeInTheDocument();
  });

  it('should have correct screen size class', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const element = container.querySelector('.responsive-container');
    expect(element).toHaveClass('screen-desktop');
  });

  it('should have correct orientation class', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const element = container.querySelector('.responsive-container');
    expect(element).toHaveClass('orientation-portrait');
  });

  it('should have data attributes', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const element = container.querySelector('.responsive-container');
    expect(element).toHaveAttribute('data-screen-size', 'desktop');
    expect(element).toHaveAttribute('data-orientation', 'portrait');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ResponsiveContainer className="custom-class">
        <div>Test</div>
      </ResponsiveContainer>
    );

    const element = container.querySelector('.responsive-container');
    expect(element).toHaveClass('custom-class');
  });

  it('should render multiple children', () => {
    render(
      <ResponsiveContainer>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ResponsiveContainer>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('should handle mobile screen size', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const element = container.querySelector('.responsive-container');
    expect(element).toHaveClass('screen-mobile');
  });

  it('should handle tablet screen size', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const element = container.querySelector('.responsive-container');
    expect(element).toHaveClass('screen-tablet');
  });

  it('should handle large screen size', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const element = container.querySelector('.responsive-container');
    expect(element).toHaveClass('screen-large');
  });

  it('should handle landscape orientation', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const element = container.querySelector('.responsive-container');
    expect(element).toHaveClass('orientation-landscape');
  });
});
