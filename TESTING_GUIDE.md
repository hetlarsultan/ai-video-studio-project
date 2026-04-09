# دليل اختبار نظام مكتبة القوالب

## الاختبارات الوحدة (Unit Tests)

### اختبار دوال قاعدة البيانات

```typescript
// test/db.templates.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  getTemplates, 
  getTemplateById, 
  incrementTemplateUsage,
  insertTemplate 
} from '@/server/db';

describe('Template Database Functions', () => {
  const testTemplate = {
    title: 'Test Template',
    description: 'A test template',
    category: 'test',
    config: JSON.stringify({ duration: 30 }),
    isPremium: 0,
  };

  it('should insert a template', async () => {
    const result = await insertTemplate(testTemplate);
    expect(result).toBeDefined();
  });

  it('should get all templates', async () => {
    const templates = await getTemplates();
    expect(Array.isArray(templates)).toBe(true);
  });

  it('should get template by id', async () => {
    const template = await getTemplateById(1);
    expect(template).toBeDefined();
    expect(template?.id).toBe(1);
  });

  it('should increment template usage', async () => {
    const before = await getTemplateById(1);
    await incrementTemplateUsage(1);
    const after = await getTemplateById(1);
    expect(after?.usageCount).toBe((before?.usageCount || 0) + 1);
  });
});
```

### اختبار واجهة برمجية (API)

```typescript
// test/templates.api.test.ts
import { describe, it, expect } from 'vitest';
import { templateRouter } from '@/server/templateRouter';

describe('Template Router', () => {
  it('should list templates', async () => {
    const result = await templateRouter.createCaller({}).listTemplates({});
    expect(result.success).toBe(true);
    expect(Array.isArray(result.templates)).toBe(true);
  });

  it('should get template by id', async () => {
    const result = await templateRouter.createCaller({}).getTemplate({ id: 1 });
    expect(result.success).toBe(true);
    expect(result.template).toBeDefined();
  });

  it('should get categories', async () => {
    const result = await templateRouter.createCaller({}).getCategories();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.categories)).toBe(true);
  });

  it('should get popular templates', async () => {
    const result = await templateRouter.createCaller({}).getPopularTemplates({ limit: 5 });
    expect(result.success).toBe(true);
    expect(Array.isArray(result.templates)).toBe(true);
  });
});
```

## الاختبارات التكاملية (Integration Tests)

### اختبار تدفق المستخدم

```typescript
// test/templates.integration.test.ts
import { describe, it, expect } from 'vitest';

describe('Template User Flow', () => {
  it('should browse templates', async () => {
    // 1. الحصول على الفئات
    const categories = await trpc.templates.getCategories.query();
    expect(categories.categories.length).toBeGreaterThan(0);

    // 2. الحصول على القوالب حسب الفئة
    const category = categories.categories[0];
    const templates = await trpc.templates.getTemplatesByCategory.query({ category });
    expect(templates.templates.length).toBeGreaterThan(0);

    // 3. اختيار قالب
    const templateId = templates.templates[0].id;
    const template = await trpc.templates.getTemplate.query({ id: templateId });
    expect(template.success).toBe(true);
    expect(template.template?.id).toBe(templateId);
  });

  it('should track template usage', async () => {
    const before = await trpc.templates.getPopularTemplates.query({ limit: 1 });
    const usageBefore = before.templates[0]?.usageCount || 0;

    // استخدام القالب
    await trpc.templates.getTemplate.query({ id: before.templates[0].id });

    const after = await trpc.templates.getPopularTemplates.query({ limit: 1 });
    const usageAfter = after.templates[0]?.usageCount || 0;

    expect(usageAfter).toBeGreaterThan(usageBefore);
  });
});
```

## الاختبارات اليدوية

### 1. اختبار الواجهة الأمامية

#### الخطوة 1: التنقل إلى صفحة القوالب
```
1. افتح التطبيق
2. انتقل إلى /templates
3. تحقق من تحميل الصفحة بنجاح
```

#### الخطوة 2: عرض القوالب
```
1. تحقق من ظهور جميع القوالب
2. تحقق من ظهور صور المعاينة
3. تحقق من ظهور الفئات
```

