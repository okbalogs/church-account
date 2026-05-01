import EntryForm from "@/components/EntryForm";

export default function NewEntryPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Income Entry</h1>
        <p className="text-slate-500 mt-0.5">Enter collection amounts for each category. Leave blank for uncollected categories.</p>
      </div>
      <EntryForm mode="create" />
    </div>
  );
}
