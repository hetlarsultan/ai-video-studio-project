import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VideoQualitySelector from './VideoQualitySelector';

describe('VideoQualitySelector', () => {
  it('renders quality and format buttons', () => {
    render(<VideoQualitySelector />);
    expect(screen.getByText(/720p - متوسطة/)).toBeInTheDocument();
    expect(screen.getByText(/MP4/)).toBeInTheDocument();
  });

  it('displays quality options when clicked', () => {
    render(<VideoQualitySelector />);
    const qualityButton = screen.getByText(/720p - متوسطة/);
    fireEvent.click(qualityButton);
    expect(screen.getByText(/360p - منخفضة/)).toBeInTheDocument();
    expect(screen.getByText(/1080p - عالية/)).toBeInTheDocument();
  });

  it('displays format options when clicked', () => {
    render(<VideoQualitySelector />);
    const formatButton = screen.getByText(/MP4/);
    fireEvent.click(formatButton);
    expect(screen.getByText(/WebM/)).toBeInTheDocument();
    expect(screen.getByText(/AVI/)).toBeInTheDocument();
  });

  it('calls onQualityChange when quality is selected', () => {
    const onQualityChange = vi.fn();
    render(<VideoQualitySelector onQualityChange={onQualityChange} />);
    const qualityButton = screen.getByText(/720p - متوسطة/);
    fireEvent.click(qualityButton);
    const option1080p = screen.getByText(/1080p - عالية/);
    fireEvent.click(option1080p);
    expect(onQualityChange).toHaveBeenCalled();
  });

  it('calls onFormatChange when format is selected', () => {
    const onFormatChange = vi.fn();
    render(<VideoQualitySelector onFormatChange={onFormatChange} />);
    const formatButton = screen.getByText(/MP4/);
    fireEvent.click(formatButton);
    const webmOption = screen.getByText(/WebM/);
    fireEvent.click(webmOption);
    expect(onFormatChange).toHaveBeenCalled();
  });

  it('displays info section with resolution and format', () => {
    render(<VideoQualitySelector />);
    expect(screen.getByText(/1280x720/)).toBeInTheDocument();
    expect(screen.getByText(/\.mp4/)).toBeInTheDocument();
  });

  it('disables buttons when disabled prop is true', () => {
    render(<VideoQualitySelector disabled={true} />);
    const qualityButton = screen.getByText(/720p - متوسطة/).closest('button');
    const formatButton = screen.getByText(/MP4/).closest('button');
    expect(qualityButton).toBeDisabled();
    expect(formatButton).toBeDisabled();
  });

  it('shows all quality options with correct details', () => {
    render(<VideoQualitySelector />);
    const qualityButton = screen.getByText(/720p - متوسطة/);
    fireEvent.click(qualityButton);
    expect(screen.getByText(/640x360/)).toBeInTheDocument();
    expect(screen.getByText(/1920x1080/)).toBeInTheDocument();
    expect(screen.getByText(/3840x2160/)).toBeInTheDocument();
  });

  it('shows all format options with correct extensions', () => {
    render(<VideoQualitySelector />);
    const formatButton = screen.getByText(/MP4/);
    fireEvent.click(formatButton);
    expect(screen.getByText(/\.webm/)).toBeInTheDocument();
    expect(screen.getByText(/\.avi/)).toBeInTheDocument();
    expect(screen.getByText(/\.mov/)).toBeInTheDocument();
  });
});