#### الخطوة 3: التصفية حسب الفئة
```
1. اختر فئة من الفئات المتاحة
2. تحقق من تصفية القوالب حسب الفئة المختارة
3. اختر "الكل" للعودة إلى جميع القوالب
```

#### الخطوة 4: عرض القوالب الشهيرة
```
1. انقر على تبويب "الأكثر استخداماً"
2. تحقق من عرض القوالب الأكثر استخداماً
3. تحقق من ترتيبها حسب عدد الاستخدامات
```

#### الخطوة 5: تفاصيل القالب
```
1. انقر على أي قالب
2. تحقق من فتح نافذة التفاصيل
3. تحقق من عرض جميع المعلومات:
   - العنوان والوصف
   - الفئة والحالة (متميز/مجاني)
   - عدد الاستخدامات
   - إعدادات القالب
```

#### الخطوة 6: استخدام القالب
```
1. انقر على "استخدام هذا القالب"
2. تحقق من إعادة التوجيه إلى الصفحة الرئيسية
3. تحقق من تحميل إعدادات القالب
```

#### الخطوة 7: نسخ الإعدادات
```
1. افتح تفاصيل قالب
2. انقر على "نسخ الإعدادات"
3. تحقق من ظهور رسالة النجاح
4. تحقق من وجود الإعدادات في الحافظة
```

### 2. اختبار الأداء

#### سرعة التحميل
```
1. قس وقت تحميل صفحة القوالب
2. يجب أن يكون أقل من 2 ثانية
```

#### عدد الاستعلامات
```
1. افتح أدوات المطور (DevTools)
2. انتقل إلى Network
3. تحقق من عدد الطلبات (يجب أن يكون أقل من 5)
```

### 3. اختبار التوافقية

#### المتصفحات
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

#### الأجهزة
- [ ] سطح المكتب (1920x1080)
- [ ] التابلت (768x1024)
- [ ] الهاتف (375x667)

### 4. اختبار الأخطاء

#### حالات الخطأ
```
1. عدم توفر قاعدة البيانات
   - يجب عرض رسالة خطأ واضحة

2. قالب غير موجود
   - يجب عرض رسالة "القالب غير موجود"

3. فشل في تحميل الصور
   - يجب عرض صورة افتراضية
```

## قائمة التحقق (Checklist)

### قبل الإطلاق
- [ ] جميع الاختبارات تمر بنجاح
- [ ] لا توجد أخطاء في وحدة التحكم
- [ ] الأداء مقبول
- [ ] التوافقية مع المتصفحات الرئيسية
- [ ] الترجمة العربية صحيحة
- [ ] الصور تحميل بنجاح
- [ ] الواجهة تبدو احترافية

### بعد الإطلاق
- [ ] مراقبة الأخطاء
- [ ] تتبع الأداء
- [ ] جمع تعليقات المستخدمين
- [ ] إصلاح الأخطاء المكتشفة

## تشغيل الاختبارات

### الاختبارات الوحدة
```bash
npm run test
```

### اختبار محدد
```bash
npm run test -- templates.test.ts
```

### مراقبة الاختبارات
```bash
npm run test -- --watch
```

## الأدوات المستخدمة

- **Vitest**: إطار اختبار الوحدة
- **React Testing Library**: اختبار مكونات React
- **Cypress**: اختبارات التكامل (اختياري)
- **Lighthouse**: اختبار الأداء

## النتائج المتوقعة

### معدل النجاح
- جميع الاختبارات يجب أن تمر بنسبة 100%

### الأداء
- وقت تحميل الصفحة: < 2 ثانية
- وقت الاستجابة: < 500ms
- حجم الملف: < 500KB

### التوافقية
- جميع المتصفحات الحديثة
- جميع أحجام الشاشات

## الخطوات التالية

1. إضافة اختبارات Cypress للتكامل الكامل
2. إضافة اختبارات الأداء باستخدام Lighthouse
3. إضافة اختبارات الأمان
4. إضافة اختبارات الوصول (Accessibility)
