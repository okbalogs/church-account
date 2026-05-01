"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  entryId: number;
  entryDate: string;
}

export default function DeleteExpenditureButton({ entryId, entryDate }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenditure/${entryId}`, { method: "DELETE" });
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
      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold text-red-700">
          Delete entry for {entryDate}?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger text-base py-2 px-4"
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="btn-secondary text-base py-2 px-4"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="btn-danger text-base py-2 px-4">
      Delete
    </button>
  );
}
