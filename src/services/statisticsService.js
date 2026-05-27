import { supabase } from "../supabase";

export async function fetchUserExerciseResults(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("exercise_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
