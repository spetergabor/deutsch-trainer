import { supabase } from "../supabase";

const EXERCISE_ITEMS_TABLE = "exercise_items";

function normalizeExerciseItem(item) {
  if (!item) return null;

  return {
    ...item.payload,
    dbId: item.id,
    title: item.title,
    type: item.type,
    isActive: item.is_active,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export async function fetchActiveExerciseItems(type) {
  if (!type) return [];

  const { data, error } = await supabase
    .from(EXERCISE_ITEMS_TABLE)
    .select("*")
    .eq("type", type)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(normalizeExerciseItem).filter(Boolean);
}

export async function fetchTeacherExerciseItems(type = null) {
  let query = supabase
    .from(EXERCISE_ITEMS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createExerciseItem({ type, title = "", payload }) {
  if (!type || !payload) {
    throw new Error("Hiányzó feladattípus vagy feladatadat.");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data, error } = await supabase
    .from(EXERCISE_ITEMS_TABLE)
    .insert([
      {
        type,
        title: title || payload.sentence || payload.question || "Új feladat",
        payload,
        created_by: session?.user?.id || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function updateExerciseItem(itemId, { type, title, payload, isActive }) {
  if (!itemId) {
    throw new Error("Hiányzó feladatazonosító.");
  }

  const updateData = {};

  if (type !== undefined) updateData.type = type;
  if (title !== undefined) updateData.title = title;
  if (payload !== undefined) updateData.payload = payload;
  if (isActive !== undefined) updateData.is_active = isActive;

  const { data, error } = await supabase
    .from(EXERCISE_ITEMS_TABLE)
    .update(updateData)
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function deactivateExerciseItem(itemId) {
  return updateExerciseItem(itemId, { isActive: false });
}
