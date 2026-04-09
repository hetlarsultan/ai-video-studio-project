import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createProject,
  getProjectsByUserId,
  getProjectById,
  updateProject,
  deleteProject,
} from "./db";

export const projectRouter = router({
  /**
   * Create a new project
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        templateId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await createProject({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          status: "draft",
          duration: 0,
          clipsData: JSON.stringify([]),
        });

        return {
          success: true,
          message: "تم إنشاء المشروع بنجاح",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get all projects for current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const projects = await getProjectsByUserId(ctx.user.id);

      return {
        success: true,
        projects: projects.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          thumbnail: p.thumbnailUrl,
          status: p.status,
          duration: p.duration,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        projects: [],
      };
    }
  }),

  /**
   * Get a specific project
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const project = await getProjectById(input.id);

        if (!project) {
          return {
            success: false,
            error: "المشروع غير موجود",
            project: null,
          };
        }

        // Check if user owns this project
        if (project.userId !== ctx.user.id) {
          return {
            success: false,
            error: "ليس لديك صلاحية للوصول إلى هذا المشروع",
            project: null,
          };
        }

        let clips = [];
        try {
          clips = project.clipsData ? JSON.parse(project.clipsData) : [];
        } catch (e) {
          console.warn("Failed to parse clips data:", e);
        }

        return {
          success: true,
          project: {
            id: project.id,
            title: project.title,
            description: project.description,
            thumbnail: project.thumbnailUrl,
            status: project.status,
            duration: project.duration,
            videoUrl: project.videoUrl,
            clips,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
          project: null,
        };
      }
    }),

  /**
   * Update project
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "processing", "completed", "archived"]).optional(),
        duration: z.number().optional(),
        videoUrl: z.string().optional(),
        clipsData: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const project = await getProjectById(input.id);

        if (!project) {
          return {
            success: false,
            error: "المشروع غير موجود",
          };
        }

        if (project.userId !== ctx.user.id) {
          return {
            success: false,
            error: "ليس لديك صلاحية لتعديل هذا المشروع",
          };
        }

        const updateData: Record<string, any> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.duration !== undefined) updateData.duration = input.duration;
        if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl;
        if (input.clipsData !== undefined) updateData.clipsData = input.clipsData;

        await updateProject(input.id, updateData);

        return {
          success: true,
          message: "تم تحديث المشروع بنجاح",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Delete project
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const project = await getProjectById(input.id);

        if (!project) {
          return {
            success: false,
            error: "المشروع غير موجود",
          };
        }

        if (project.userId !== ctx.user.id) {
          return {
            success: false,
            error: "ليس لديك صلاحية لحذف هذا المشروع",
          };
        }

        await deleteProject(input.id);

        return {
          success: true,
          message: "تم حذف المشروع بنجاح",
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    }),
});
