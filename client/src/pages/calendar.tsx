import { ProjectCalendar } from "@/components/project-calendar";
import { useAuth } from "@/hooks/use-auth";

export default function CalendarPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Calendar</h1>
          <p className="text-gray-600">Track project timelines, milestones, and important dates</p>
        </div>
        
        <ProjectCalendar 
          projectId={1} // Demo project ID
        />
      </div>
    </div>
  );
} 