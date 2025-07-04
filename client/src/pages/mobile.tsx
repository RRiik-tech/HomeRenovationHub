import { MobileAppShell } from "@/components/mobile-app-shell";

export default function MobilePage() {
  return (
    <MobileAppShell>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Mobile App</h1>
        <p className="text-gray-600">Welcome to the mobile experience!</p>
      </div>
    </MobileAppShell>
  );
} 