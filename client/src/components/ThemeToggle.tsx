import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // تحميل التفضيل المحفوظ من localStorage
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  // تطبيق الموضوع
  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      html.classList.remove('light');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      html.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  // تبديل الموضوع
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
  };

  // لا نعرض الزر حتى يتم تحميل الصفحة
  if (!isMounted) {
    return null;
  }

  return (
    <Tooltip content={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'} position="bottom">
      <button
        onClick={toggleTheme}
        className="
          relative
          inline-flex
          items-center
          justify-center
          w-10
          h-10
          rounded-lg
          bg-gradient-to-r
          from-slate-800/50
          to-slate-900/50
          border
          border-slate-700/50
          hover:border-slate-600/50
          text-slate-300
          hover:text-slate-100
          transition-all
          duration-300
          hover:shadow-lg
          hover:shadow-cyan-500/20
          focus:outline-none
          focus:ring-2
          focus:ring-cyan-500/50
          focus:ring-offset-2
          focus:ring-offset-slate-950
        "
        aria-label={isDark ? 'تبديل إلى الوضع الفاتح' : 'تبديل إلى الوضع الداكن'}
      >
        <div className="relative w-6 h-6">
          {isDark ? (
            <Moon
              className="
                absolute
                w-6
                h-6
                animate-fadeIn
              "
            />
          ) : (
            <Sun
              className="
                absolute
                w-6
                h-6
                animate-fadeIn
              "
            />
          )}
        </div>
      </button>
    </Tooltip>
  );
};

export default ThemeToggle;
