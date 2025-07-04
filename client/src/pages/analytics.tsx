import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { useAuth } from "@/hooks/use-auth";

export default function AnalyticsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <AnalyticsDashboard userType={user?.userType as 'homeowner' | 'contractor' | 'admin' || 'homeowner'} />
    </div>
  );
} 