import { PaymentSystem } from "@/components/payment-system";
import { useAuth } from "@/hooks/use-auth";

export default function PaymentsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
          <p className="text-gray-600">Manage project payments, milestones, and transactions</p>
        </div>
        
        <PaymentSystem 
          projectId={1} // Demo project ID
        />
      </div>
    </div>
  );
} 