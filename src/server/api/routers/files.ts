import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { uploadFileSchema } from "@/server/validations/files";
import { TRPCError } from "@trpc/server";
import { put } from "@vercel/blob";

export const filesRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(uploadFileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Não autorizado",
        });
      }

      const { filename, file } = input;

      const buffer = Buffer.from(file, "base64");
      const blobData = new Blob([buffer]);

      const blob = await put(filename, blobData, {
        access: "public",
      });

      return blob;
    }),
});
