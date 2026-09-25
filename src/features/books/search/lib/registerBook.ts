import { supabase } from "@/lib/supabaseClient";
import type { SearchBook } from "./types";

export type AddBookToUserResult = {
  userBookId: string;
  isNew: boolean;
};

export async function registerBook(
  book: SearchBook,
): Promise<AddBookToUserResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase.rpc("add_book_to_user", {
    p_isbn: book.isbn ?? null,
    p_title: book.title,
    p_author: book.author,
    p_thumbnail: book.image ?? null,
    p_publisher: book.publisher ?? null,
    p_page_count: book.pageCount ?? null,
  });

  if (error) throw error;

  if (!data || typeof data !== "object") {
    throw new Error("책 등록에 실패했습니다.");
  }

  const result = data as AddBookToUserResult;

  if (!result.userBookId) {
    throw new Error("userBookId가 없습니다.");
  }

  return result;
}
