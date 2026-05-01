import EntryForm from "@/components/EntryForm";

export default function NewEntryPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Service Entry</h1>
        <p className="text-lg text-gray-600 mt-1">
          Enter the collection amounts for each category below. Leave blank or 0 for categories that were not collected.
        </p>
      </div>
      <EntryForm mode="create" />
    </div>
  );
}
