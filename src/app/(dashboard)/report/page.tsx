import { IssueForm } from "@/components/issues/IssueForm";

export default function ReportPage() {
  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">New Report</h1>
        <p className="text-muted-foreground text-lg">
          Help improve your community by reporting issues. Our AI agent will automatically categorize and route your report to the right department.
        </p>
      </div>
      
      <IssueForm />
    </div>
  );
}
