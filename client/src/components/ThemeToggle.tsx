import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import { useSystemTheme, type ThemeMode } from '@/hooks/useSystemTheme';

export const ThemeToggle: React.FC = () => {
  const { mode, effectiveTheme, setMode, applyTheme } = useSystemTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // تطبيق الموضوع الفعلي على DOM عند التغيير
  useEffect(() => {
    if (isMounted) {
      applyTheme(effectiveTheme);
    }
  }, [effectiveTheme, isMounted, applyTheme]);

  // تحديد التحميل
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // معالجات تغيير الوضع
  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    setShowMenu(false);
  };

  // لا نعرض الزر حتى يتم تحميل الصفحة
  if (!isMounted) {
    return null;
  }

  const getTooltipContent = () => {
    switch (mode) {
      case 'dark':
        return 'وضع داكن دائم';
      case 'light':
        return 'وضع فاتح دائم';
      case 'system':
        return `متابعة النظام (${effectiveTheme === 'dark' ? 'داكن' : 'فاتح'})`;
      default:
        return 'تبديل الموضوع';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'dark':
        return <Moon className="w-6 h-6 animate-fadeIn" />;
      case 'light':
        return <Sun className="w-6 h-6 animate-fadeIn" />;
      case 'system':
        return <Monitor className="w-6 h-6 animate-fadeIn" />;
      default:
        return effectiveTheme === 'dark' ? (
          <Moon className="w-6 h-6 animate-fadeIn" />
        ) : (
          <Sun className="w-6 h-6 animate-fadeIn" />
        );
    }
  };

  return (
    <div className="relative">
      <Tooltip content={getTooltipContent()} position="bottom">
        <button
          onClick={() => setShowMenu(!showMenu)}
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
            dark:from-slate-800/50
            dark:to-slate-900/50
            light:from-slate-100/50
            light:to-slate-200/50
            border
            border-slate-700/50
            dark:border-slate-700/50
            light:border-slate-300/50
            hover:border-slate-600/50
            dark:hover:border-slate-600/50
            light:hover:border-slate-400/50
            text-slate-300
            dark:text-slate-300
            light:text-slate-700
            hover:text-slate-100
            dark:hover:text-slate-100
            light:hover:text-slate-900
            transition-all
            duration-300
            hover:shadow-lg
            hover:shadow-cyan-500/20
            focus:outline-none
            focus:ring-2
            focus:ring-cyan-500/50
            focus:ring-offset-2
            focus:ring-offset-slate-950
            dark:focus:ring-offset-slate-950
            light:focus:ring-offset-white
          "
          aria-label="تبديل الموضوع"
          aria-expanded={showMenu}
        >
          <div className="relative w-6 h-6">
            {getIcon()}
          </div>
        </button>
      </Tooltip>

      {/* قائمة الخيارات */}
      {showMenu && (
        <div
          className="
            absolute
            top-full
            right-0
            mt-2
            w-48
            rounded-lg
            bg-slate-800
            dark:bg-slate-800
            light:bg-white
            border
            border-slate-700
            dark:border-slate-700
            light:border-slate-200
            shadow-lg
            shadow-black/50
            z-50
            overflow-hidden
            animate-slideInDown
          "
        >
          {/* خيار الوضع الداكن */}
          <button
            onClick={() => handleModeChange('dark')}
            className={`
              w-full
              px-4
              py-3
              flex
              items-center
              gap-3
              transition-colors
              duration-200
              ${
                mode === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 light:bg-cyan-100 light:text-cyan-700'
                  : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-100'
              }
            `}
            aria-label="تبديل إلى الوضع الداكن"
          >
            <Moon className="w-5 h-5" />
            <span>وضع داكن</span>
            {mode === 'dark' && (
              <span className="ml-auto text-cyan-400">✓</span>
            )}
          </button>

          {/* خيار الوضع الفاتح */}
          <button
            onClick={() => handleModeChange('light')}
            className={`
              w-full
              px-4
              py-3
              flex
              items-center
              gap-3
              transition-colors
              duration-200
              border-t
              border-slate-700
              dark:border-slate-700
              light:border-slate-200
              ${
                mode === 'light'
                  ? 'bg-cyan-500/20 text-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 light:bg-cyan-100 light:text-cyan-700'
                  : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-100'
              }
            `}
            aria-label="تبديل إلى الوضع الفاتح"
          >
            <Sun className="w-5 h-5" />
            <span>وضع فاتح</span>
            {mode === 'light' && (
              <span className="ml-auto text-cyan-400">✓</span>
            )}
          </button>

          {/* خيار متابعة النظام */}
          <button
            onClick={() => handleModeChange('system')}
            className={`
              w-full
              px-4
              py-3
              flex
              items-center
              gap-3
              transition-colors
              duration-200
              border-t
              border-slate-700
              dark:border-slate-700
              light:border-slate-200
              ${
                mode === 'system'
                  ? 'bg-cyan-500/20 text-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 light:bg-cyan-100 light:text-cyan-700'
                  : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-100'
              }
            `}
            aria-label="متابعة إعدادات النظام"
          >
            <Monitor className="w-5 h-5" />
            <span>متابعة النظام</span>
            {mode === 'system' && (
              <span className="ml-auto text-cyan-400">✓</span>
            )}
          </button>
        </div>
      )}

      {/* إغلاق القائمة عند الضغط خارجها */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ThemeToggle;
