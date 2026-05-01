import { notFound } from "next/navigation";
import getDb from "@/lib/db";
import { ExpenditureEntry } from "@/types";
import ExpenditureForm from "@/components/ExpenditureForm";

interface Props {
  params: { id: string };
}

export default function EditExpenditurePage({ params }: Props) {
  const db = getDb();
  const entry = db
    .prepare("SELECT * FROM expenditure_entries WHERE id = ?")
    .get(Number(params.id)) as ExpenditureEntry | undefined;

  if (!entry) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Expenditure</h1>
        <p className="text-lg text-gray-600 mt-1">
          Update the expenditure amounts for{" "}
          <strong>{entry.date} &mdash; {entry.service_type}</strong>
        </p>
      </div>
      <ExpenditureForm mode="edit" initialData={entry} />
    </div>
  );
}
