"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  entryId: number;
  entryDate: string;
}

export default function DeleteButton({ entryId, entryDate }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch {
      alert("Failed to delete entry. Please try again.");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
        <p className="text-sm font-semibold text-rose-800">Delete {entryDate}?</p>
        <div className="flex gap-2">
          <button onClick={handleDelete} disabled={deleting} className="btn-danger btn btn-sm flex-1">
            {deleting ? "…" : "Delete"}
          </button>
          <button onClick={() => setConfirming(false)} className="btn-secondary btn btn-sm flex-1">
            No
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="btn-danger btn btn-sm">
      Delete
    </button>
  );
}
