import { supabase } from "../supabase";

export async function saveExerciseResult(exerciseType, score, maxScore) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return;
  }

  const { error } = await supabase.from("exercise_results").insert([
    {
      user_id: session.user.id,
      exercise_type: exerciseType,
      score,
      max_score: maxScore,
    },
  ]);

  if (error) {
    throw error;
  }
}
