import { supabase } from "../supabase";

export async function createLessonSession({
  teacherId,
  studentId,
  scheduledAt,
  meetUrl,
  topic,
  goal,
}) {
  if (!teacherId || !studentId || !scheduledAt) {
    return null;
  }

  const { data, error } = await supabase
    .from("lesson_sessions")
    .insert([
      {
        teacher_id: teacherId,
        student_id: studentId,
        scheduled_at: scheduledAt,
        meet_url: meetUrl?.trim() || null,
        topic: topic?.trim() || "Online óra",
        goal: goal?.trim() || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("notifications").insert([
    {
      user_id: studentId,
      title: "Új online óra",
      message: topic?.trim() || "A tanárod új órát ütemezett.",
      type: "lesson",
    },
  ]);

  return data || null;
}

export async function fetchTeacherLessonSessions() {
  const { data, error } = await supabase
    .from("lesson_sessions")
    .select(
      `
      *,
      student:profiles!lesson_sessions_student_id_fkey (
        id,
        full_name,
        email
      )
    `,
    )
    .order("scheduled_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchStudentLessonSessions(studentId) {
  if (!studentId) {
    return [];
  }

  const { data, error } = await supabase
    .from("lesson_sessions")
    .select("*")
    .eq("student_id", studentId)
    .order("scheduled_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchLessonSession(lessonId) {
  if (!lessonId) {
    return null;
  }

  const { data, error } = await supabase
    .from("lesson_sessions")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function updateLessonWorkbook(lessonId, workbook) {
  if (!lessonId) {
    return null;
  }

  const { data, error } = await supabase
    .from("lesson_sessions")
    .update({
      shared_notes: workbook.sharedNotes || "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", lessonId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function updateLessonStatus(lessonId, status) {
  if (!lessonId || !status) {
    return null;
  }

  const patch = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "completed") {
    patch.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("lesson_sessions")
    .update(patch)
    .eq("id", lessonId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function markLessonVideoStarted(lessonId, teacherId) {
  if (!lessonId || !teacherId) {
    return null;
  }

  const startedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("lesson_sessions")
    .update({
      video_started_at: startedAt,
      video_started_by: teacherId,
      updated_at: startedAt,
    })
    .eq("id", lessonId)
    .eq("teacher_id", teacherId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data || null;
}
