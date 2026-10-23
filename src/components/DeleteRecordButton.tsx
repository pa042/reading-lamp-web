"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRecord } from "@/app/actions";

export default function DeleteRecordButton({ recordId }: { recordId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    setDeleting(true);
    await deleteRecord(recordId);
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={deleting}
      className="text-sm font-bold text-danger hover:underline disabled:opacity-50"
    >
      {deleting ? "削除中…" : confirming ? "本当に削除しますか？（もう一度押す）" : "この記録を削除"}
    </button>
  );
}
