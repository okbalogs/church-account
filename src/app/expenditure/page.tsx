import ExpenditureForm from "@/components/ExpenditureForm";

export default function NewExpenditurePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Expenditure Entry</h1>
        <p className="text-lg text-gray-600 mt-1">
          Enter the expenditure amounts for each category below. Leave blank or 0 for categories with no spending.
        </p>
      </div>
      <ExpenditureForm mode="create" />
    </div>
  );
}
