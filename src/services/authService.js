import { supabase } from "../supabase";

export async function loginWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data?.session || null;
}

export async function registerUser({ email, password, role, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        email,
        role,
        full_name: fullName,
      },
    ]);

    if (profileError) {
      throw profileError;
    }
  }

  return data.user || null;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session || null;
}

export function listenToAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
