import { supabase } from "../supabase";
import {
  calculateStatsFromResults,
  getLast30Trend,
  getTeacherAlerts,
  getWeakTopics,
} from "../utils/statistics";

export async function fetchTeacherStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("full_name", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchTeacherStudentNotes(studentId) {
  if (!studentId) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_notes")
    .select("*")
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createTeacherNote(studentId, content) {
  if (!studentId || !content?.trim()) {
    return null;
  }

  await supabase.from("notifications").insert([
    {
      user_id: studentId,
      title: "Új tanári jegyzet",
      message: content.trim(),
      type: "teacher_note",
    },
  ]);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const teacherId = session?.user?.id || null;
  const teacherName = session?.user?.user_metadata?.full_name || "Tanár";

  const { data, error } = await supabase
    .from("user_notes")
    .insert([
      {
        user_id: studentId,
        content: content.trim(),
        author_role: "teacher",
        author_id: teacherId,
        author_name: teacherName,
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

export async function fetchTeacherStudentFiles(studentId) {
  if (!studentId) {
    return [];
  }

  const { data, error } = await supabase.storage
    .from("homeworks")
    .list(studentId + "/", {
      limit: 50,
      sortBy: {
        column: "created_at",
        order: "desc",
      },
    });

  if (error) {
    throw error;
  }

  const files = (data || []).filter(
    (file) => file.name !== ".emptyFolderPlaceholder",
  );

  return Promise.all(
    files.map(async (file) => {
      const path = studentId + "/" + file.name;

      const { data: signedData, error: signedError } = await supabase.storage
        .from("homeworks")
        .createSignedUrl(path, 3600);

      return {
        name: file.name,
        path,
        url: signedError ? "#" : signedData.signedUrl,
      };
    }),
  );
}

export async function fetchTeacherStudentResults(studentId) {
  if (!studentId) {
    return {
      results: [],
      stats: {
        accuracy: 0,
        totalDone: 0,
      },
    };
  }

  const { data, error } = await supabase
    .from("exercise_results")
    .select("*")
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const results = data || [];
  const { stats } = calculateStatsFromResults(results);

  return {
    results,
    stats,
    alerts: getTeacherAlerts(results),
    weakTopics: getWeakTopics(results),
    trend: getLast30Trend(results),
  };
}
