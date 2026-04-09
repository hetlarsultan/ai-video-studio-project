import { insertTemplate } from "./db";

/**
 * Predefined video templates for quick project creation
 */
export const PREDEFINED_TEMPLATES = [
  // Social Media Templates
  {
    title: "فيديو تيك توك احترافي",
    description: "قالب متخصص لإنشاء فيديوهات تيك توك بتأثيرات احترافية وموسيقى متناسقة",
    category: "وسائل اجتماعية",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=TikTok+Template",
    isPremium: 0,
    config: JSON.stringify({
      duration: 15,
      resolution: "1080x1920",
      fps: 30,
      effects: ["fade", "zoom", "particle"],
      music: true,
      transitions: "fast",
      style: "trendy",
    }),
  },
  {
    title: "منشور إنستاجرام ريلز",
    description: "قالب مثالي لإنشاء محتوى ريلز على إنستاجرام بجودة عالية",
    category: "وسائل اجتماعية",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Instagram+Reels",
    isPremium: 0,
    config: JSON.stringify({
      duration: 30,
      resolution: "1080x1920",
      fps: 30,
      effects: ["slide", "zoom"],
      music: true,
      transitions: "smooth",
      style: "modern",
    }),
  },
  {
    title: "فيديو يوتيوب شورتس",
    description: "قالب متخصص لفيديوهات يوتيوب القصيرة مع تأثيرات احترافية",
    category: "وسائل اجتماعية",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=YouTube+Shorts",
    isPremium: 0,
    config: JSON.stringify({
      duration: 60,
      resolution: "1080x1920",
      fps: 30,
      effects: ["fade", "rotate"],
      music: true,
      transitions: "dynamic",
      style: "professional",
    }),
  },

  // Educational Templates
  {
    title: "شرح تعليمي مفصل",
    description: "قالب متخصص لإنشاء فيديوهات شرح تعليمية بجودة احترافية",
    category: "تعليمي",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Educational",
    isPremium: 0,
    config: JSON.stringify({
      duration: 300,
      resolution: "1920x1080",
      fps: 30,
      effects: ["fade", "slide"],
      music: false,
      voiceover: true,
      subtitles: true,
      style: "academic",
    }),
  },
  {
    title: "درس تفاعلي",
    description: "قالب لإنشاء دروس تفاعلية مع رسوميات وتأثيرات بصرية",
    category: "تعليمي",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Interactive+Lesson",
    isPremium: 1,
    config: JSON.stringify({
      duration: 600,
      resolution: "1920x1080",
      fps: 30,
      effects: ["zoom", "highlight", "animation"],
      music: true,
      voiceover: true,
      subtitles: true,
      style: "interactive",
    }),
  },
  {
    title: "عرض شرائح تقديمي",
    description: "قالب لتحويل الشرائح إلى فيديو احترافي مع انتقالات سلسة",
    category: "تعليمي",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Presentation",
    isPremium: 0,
    config: JSON.stringify({
      duration: 120,
      resolution: "1920x1080",
      fps: 30,
      effects: ["dissolve", "slide"],
      music: true,
      transitions: "professional",
      style: "corporate",
    }),
  },

  // Marketing Templates
  {
    title: "إعلان منتج احترافي",
    description: "قالب متخصص لإنشاء إعلانات منتجات بجودة سينمائية",
    category: "تسويق",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Product+Ad",
    isPremium: 1,
    config: JSON.stringify({
      duration: 30,
      resolution: "1920x1080",
      fps: 30,
      effects: ["zoom", "glow", "shadow"],
      music: true,
      voiceover: true,
      style: "cinematic",
    }),
  },
  {
    title: "فيديو دعاية الخدمة",
    description: "قالب لإنشاء فيديوهات دعاية احترافية للخدمات",
    category: "تسويق",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Service+Promo",
    isPremium: 0,
    config: JSON.stringify({
      duration: 60,
      resolution: "1920x1080",
      fps: 30,
      effects: ["fade", "slide", "zoom"],
      music: true,
      voiceover: true,
      style: "professional",
    }),
  },
  {
    title: "فيديو شهادات العملاء",
    description: "قالب متخصص لعرض شهادات وآراء العملاء بشكل احترافي",
    category: "تسويق",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Testimonials",
    isPremium: 0,
    config: JSON.stringify({
      duration: 120,
      resolution: "1920x1080",
      fps: 30,
      effects: ["fade", "slide"],
      music: true,
      subtitles: true,
      style: "testimonial",
    }),
  },

  // Entertainment Templates
  {
    title: "مقدمة فيديو احترافية",
    description: "قالب متخصص لإنشاء مقدمات فيديو احترافية وجذابة",
    category: "ترفيه",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Intro",
    isPremium: 1,
    config: JSON.stringify({
      duration: 10,
      resolution: "1920x1080",
      fps: 30,
      effects: ["zoom", "rotate", "particle", "glow"],
      music: true,
      style: "cinematic",
    }),
  },
  {
    title: "فيديو موسيقي",
    description: "قالب لإنشاء فيديوهات موسيقية بتأثيرات بصرية رائعة",
    category: "ترفيه",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Music+Video",
    isPremium: 1,
    config: JSON.stringify({
      duration: 240,
      resolution: "1920x1080",
      fps: 30,
      effects: ["zoom", "rotate", "pulse", "particle"],
      music: true,
      style: "music_video",
    }),
  },
  {
    title: "فيديو كوميدي",
    description: "قالب لإنشاء فيديوهات كوميدية بتأثيرات فكاهية",
    category: "ترفيه",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Comedy",
    isPremium: 0,
    config: JSON.stringify({
      duration: 60,
      resolution: "1920x1080",
      fps: 30,
      effects: ["zoom", "fade", "particle"],
      music: true,
      style: "comedy",
    }),
  },

  // Animation Templates
  {
    title: "رسوميات متحركة احترافية",
    description: "قالب لإنشاء رسوميات متحركة احترافية وجذابة",
    category: "رسوميات",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Animation",
    isPremium: 1,
    config: JSON.stringify({
      duration: 120,
      resolution: "1920x1080",
      fps: 30,
      effects: ["zoom", "rotate", "animation"],
      music: true,
      style: "animated",
    }),
  },
  {
    title: "شرح رسومي (Explainer)",
    description: "قالب متخصص لإنشاء فيديوهات شرح رسومية",
    category: "رسوميات",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Explainer",
    isPremium: 0,
    config: JSON.stringify({
      duration: 180,
      resolution: "1920x1080",
      fps: 30,
      effects: ["draw", "fade", "zoom"],
      music: true,
      voiceover: true,
      style: "explainer",
    }),
  },

  // Corporate Templates
  {
    title: "فيديو شركة احترافي",
    description: "قالب متخصص لإنشاء فيديوهات شركات احترافية",
    category: "شركات",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Corporate",
    isPremium: 1,
    config: JSON.stringify({
      duration: 300,
      resolution: "1920x1080",
      fps: 30,
      effects: ["fade", "slide"],
      music: true,
      voiceover: true,
      subtitles: true,
      style: "corporate",
    }),
  },
  {
    title: "فيديو تعريفي للشركة",
    description: "قالب لإنشاء فيديو تعريفي احترافي للشركة",
    category: "شركات",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Company+Intro",
    isPremium: 0,
    config: JSON.stringify({
      duration: 120,
      resolution: "1920x1080",
      fps: 30,
      effects: ["fade", "zoom"],
      music: true,
      voiceover: true,
      style: "professional",
    }),
  },

  // Event Templates
  {
    title: "فيديو حفل افتتاح",
    description: "قالب متخصص لإنشاء فيديوهات حفلات الافتتاح",
    category: "أحداث",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Event+Opening",
    isPremium: 1,
    config: JSON.stringify({
      duration: 120,
      resolution: "1920x1080",
      fps: 30,
      effects: ["zoom", "rotate", "particle", "glow"],
      music: true,
      style: "event",
    }),
  },
  {
    title: "فيديو ملخص الحدث",
    description: "قالب لإنشاء ملخصات فيديو احترافية للأحداث",
    category: "أحداث",
    thumbnailUrl: "https://via.placeholder.com/300x200?text=Event+Summary",
    isPremium: 0,
    config: JSON.stringify({
      duration: 180,
      resolution: "1920x1080",
      fps: 30,
      effects: ["fade", "slide", "zoom"],
      music: true,
      style: "event_summary",
    }),
  },
];

/**
 * Seed the database with predefined templates
 */
export async function seedTemplates() {
  try {
    console.log("🌱 Starting template seeding...");
    
    for (const template of PREDEFINED_TEMPLATES) {
      try {
        await insertTemplate({
          title: template.title,
          description: template.description,
          category: template.category,
          thumbnailUrl: template.thumbnailUrl,
          isPremium: template.isPremium,
          config: template.config,
        });
        console.log(`✅ Added template: ${template.title}`);
      } catch (error) {
        console.warn(`⚠️ Failed to add template: ${template.title}`, error);
      }
    }
    
    console.log("✨ Template seeding completed!");
  } catch (error) {
    console.error("❌ Error during template seeding:", error);
    throw error;
  }
}
