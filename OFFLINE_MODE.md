# دليل تشغيل البرنامج بدون اتصال بالإنترنت (Offline Mode)

تم تحديث البرنامج ليعمل بشكل كامل بدون الحاجة للاتصال بالإنترنت من خلال تضمين جميع المكتبات الثنائية (Binaries) والملفات التابعة لها محلياً.

## المكتبات المضمنة محلياً

### 1. FFmpeg WASM
تم تنزيل ملفات FFmpeg التالية وتخزينها في المجلد `client/public/ffmpeg/`:
- `ffmpeg.min.js`: المكتبة الرئيسية للواجهة الأمامية.
- `ffmpeg-core.js`: جوهر FFmpeg المكتوب بلغة JavaScript.
- `ffmpeg-core.wasm`: محرك FFmpeg المترجم إلى WebAssembly (الحجم: ~24MB).
- `ffmpeg-core.worker.js`: ملف الـ Worker لمعالجة العمليات في الخلفية.

### 2. GIF.js
تم تنزيل ملفات GIF.js التالية وتخزينها في المجلد `client/public/ffmpeg/`:
- `gif.min.js`: المكتبة الرئيسية لإنشاء صور GIF.
- `gif.worker.js`: ملف الـ Worker الخاص بمعالجة صور GIF.

## التعديلات البرمجية

### تحديث `index.html`
تم تغيير روابط الـ CDN إلى مسارات محلية:
```html
<!-- FFmpeg WASM -->
<script async src="/ffmpeg/ffmpeg.min.js"></script>

<!-- GIF.js -->
<script async src="/ffmpeg/gif.min.js"></script>
```

### تحديث `Home.tsx`
تم تحديث إعدادات تهيئة المكتبات لتشير إلى الملفات المحلية:

**لـ FFmpeg:**
```typescript
const ffmpeg = createFFmpeg({
  log: true,
  corePath: '/ffmpeg/ffmpeg-core.js', // مسار محلي
  // ...
});
```

**لـ GIF.js:**
```typescript
const gif = new (GIF as any)({ 
  workers: 2, 
  quality: 10, 
  workerScript: '/ffmpeg/gif.worker.js' // مسار محلي
});
```

## كيفية التأكد من العمل بدون إنترنت

1. قم بتشغيل البرنامج محلياً.
2. افصل اتصال الإنترنت عن جهازك.
3. قم بتحديث الصفحة (Refresh).
4. ستلاحظ أن حالة النظام تظهر "النظام جاهز ✅" دون الحاجة لتحميل أي ملفات من الإنترنت.
5. يمكنك الآن تحويل الصور إلى فيديو أو GIF بشكل كامل في وضع الأوفلاين.

## ملاحظات هامة
- يتطلب تشغيل FFmpeg WASM محلياً وجود ترويسات أمان (Security Headers) معينة في الخادم، وهي مفعلة بالفعل في ملف `index.html`:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
- تأكد من عدم حذف مجلد `client/public/ffmpeg/` لأنه يحتوي على المحركات الأساسية للبرنامج.
