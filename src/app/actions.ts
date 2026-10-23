"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BookStatus } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");
  return { supabase, user };
}

async function uploadCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  cover: File
): Promise<string> {
  const ext = cover.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("covers").upload(path, cover, {
    contentType: cover.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error(`表紙のアップロードに失敗しました: ${error.message}`);
  return path;
}

export async function createBook(input: {
  title: string;
  author: string;
  status: BookStatus;
  cover: File | null;
}): Promise<{ id: string }> {
  const { supabase, user } = await requireUser();

  let coverPath: string | null = null;
  if (input.cover && input.cover.size > 0) {
    coverPath = await uploadCover(supabase, user.id, input.cover);
  }

  const { data, error } = await supabase
    .from("books")
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      author: input.author.trim(),
      status: input.status,
      cover_path: coverPath,
      finished_at: input.status === "done" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(`本の登録に失敗しました: ${error.message}`);

  revalidatePath("/shelf");
  revalidatePath("/new");
  return { id: data.id as string };
}

export async function updateBookStatus(bookId: string, status: BookStatus): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("books")
    .update({
      status,
      finished_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", bookId)
    .eq("user_id", user.id);
  if (error) throw new Error(`状態の更新に失敗しました: ${error.message}`);
  revalidatePath(`/book/${bookId}`);
  revalidatePath("/shelf");
}

export async function updateBookInfo(
  bookId: string,
  input: { title: string; author: string; cover: File | null }
): Promise<void> {
  const { supabase, user } = await requireUser();

  const patch: Record<string, unknown> = {
    title: input.title.trim(),
    author: input.author.trim(),
  };

  if (input.cover && input.cover.size > 0) {
    patch.cover_path = await uploadCover(supabase, user.id, input.cover);
  }

  const { error } = await supabase
    .from("books")
    .update(patch)
    .eq("id", bookId)
    .eq("user_id", user.id);
  if (error) throw new Error(`本の情報の更新に失敗しました: ${error.message}`);

  revalidatePath(`/book/${bookId}`);
  revalidatePath("/shelf");
}

export async function createRecord(input: {
  bookId: string;
  bookTitle: string;
  date: string;
  pageFrom: number | null;
  pageTo: number | null;
  rawText: string;
  summary: string;
  markFinished: boolean;
}): Promise<{ id: string }> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("records")
    .insert({
      user_id: user.id,
      book_id: input.bookId,
      book_title: input.bookTitle,
      date: input.date,
      page_from: input.pageFrom,
      page_to: input.pageTo,
      raw_text: input.rawText,
      summary: input.summary || input.rawText,
    })
    .select("id")
    .single();

  if (error) throw new Error(`記録の保存に失敗しました: ${error.message}`);

  const { data: book } = await supabase
    .from("books")
    .select("status")
    .eq("id", input.bookId)
    .single();

  if (input.markFinished && book?.status !== "done") {
    await supabase
      .from("books")
      .update({ status: "done", finished_at: new Date().toISOString() })
      .eq("id", input.bookId)
      .eq("user_id", user.id);
  } else if (book?.status === "want") {
    await supabase
      .from("books")
      .update({ status: "reading" })
      .eq("id", input.bookId)
      .eq("user_id", user.id);
  }

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath(`/book/${input.bookId}`);
  return { id: data.id as string };
}

export async function deleteRecord(recordId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("records")
    .delete()
    .eq("id", recordId)
    .eq("user_id", user.id);
  if (error) throw new Error(`削除に失敗しました: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/calendar");
}
