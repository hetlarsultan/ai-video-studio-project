import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Toast from './Toast';

describe('Toast Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders toast with success type', () => {
    render(
      <Toast
        id="test-1"
        message="Success message"
        type="success"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders toast with error type', () => {
    render(
      <Toast
        id="test-2"
        message="Error message"
        type="error"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('renders toast with warning type', () => {
    render(
      <Toast
        id="test-3"
        message="Warning message"
        type="warning"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('renders toast with info type', () => {
    render(
      <Toast
        id="test-4"
        message="Info message"
        type="info"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('has close button available', () => {
    render(
      <Toast
        id="test-5"
        message="Click to close"
        type="success"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close notification');
    expect(closeButton).toBeInTheDocument();
  });

  it('closes toast automatically after duration', () => {
    render(
      <Toast
        id="test-6"
        message="Auto close"
        type="success"
        duration={3000}
        onClose={mockOnClose}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);

    expect(mockOnClose).toHaveBeenCalledWith('test-6');
  });

  it('uses default duration of 4000ms', () => {
    render(
      <Toast
        id="test-7"
        message="Default duration"
        type="success"
        onClose={mockOnClose}
      />
    );

    vi.advanceTimersByTime(4000);

    expect(mockOnClose).toHaveBeenCalledWith('test-7');
  });

  it('has correct CSS classes for animation', () => {
    const { container } = render(
      <Toast
        id="test-8"
        message="Animated toast"
        type="success"
        onClose={mockOnClose}
      />
    );

    const toastElement = container.querySelector('.toast-notification');
    expect(toastElement).toHaveClass('animate-slideInRight');
  });
});
