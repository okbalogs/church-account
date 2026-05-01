import { notFound } from "next/navigation";
import getDb from "@/lib/db";
import { AccountEntry } from "@/types";
import EntryForm from "@/components/EntryForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEntryPage({ params }: Props) {
  const { id } = await params;
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT * FROM account_entries WHERE id = ?",
    args: [Number(id)],
  });
  const entry = result.rows[0] as unknown as AccountEntry | undefined;

  if (!entry) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Entry</h1>
        <p className="text-lg text-gray-600 mt-1">
          Update the collection amounts for{" "}
          <strong>{entry.date} &mdash; {entry.service_type}</strong>
        </p>
      </div>
      <EntryForm mode="edit" initialData={entry} />
    </div>
  );
}
