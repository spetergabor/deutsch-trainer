import { supabase } from "../supabase";

export async function createHomeworkAssignment({
  teacherId,
  studentId,
  type,
  practiceType,
  title,
  instructions,
  topic,
  expectedWordCount,
  targetCount,
  dueAt,
}) {
  if (!teacherId || !studentId || !title?.trim() || !instructions?.trim()) {
    return null;
  }

  const { data, error } = await supabase
    .from("homework_assignments")
    .insert([
      {
        teacher_id: teacherId,
        student_id: studentId,
        type,
        practice_type: practiceType || null,
        title: title.trim(),
        instructions: instructions.trim(),
        topic: topic?.trim() || null,
        expected_word_count: expectedWordCount ? Number(expectedWordCount) : null,
        target_count: targetCount ? Number(targetCount) : null,
        due_at: dueAt || null,
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
      title: "Új házi feladat",
      message: title.trim(),
      type: "homework",
    },
  ]);

  return data || null;
}

export async function fetchTeacherHomeworkAssignments() {
  const { data, error } = await supabase
    .from("homework_assignments")
    .select(
      `
      *,
      student:profiles!homework_assignments_student_id_fkey (
        id,
        full_name,
        email
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchStudentHomeworkAssignments(studentId) {
  if (!studentId) {
    return [];
  }

  const { data, error } = await supabase
    .from("homework_assignments")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateHomeworkStatus(assignmentId, status) {
  if (!assignmentId || !status) {
    return null;
  }

  const { data, error } = await supabase
    .from("homework_assignments")
    .update({ status })
    .eq("id", assignmentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data || null;
}
