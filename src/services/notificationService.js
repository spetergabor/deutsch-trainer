import { supabase } from "../supabase";

export async function fetchUserNotifications(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function markUserNotificationsRead(userId) {
  if (!userId) {
    return;
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw error;
  }
}
