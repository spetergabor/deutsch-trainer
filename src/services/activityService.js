import { supabase } from "../supabase";

export async function saveUserDailyActivity(userId, activityDate) {
  if (!userId || !activityDate) {
    return;
  }

  const { error } = await supabase.from("user_daily_activity").upsert(
    {
      user_id: userId,
      activity_date: activityDate,
    },
    {
      onConflict: "user_id,activity_date",
    },
  );

  if (error) {
    throw error;
  }
}

export async function fetchUserActivityDays(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_daily_activity")
    .select("*")
    .eq("user_id", userId)
    .order("activity_date", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
