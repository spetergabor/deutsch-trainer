import { supabase } from "../supabase";

const HOMEWORKS_BUCKET = "homeworks";

export async function uploadUserFile(userId, file) {
  if (!userId || !file) {
    return;
  }

  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${userId}/${Date.now()}-${safeFileName}`;

  const { error } = await supabase.storage
    .from(HOMEWORKS_BUCKET)
    .upload(filePath, file);

  if (error) {
    throw error;
  }
}

export async function fetchUserFiles(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase.storage
    .from(HOMEWORKS_BUCKET)
    .list(`${userId}/`, {
      limit: 20,
      sortBy: {
        column: "created_at",
        order: "desc",
      },
    });

  if (error) {
    throw error;
  }

  return data
    ? data.filter((file) => file.name !== ".emptyFolderPlaceholder")
    : [];
}
