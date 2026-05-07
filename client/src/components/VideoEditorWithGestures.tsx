import React, { useState, useCallback } from 'react';
import { SwipeNavigation, SwipeNavigationStep } from './SwipeNavigation';

export interface VideoEditorStep {
  id: string;
  label: string;
  description: string;
  component: React.ReactNode;
  onEnter?: () => void;
  onExit?: () => void;
}

export interface VideoEditorWithGesturesProps {
  steps: VideoEditorStep[];
  onStepChange?: (stepIndex: number) => void;
  onComplete?: () => void;
  showStepIndicators?: boolean;
  animationDuration?: number;
}

/**
 * مكون محرر الفيديو مع دعم الإيماءات
 * يوفر تنقل سلس بين خطوات تحرير الفيديو
 */
export function VideoEditorWithGestures({
  steps,
  onStepChange,
  onComplete,
  showStepIndicators = true,
  animationDuration = 300,
}: VideoEditorWithGesturesProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleStepChange = useCallback(
    (newIndex: number) => {
      const currentStep = steps[currentStepIndex];
      const newStep = steps[newIndex];

      // تنفيذ callback الخروج من الخطوة الحالية
      if (currentStep?.onExit) {
        currentStep.onExit();
      }

      // تحديث الخطوة
      setCurrentStepIndex(newIndex);

      // تنفيذ callback الدخول إلى الخطوة الجديدة
      if (newStep?.onEnter) {
        newStep.onEnter();
      }

      // استدعاء callback التغيير
      onStepChange?.(newIndex);

      // التحقق من الانتهاء
      if (newIndex === steps.length - 1) {
        onComplete?.();
      }
    },
    [currentStepIndex, steps, onStepChange, onComplete]
  );

  // تحويل الخطوات إلى صيغة SwipeNavigation
  const swipeSteps: SwipeNavigationStep[] = steps.map((step) => ({
    id: step.id,
    label: step.label,
    component: (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 overflow-auto p-4">
          {step.component}
        </div>
        <div className="text-sm text-muted-foreground px-4 py-2 border-t border-border">
          {step.description}
        </div>
      </div>
    ),
  }));

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <SwipeNavigation
        steps={swipeSteps}
        currentStepIndex={currentStepIndex}
        onStepChange={handleStepChange}
        showIndicators={showStepIndicators}
        showLabels={true}
        animationDuration={animationDuration}
      />

      {/* معلومات إضافية */}
      <div className="px-4 py-2 bg-card border-t border-border text-xs text-muted-foreground">
        <p>
          💡 استخدم التمرير الأفقي للتنقل بين الخطوات (يمين/يسار)
        </p>
      </div>
    </div>
  );
}
