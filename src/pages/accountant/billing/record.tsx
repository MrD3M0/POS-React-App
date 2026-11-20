import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import Button from "@/components/ui/button";
import RecordPaymentForm from "./components/record-payment-form";

/** Record a fee payment (own page — the billing list stays a read-only list). */
export default function RecordFeePaymentPage() {
  return (
    <div className="p-5">
      <PageHeader
        title="Record Fee Payment"
        description="Collect a fee: pick the student, the fee and the items the money pays for."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant/dashboard" },
          { title: "Fee Payments", link: "/accountant/billing/payments" },
          { title: "Record", link: "/accountant/billing/record" },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/accountant/billing/payments">
              <ArrowLeft className="h-4 w-4" />
              Back to payments
            </Link>
          </Button>
        }
      />

      <div className="mt-3 w-full max-w-2xl">
        <RecordPaymentForm />
      </div>
    </div>
  );
}
