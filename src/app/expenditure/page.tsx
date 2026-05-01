import ExpenditureForm from "@/components/ExpenditureForm";

export default function NewExpenditurePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Expenditure Entry</h1>
        <p className="text-slate-500 mt-0.5">Enter spending amounts for each category. Leave blank for unused categories.</p>
      </div>
      <ExpenditureForm mode="create" />
    </div>
  );
}
