import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getTemplates, getTemplateById, incrementTemplateUsage } from "./db";

/**
 * Template Management Router
 * Handles all template-related operations including listing, retrieval, and creation
 */
export const templateRouter = router({
  /**
   * Get all available templates with optional filtering
   */
  listTemplates: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        includePremium: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input }: { input: { category?: string; includePremium: boolean } }) => {
      try {
        const allTemplates = await getTemplates();
        
        let filtered = allTemplates;
        
        // Filter by category if provided
        if (input.category) {
          filtered = filtered.filter(t => t.category === input.category);
        }
        
        // Filter premium templates if not included
        if (!input.includePremium) {
          filtered = filtered.filter(t => t.isPremium === 0);
        }
        
        return {
          success: true,
          templates: filtered.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            thumbnailUrl: t.thumbnailUrl,
            category: t.category,
            isPremium: t.isPremium === 1,
            usageCount: t.usageCount,
            createdAt: t.createdAt,
          })),
          count: filtered.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          templates: [],
          count: 0,
        };
      }
    }),

  /**
   * Get a specific template by ID
   */
  getTemplate: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }: { input: { id: number } }) => {
      try {
        const template = await getTemplateById(input.id);
        
        if (!template) {
          return {
            success: false,
            error: "القالب غير موجود",
            template: null,
          };
        }

        // Increment usage count
        await incrementTemplateUsage(input.id);

        // Parse config JSON
        let config = {};
        try {
          config = JSON.parse(template.config);
        } catch (e) {
          console.warn("Failed to parse template config:", e);
        }

        return {
          success: true,
          template: {
            id: template.id,
            title: template.title,
            description: template.description,
            thumbnailUrl: template.thumbnailUrl,
            category: template.category,
            config,
            isPremium: template.isPremium === 1,
            usageCount: template.usageCount + 1,
            createdAt: template.createdAt,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          template: null,
        };
      }
    }),

  /**
   * Get templates by category
   */
  getTemplatesByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }: { input: { category: string } }) => {
      try {
        const allTemplates = await getTemplates();
        const filtered = allTemplates.filter(t => t.category === input.category);

        return {
          success: true,
          templates: filtered.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            thumbnailUrl: t.thumbnailUrl,
            category: t.category,
            isPremium: t.isPremium === 1,
            usageCount: t.usageCount,
          })),
          count: filtered.length,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          templates: [],
          count: 0,
        };
      }
    }),

  /**
   * Get template categories
   */
  getCategories: publicProcedure.query(async () => {
    try {
      const allTemplates = await getTemplates();
      const categories = Array.from(new Set(allTemplates.map(t => t.category)));
      
      return {
        success: true,
        categories: categories.sort(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        categories: [],
      };
    }
  }),

  /**
   * Get most used templates
   */
  getPopularTemplates: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional().default(10) }))
    .query(async ({ input }: { input: { limit: number } }) => {
      try {
        const allTemplates = await getTemplates();
        const sorted = allTemplates
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, input.limit);

        return {
          success: true,
          templates: sorted.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            thumbnailUrl: t.thumbnailUrl,
            category: t.category,
            usageCount: t.usageCount,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          templates: [],
        };
      }
    }),
});
