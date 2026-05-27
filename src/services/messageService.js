import { supabase } from "../supabase";

export async function fetchMessageContacts(userId, userRole) {
  if (!userId || !userRole) {
    return [];
  }

  const contactRole = userRole === "teacher" ? "student" : "teacher";

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("role", contactRole)
    .order("full_name", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchConversationMessages(userId, contactId) {
  if (!userId || !contactId) {
    return [];
  }

  const conversationFilter =
    "and(sender_id.eq." +
    userId +
    ",receiver_id.eq." +
    contactId +
    "),and(sender_id.eq." +
    contactId +
    ",receiver_id.eq." +
    userId +
    ")";

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(conversationFilter)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function sendConversationMessage(senderId, receiverId, content) {
  if (!senderId || !receiverId || !content?.trim()) {
    return null;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function sendMessageToFirstTeacher(senderId, content) {
  if (!senderId || !content?.trim()) {
    return null;
  }

  const { data: teachers, error: teacherError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "teacher")
    .order("full_name", { ascending: true })
    .limit(1);

  if (teacherError) {
    throw teacherError;
  }

  const teacher = teachers?.[0];

  if (!teacher?.id) {
    throw new Error("Nincs elérhető tanár, akinek el lehetne küldeni a levelet.");
  }

  const message = await sendConversationMessage(senderId, teacher.id, content);

  return {
    teacher,
    message,
  };
}

export async function markConversationMessagesRead(userId, contactId) {
  if (!userId || !contactId) {
    return;
  }

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", userId)
    .eq("sender_id", contactId)
    .eq("is_read", false);

  if (error) {
    throw error;
  }
}

export async function fetchUnreadMessageCount(userId) {
  if (!userId) {
    return 0;
  }

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  if (error) {
    throw error;
  }

  return count || 0;
}
