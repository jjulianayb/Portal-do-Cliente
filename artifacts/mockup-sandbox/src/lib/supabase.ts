type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  user: AuthUser;
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: AuthUser;
  msg?: string;
  message?: string;
  hint?: string;
  error_description?: string;
};

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function getErrorMessage(body: AuthResponse): string {
  return body.error_description ?? body.message ?? body.msg ?? body.hint ?? "Não foi possível concluir a operação.";
}

async function authRequest(path: string, payload: Record<string, unknown>): Promise<AuthResponse> {
  if (!isSupabaseConfigured) {
    throw new Error("O ambiente ainda não está conectado ao Supabase.");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as AuthResponse;
  if (!response.ok) {
    throw new Error(getErrorMessage(body));
  }
  return body;
}

export async function signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
  return authRequest("signup", {
    email,
    password,
    data: { full_name: fullName },
  });
}

export async function signIn(email: string, password: string): Promise<SupabaseSession> {
  const body = await authRequest("token?grant_type=password", { email, password });
  if (!body.access_token || !body.user) {
    throw new Error("O login foi concluído, mas a sessão não foi retornada.");
  }
  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    user: body.user,
  };
}

export function slugify(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "minha-empresa";
}

export async function createOrganization(
  session: SupabaseSession,
  name: string,
): Promise<{ id: string; name: string; slug: string }> {
  if (!isSupabaseConfigured) {
    throw new Error("O ambiente ainda não está conectado ao Supabase.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/create_organization`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey!,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ p_name: name, p_slug: slugify(name) }),
  });

  const body = (await response.json()) as { id?: string; name?: string; slug?: string; message?: string; hint?: string };
  if (!response.ok || !body.id || !body.name || !body.slug) {
    throw new Error(getErrorMessage(body));
  }

  return { id: body.id, name: body.name, slug: body.slug };
}
