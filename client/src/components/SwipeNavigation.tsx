import React, { useState, useCallback } from 'react';
import { useTouchGestures } from '../hooks/useTouchGestures';

export interface SwipeNavigationStep {
  id: string;
  label: string;
  component: React.ReactNode;
}

export interface SwipeNavigationProps {
  steps: SwipeNavigationStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  showIndicators?: boolean;
  showLabels?: boolean;
  animationDuration?: number;
}

/**
 * مكون للتنقل بين الخطوات باستخدام إيماءات اللمس
 */
export function SwipeNavigation({
  steps,
  currentStepIndex,
  onStepChange,
  showIndicators = true,
  showLabels = true,
  animationDuration = 300,
}: SwipeNavigationProps) {
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSwipeLeft = useCallback(() => {
    if (isAnimating || currentStepIndex >= steps.length - 1) return;
    setSlideDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      onStepChange(currentStepIndex + 1);
      setIsAnimating(false);
      setSlideDirection(null);
    }, animationDuration);
  }, [currentStepIndex, steps.length, isAnimating, onStepChange, animationDuration]);

  const handleSwipeRight = useCallback(() => {
    if (isAnimating || currentStepIndex <= 0) return;
    setSlideDirection('right');
    setIsAnimating(true);
    setTimeout(() => {
      onStepChange(currentStepIndex - 1);
      setIsAnimating(false);
      setSlideDirection(null);
    }, animationDuration);
  }, [currentStepIndex, isAnimating, onStepChange, animationDuration]);

  useTouchGestures(
    {
      onSwipeLeft: handleSwipeLeft,
      onSwipeRight: handleSwipeRight,
    },
    {
      minSwipeDistance: 50,
      maxSwipeTime: 300,
    }
  );

  const currentStep = steps[currentStepIndex];

  return (
    <div className="w-full h-full flex flex-col">
      {/* الرأس مع التسميات */}
      {showLabels && (
        <div className="px-4 py-3 border-b border-border bg-card">
          <h2 className="text-lg font-semibold text-card-foreground">
            {currentStep.label}
          </h2>
          <p className="text-sm text-muted-foreground">
            الخطوة {currentStepIndex + 1} من {steps.length}
          </p>
        </div>
      )}

      {/* محتوى الخطوة مع الرسوم المتحركة */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className={`w-full h-full transition-all duration-${animationDuration} ${
            slideDirection === 'left'
              ? 'translate-x-full opacity-0'
              : slideDirection === 'right'
                ? '-translate-x-full opacity-0'
                : 'translate-x-0 opacity-100'
          }`}
        >
          {currentStep.component}
        </div>
      </div>

      {/* مؤشرات التقدم */}
      {showIndicators && (
        <div className="px-4 py-4 border-t border-border bg-card flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                if (!isAnimating) {
                  onStepChange(index);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStepIndex
                  ? 'w-8 bg-gradient-to-r from-cyan-500 to-purple-500'
                  : 'w-2 bg-muted hover:bg-muted-foreground'
              }`}
              aria-label={`الذهاب إلى ${step.label}`}
              disabled={isAnimating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
