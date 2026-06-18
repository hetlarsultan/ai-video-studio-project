import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

interface SystemThemeState {
  mode: ThemeMode;
  systemPreference: 'dark' | 'light';
  effectiveTheme: 'dark' | 'light';
}

/**
 * Hook لمراقبة ومزامنة مظهر الموقع مع إعدادات النظام
 * يدعم ثلاثة أوضاع:
 * - dark: وضع داكن دائم
 * - light: وضع فاتح دائم
 * - system: متابعة إعدادات النظام تلقائياً
 */
export const useSystemTheme = () => {
  const [state, setState] = useState<SystemThemeState>({
    mode: 'system',
    systemPreference: 'dark',
    effectiveTheme: 'dark',
  });

  // الحصول على تفضيل النظام الحالي
  const getSystemPreference = useCallback((): 'dark' | 'light' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, []);

  // حساب الموضوع الفعلي بناءً على الوضع والتفضيل
  const getEffectiveTheme = useCallback(
    (mode: ThemeMode, systemPref: 'dark' | 'light'): 'dark' | 'light' => {
      if (mode === 'system') {
        return systemPref;
      }
      return mode;
    },
    []
  );

  // تحميل التفضيلات المحفوظة عند التحميل
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    const mode = savedMode || 'system';
    const systemPref = getSystemPreference();
    const effectiveTheme = getEffectiveTheme(mode, systemPref);

    setState({
      mode,
      systemPreference: systemPref,
      effectiveTheme,
    });
  }, [getSystemPreference, getEffectiveTheme]);

  // مراقبة تغييرات إعدادات النظام
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newSystemPref = e.matches ? 'dark' : 'light';

      setState((prevState) => {
        // إذا كان المستخدم في وضع system، قم بتحديث الموضوع الفعلي
        if (prevState.mode === 'system') {
          return {
            ...prevState,
            systemPreference: newSystemPref,
            effectiveTheme: newSystemPref,
          };
        }

        // وإلا، قم بتحديث تفضيل النظام فقط
        return {
          ...prevState,
          systemPreference: newSystemPref,
        };
      });
    };

    // إضافة المستمع
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // تعيين الوضع
  const setMode = useCallback((mode: ThemeMode) => {
    localStorage.setItem('themeMode', mode);

    setState((prevState) => {
      const effectiveTheme = getEffectiveTheme(mode, prevState.systemPreference);
      return {
        ...prevState,
        mode,
        effectiveTheme,
      };
    });
  }, [getEffectiveTheme]);

  // تطبيق الموضوع على DOM
  const applyTheme = useCallback((theme: 'dark' | 'light') => {
    const html = document.documentElement;

    // إضافة فئة الانتقال
    html.classList.add('theme-transitioning');

    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      html.style.colorScheme = 'light';
    }

    // إزالة فئة الانتقال بعد انتهاء الرسم المتحرك
    setTimeout(() => {
      html.classList.remove('theme-transitioning');
    }, 300);
  }, []);

  return {
    ...state,
    setMode,
    applyTheme,
    getSystemPreference,
  };
};

export default useSystemTheme;
