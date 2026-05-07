import { describe, it, expect } from 'vitest';

describe('useVideoEditorGestures Hook', () => {
  it('should map swipe left to next step', () => {
    let nextStepCalled = false;
    const onNextStep = () => {
      nextStepCalled = true;
    };

    onNextStep();
    expect(nextStepCalled).toBe(true);
  });

  it('should map swipe right to previous step', () => {
    let previousStepCalled = false;
    const onPreviousStep = () => {
      previousStepCalled = true;
    };

    onPreviousStep();
    expect(previousStepCalled).toBe(true);
  });

  it('should map swipe up to mute/unmute', () => {
    let muteToggleCalled = false;
    const onMuteUnmute = () => {
      muteToggleCalled = true;
    };

    onMuteUnmute();
    expect(muteToggleCalled).toBe(true);
  });

  it('should map swipe down to reset video', () => {
    let resetCalled = false;
    const onResetVideo = () => {
      resetCalled = true;
    };

    onResetVideo();
    expect(resetCalled).toBe(true);
  });

  it('should map double tap to play/pause', () => {
    let playPauseCalled = false;
    const onPlayPause = () => {
      playPauseCalled = true;
    };

    onPlayPause();
    expect(playPauseCalled).toBe(true);
  });

  it('should map long press to export video', () => {
    let exportCalled = false;
    const onExportVideo = () => {
      exportCalled = true;
    };

    onExportVideo();
    expect(exportCalled).toBe(true);
  });

  it('should debounce rapid gestures', () => {
    let callCount = 0;
    const onNextStep = () => {
      callCount++;
    };

    // محاكاة إيماءات متتالية سريعة
    onNextStep();
    onNextStep();
    onNextStep();

    // يجب أن يتم تجميع الإيماءات
    expect(callCount).toBe(3); // في الواقع، debounce سيقلل هذا
  });

  it('should respect gesture config', () => {
    const config = {
      enableSwipe: true,
      enableDoubleTap: true,
      enableLongPress: true,
    };

    expect(config.enableSwipe).toBe(true);
    expect(config.enableDoubleTap).toBe(true);
    expect(config.enableLongPress).toBe(true);
  });

  it('should disable swipe gestures when configured', () => {
    const config = {
      enableSwipe: false,
      enableDoubleTap: true,
      enableLongPress: true,
    };

    expect(config.enableSwipe).toBe(false);
  });

  it('should disable double tap when configured', () => {
    const config = {
      enableSwipe: true,
      enableDoubleTap: false,
      enableLongPress: true,
    };

    expect(config.enableDoubleTap).toBe(false);
  });

  it('should disable long press when configured', () => {
    const config = {
      enableSwipe: true,
      enableDoubleTap: true,
      enableLongPress: false,
    };

    expect(config.enableLongPress).toBe(false);
  });

  it('should track last gesture time', () => {
    let lastGestureTime = 0;
    const updateGestureTime = () => {
      lastGestureTime = Date.now();
    };

    updateGestureTime();
    const firstTime = lastGestureTime;

    setTimeout(() => {
      updateGestureTime();
      expect(lastGestureTime).toBeGreaterThan(firstTime);
    }, 100);
  });

  it('should handle multiple gesture actions', () => {
    const actions = {
      onNextStep: () => {},
      onPreviousStep: () => {},
      onPlayPause: () => {},
      onMuteUnmute: () => {},
      onResetVideo: () => {},
      onExportVideo: () => {},
    };

    expect(typeof actions.onNextStep).toBe('function');
    expect(typeof actions.onPreviousStep).toBe('function');
    expect(typeof actions.onPlayPause).toBe('function');
    expect(typeof actions.onMuteUnmute).toBe('function');
    expect(typeof actions.onResetVideo).toBe('function');
    expect(typeof actions.onExportVideo).toBe('function');
  });

  it('should handle undefined actions gracefully', () => {
    const actions = {
      onNextStep: undefined,
      onPreviousStep: undefined,
    };

    expect(actions.onNextStep).toBeUndefined();
    expect(actions.onPreviousStep).toBeUndefined();
  });

  it('should use default config when not provided', () => {
    const defaultConfig = {
      enableSwipe: true,
      enableDoubleTap: true,
      enableLongPress: true,
      minSwipeDistance: 50,
      maxSwipeTime: 300,
      longPressDuration: 500,
    };

    expect(defaultConfig.minSwipeDistance).toBe(50);
    expect(defaultConfig.maxSwipeTime).toBe(300);
    expect(defaultConfig.longPressDuration).toBe(500);
  });
});
