import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

// Test component that uses the useToast hook
const TestComponent = () => {
  const { showToast, toasts } = useToast();

  return (
    <div>
      <button onClick={() => showToast('Success!', 'success')}>
        Show Success
      </button>
      <button onClick={() => showToast('Error!', 'error')}>
        Show Error
      </button>
      <button onClick={() => showToast('Warning!', 'warning')}>
        Show Warning
      </button>
      <button onClick={() => showToast('Info!', 'info')}>
        Show Info
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    // Clear all toasts before each test
  });

  it('provides useToast hook', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Show Success')).toBeInTheDocument();
  });

  it('throws error when useToast is used outside ToastProvider', () => {
    // Create a component that uses useToast without provider
    const ComponentWithoutProvider = () => {
      try {
        useToast();
        return <div>Should not render</div>;
      } catch (error) {
        return <div>{(error as Error).message}</div>;
      }
    };

    render(<ComponentWithoutProvider />);
    expect(screen.getByText(/useToast must be used within ToastProvider/)).toBeInTheDocument();
  });

  it('renders toast notifications container', () => {
    const { container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const toastContainer = container.querySelector('.fixed.bottom-4.right-4');
    expect(toastContainer).toBeInTheDocument();
  });

  it('displays multiple toasts', async () => {
    const { container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByText('Show Success');
    const errorButton = screen.getByText('Show Error');

    // Click buttons to show toasts
    successButton.click();
    errorButton.click();

    // Wait for toasts to appear
    await waitFor(() => {
      const toasts = container.querySelectorAll('.toast-notification');
      expect(toasts.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('has correct z-index for toast container', () => {
    const { container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const toastContainer = container.querySelector('.z-50');
    expect(toastContainer).toBeInTheDocument();
  });
});
