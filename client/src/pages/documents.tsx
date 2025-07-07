import { DocumentManager } from "@/components/document-manager";
import { useAuth } from "@/hooks/use-auth";

export default function DocumentsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Management</h1>
          <p className="text-gray-600">Organize and manage all project documents, contracts, and files</p>
        </div>
        
        <DocumentManager 
          projectId={1} // Demo project ID
        />
      </div>
    </div>
  );
} 