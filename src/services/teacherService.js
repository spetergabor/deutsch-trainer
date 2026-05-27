import { supabase } from "../supabase";
import {
  calculateStatsFromResults,
  getTopicStats,
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

export async function fetchTeacherOverview(students = []) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data, error } = await supabase
    .from("exercise_results")
    .select("*")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const results = data || [];
  const todayKey = new Date().toISOString().slice(0, 10);
  const activeToday = new Set(
    results
      .filter((item) => item.created_at?.slice(0, 10) === todayKey)
      .map((item) => item.user_id),
  );
  const activeLast7 = new Set(
    results
      .filter((item) => {
        const createdAt = new Date(item.created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return createdAt >= sevenDaysAgo;
      })
      .map((item) => item.user_id),
  );
  const studentNames = new Map(
    students.map((student) => [
      student.id,
      student.full_name || student.email || "Névtelen diák",
    ]),
  );
  const topics = getTopicStats(results);
  const weakestTopic = topics.find((topic) => topic.attempts >= 2) || null;
  const inactiveStudents = students
    .filter((student) => !activeLast7.has(student.id))
    .slice(0, 3)
    .map((student) => student.full_name || student.email || "Névtelen diák");
  const attentionStudents = students
    .map((student) => {
      const studentResults = results.filter((item) => item.user_id === student.id);
      const weakTopic = getWeakTopics(studentResults, 1)[0];
      const trend = getLast30Trend(studentResults);
      const lastResult = studentResults[0] || null;

      if (!weakTopic && trend.direction !== "down") {
        return null;
      }

      return {
        id: student.id,
        name: studentNames.get(student.id),
        reason: weakTopic
          ? `${weakTopic.label}: ${weakTopic.accuracy}%`
          : trend.label,
        lastActivity: lastResult?.created_at || null,
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  return {
    activeTodayCount: activeToday.size,
    inactiveCount: students.length - activeLast7.size,
    inactiveStudents,
    attentionStudents,
    weakestTopic,
    totalResults: results.length,
  };
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
