import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const uploadCivicImage = createServerFn({
  method: "POST",
})
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const image = data.get("image");

    if (!(image instanceof File)) {
      throw new Error("No image provided.");
    }

    if (!image.type.startsWith("image/")) {
      throw new Error("Invalid image file.");
    }

    if (image.size > 10 * 1024 * 1024) {
      throw new Error("Image must be 10MB or smaller.");
    }

    const extension =
      image.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const filePath = `reports/${fileName}`;

    const supabase = getSupabaseServerClient();

    const { error } = await supabase.storage
      .from("civic-images")
      .upload(filePath, image, {
        contentType: image.type,
        upsert: false,
      });

    if (error) {
      console.error("Image upload failed:", {
        message: error.message,
      });

      throw new Error(
        "Unable to upload evidence image.",
      );
    }

    const { data: publicUrlData } =
      supabase.storage
        .from("civic-images")
        .getPublicUrl(filePath);

    return {
      imageUrl: publicUrlData.publicUrl,
    };
  });