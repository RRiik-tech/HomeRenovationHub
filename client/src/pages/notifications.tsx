import { NotificationCenter } from "@/components/notification-center";
import { useAuth } from "@/hooks/use-auth";

export default function NotificationsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with all your project notifications and alerts</p>
        </div>
        
        <NotificationCenter />
      </div>
    </div>
  );
} 