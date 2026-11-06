"use server";

import fs from "fs/promises";
import path from "path";
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

type ArtifactBook = {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  cover: string | null;
  createdAt: number;
  finishedAt: number | null;
};

type ArtifactRecord = {
  id: string;
  bookId: string;
  bookTitle: string;
  date: string;
  pageFrom?: number | null;
  pageTo?: number | null;
  page?: number | null;
  rawText: string;
  summary: string;
  createdAt: number;
};

type ArtifactExport = {
  books: ArtifactBook[];
  records: ArtifactRecord[];
  assets: Record<string, string>;
};

export async function migrateFromArtifact(): Promise<{
  booksCreated: number;
  booksSkipped: number;
  recordsCreated: number;
  recordsSkipped: number;
}> {
  const { supabase, user } = await requireUser();

  const backupDir = path.join(process.cwd(), "_backup_from_artifact");
  const raw = await fs.readFile(path.join(backupDir, "books_and_records.json"), "utf-8");
  const data = JSON.parse(raw) as ArtifactExport;

  const { data: existingBooks } = await supabase
    .from("books")
    .select("id, title")
    .eq("user_id", user.id);
  const existingByTitle = new Map((existingBooks ?? []).map((b) => [b.title, b.id as string]));

  let booksCreated = 0;
  let booksSkipped = 0;
  const bookIdMap = new Map<string, string>();

  for (const book of data.books) {
    const already = existingByTitle.get(book.title);
    if (already) {
      bookIdMap.set(book.id, already);
      booksSkipped++;
      continue;
    }

    let coverPath: string | null = null;
    const assetFile = book.cover ? data.assets[book.cover] : null;
    if (assetFile) {
      const bytes = await fs.readFile(path.join(backupDir, assetFile));
      const ext = assetFile.split(".").pop() || "jpg";
      const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(storagePath, bytes, { contentType: "image/jpeg", upsert: false });
      if (!uploadError) coverPath = storagePath;
    }

    const { data: inserted, error } = await supabase
      .from("books")
      .insert({
        user_id: user.id,
        title: book.title,
        author: book.author,
        status: book.status,
        cover_path: coverPath,
        created_at: new Date(book.createdAt).toISOString(),
        finished_at: book.finishedAt ? new Date(book.finishedAt).toISOString() : null,
      })
      .select("id")
      .single();
    if (error) throw new Error(`本「${book.title}」の取り込みに失敗しました: ${error.message}`);

    bookIdMap.set(book.id, inserted.id as string);
    booksCreated++;
  }

  const { data: existingRecords } = await supabase
    .from("records")
    .select("book_id, date, raw_text")
    .eq("user_id", user.id);
  const existingRecordKeys = new Set(
    (existingRecords ?? []).map((r) => `${r.book_id}|${r.date}|${r.raw_text}`)
  );

  let recordsCreated = 0;
  let recordsSkipped = 0;

  for (const record of data.records) {
    const bookId = bookIdMap.get(record.bookId);
    if (!bookId) {
      recordsSkipped++;
      continue;
    }
    const key = `${bookId}|${record.date}|${record.rawText}`;
    if (existingRecordKeys.has(key)) {
      recordsSkipped++;
      continue;
    }

    const { error } = await supabase.from("records").insert({
      user_id: user.id,
      book_id: bookId,
      book_title: record.bookTitle,
      date: record.date,
      page_from: record.pageFrom ?? null,
      page_to: record.pageTo ?? record.page ?? null,
      raw_text: record.rawText,
      summary: record.summary || record.rawText,
      created_at: new Date(record.createdAt).toISOString(),
    });
    if (error) throw new Error(`記録の取り込みに失敗しました: ${error.message}`);
    recordsCreated++;
  }

  revalidatePath("/");
  revalidatePath("/shelf");
  revalidatePath("/calendar");

  return { booksCreated, booksSkipped, recordsCreated, recordsSkipped };
}
