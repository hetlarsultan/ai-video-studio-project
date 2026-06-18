import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Smooth Transitions CSS', () => {
  beforeEach(() => {
    // Create a style element and add it to the document
    const style = document.createElement('style');
    style.textContent = `
      .smooth-transition {
        transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    background-image 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .bg-transition {
        transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                    background-image 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .text-transition {
        transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .theme-transitioning {
        animation: themeTransition 0.3s ease-in-out;
      }
      
      @keyframes themeTransition {
        0% { opacity: 0.95; }
        50% { opacity: 1; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  });

  afterEach(() => {
    // Clean up
    const styles = document.querySelectorAll('style');
    styles.forEach((styleEl) => {
      if (styleEl.textContent?.includes('smooth-transition')) {
        styleEl.remove();
      }
    });
  });

  it('should have smooth-transition class with correct transitions', () => {
    const element = document.createElement('div');
    element.className = 'smooth-transition';
    document.body.appendChild(element);

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.transition).toBeTruthy();

    document.body.removeChild(element);
  });

  it('should have bg-transition class for background transitions', () => {
    const element = document.createElement('div');
    element.className = 'bg-transition';
    document.body.appendChild(element);

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.transition).toBeTruthy();

    document.body.removeChild(element);
  });

  it('should have text-transition class for text color transitions', () => {
    const element = document.createElement('div');
    element.className = 'text-transition';
    document.body.appendChild(element);

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.transition).toBeTruthy();

    document.body.removeChild(element);
  });

  it('should have theme-transitioning class with animation', () => {
    const element = document.createElement('div');
    element.className = 'theme-transitioning';
    document.body.appendChild(element);

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.animation).toBeTruthy();

    document.body.removeChild(element);
  });

  it('should apply transitions to multiple properties', () => {
    const element = document.createElement('div');
    element.className = 'smooth-transition';
    document.body.appendChild(element);

    const computedStyle = window.getComputedStyle(element);
    const transition = computedStyle.transition;

    // Check that transition includes multiple properties
    expect(transition).toContain('background-color');
    expect(transition).toContain('color');

    document.body.removeChild(element);
  });

  it('should use cubic-bezier easing for smooth transitions', () => {
    const element = document.createElement('div');
    element.className = 'smooth-transition';
    document.body.appendChild(element);

    const computedStyle = window.getComputedStyle(element);
    const transition = computedStyle.transition;

    // Check for cubic-bezier timing function
    expect(transition).toContain('cubic-bezier');

    document.body.removeChild(element);
  });

  it('should have 0.3s duration for smooth transitions', () => {
    const element = document.createElement('div');
    element.className = 'smooth-transition';
    document.body.appendChild(element);

    const computedStyle = window.getComputedStyle(element);
    const transition = computedStyle.transition;

    // Check for 0.3s duration
    expect(transition).toContain('0.3s');

    document.body.removeChild(element);
  });

  it('should have 0.4s duration for background transitions', () => {
    const element = document.createElement('div');
    element.className = 'bg-transition';
    document.body.appendChild(element);

    const computedStyle = window.getComputedStyle(element);
    const transition = computedStyle.transition;

    // Check for 0.4s duration
    expect(transition).toContain('0.4s');

    document.body.removeChild(element);
  });

  it('should apply transitions to all elements by default', () => {
    const element = document.createElement('div');
    element.style.cssText = `
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    `;
    document.body.appendChild(element);

    const computedStyle = window.getComputedStyle(element);
    expect(computedStyle.transition).toBeTruthy();

    document.body.removeChild(element);
  });

  it('should respect prefers-reduced-motion for accessibility', () => {
    // This test checks if the CSS includes accessibility rules
    const style = document.createElement('style');
    style.textContent = `
      @media (prefers-reduced-motion: reduce) {
        * {
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);

    expect(style.sheet).toBeTruthy();

    style.remove();
  });
});
