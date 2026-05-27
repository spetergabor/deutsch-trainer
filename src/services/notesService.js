import { supabase } from "../supabase";

export async function fetchUserNotes(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createUserNote(userId, content) {
  if (!userId || !content?.trim()) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_notes")
    .insert([
      {
        user_id: userId,
        content: content.trim(),
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

export async function deleteUserNote(userId, noteId) {
  if (!userId || !noteId) {
    return;
  }

  const { error } = await supabase
    .from("user_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
