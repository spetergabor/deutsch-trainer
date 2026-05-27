import { supabase } from "../supabase";

export async function fetchUserProfile(userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, full_name, xp, level, today_xp, coins")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function fetchUserXpProfile(userId) {
  if (!userId) {
    return {
      xp: 0,
      level: 1,
      today_xp: 0,
      coins: 0,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("xp, level, today_xp, coins")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return {
    xp: data?.xp || 0,
    level: data?.level || 1,
    today_xp: data?.today_xp || 0,
    coins: data?.coins || 0,
  };
}
