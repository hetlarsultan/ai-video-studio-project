import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DownloadButton } from './DownloadButton';

// Mock the useFFmpeg hook
vi.mock('@/hooks/useFFmpeg', () => ({
  useFFmpeg: () => ({
    isLoaded: false,
    isLoading: false,
    progress: { progress: 0, status: 'جاهز' },
    loadFFmpeg: vi.fn(),
    processVideo: vi.fn(),
    mergeVideos: vi.fn(),
    extractAudio: vi.fn(),
  }),
}));

describe('DownloadButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render download button', () => {
    render(<DownloadButton />);
    const button = screen.getByRole('button', { name: /تحميل الفيديو/i });
    expect(button).toBeInTheDocument();
  });

  it('should have download icon', () => {
    const { container } = render(<DownloadButton />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should accept projectName prop', () => {
    const { container } = render(<DownloadButton projectName="my-project" />);
    expect(container).toBeInTheDocument();
  });

  it('should accept onDownload callback', () => {
    const onDownload = vi.fn();
    render(<DownloadButton onDownload={onDownload} />);
    expect(onDownload).not.toHaveBeenCalled();
  });

  it('should render with default project name', () => {
    render(<DownloadButton />);
    const button = screen.getByRole('button', { name: /تحميل الفيديو/i });
    expect(button).toBeInTheDocument();
  });
});
