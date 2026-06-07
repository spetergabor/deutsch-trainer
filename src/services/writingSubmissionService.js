import { supabase } from "../supabase";

export async function createWritingSubmission({
  studentId,
  taskType,
  taskTitle,
  taskSituation,
  taskInstructions,
  taskPoints,
  expectedWordCount,
  wordCount,
  content,
  assignmentId,
  teacherId,
}) {
  if (!studentId || !content?.trim()) {
    return null;
  }

  let teacher = null;

  if (teacherId) {
    const { data: assignedTeacher, error: assignedTeacherError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", teacherId)
      .single();

    if (assignedTeacherError) {
      throw assignedTeacherError;
    }

    teacher = assignedTeacher || null;
  } else {
    const { data: teachers, error: teacherError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "teacher")
      .order("full_name", { ascending: true })
      .limit(1);

    if (teacherError) {
      throw teacherError;
    }

    teacher = teachers?.[0] || null;
  }

  const { data, error } = await supabase
    .from("writing_submissions")
    .insert([
      {
        student_id: studentId,
        teacher_id: teacher?.id || null,
        task_type: taskType,
        task_title: taskTitle,
        task_situation: taskSituation,
        task_instructions: taskInstructions,
        task_points: taskPoints || [],
        expected_word_count: expectedWordCount,
        word_count: wordCount,
        content: content.trim(),
        assignment_id: assignmentId || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (teacher?.id) {
    await supabase.from("notifications").insert([
      {
        user_id: teacher.id,
        title: assignmentId ? "Házi beküldve" : "Új írás beküldve",
        message: taskTitle || "Új diákbeküldés érkezett.",
        type: "homework",
      },
    ]);
  }

  return {
    submission: data || null,
    teacher,
  };
}

export async function fetchTeacherWritingSubmissions() {
  const { data, error } = await supabase
    .from("writing_submissions")
    .select(
      `
      *,
      student:profiles!writing_submissions_student_id_fkey (
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

export async function fetchStudentWritingSubmissions(studentId) {
  if (!studentId) {
    return [];
  }

  const { data, error } = await supabase
    .from("writing_submissions")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateWritingSubmissionStatus(submissionId, status) {
  if (!submissionId || !status) {
    return null;
  }

  const { data, error } = await supabase
    .from("writing_submissions")
    .update({ status })
    .eq("id", submissionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function reviewWritingSubmission(
  submissionId,
  { grade, teacherFeedback, status = "reviewed" },
) {
  if (!submissionId) {
    return null;
  }

  const { data, error } = await supabase
    .from("writing_submissions")
    .update({
      grade: grade?.trim() || null,
      teacher_feedback: teacherFeedback?.trim() || null,
      status,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data || null;
}
