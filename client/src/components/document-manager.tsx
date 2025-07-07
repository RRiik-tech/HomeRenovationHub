// Document Manager Component - Fixed FilePdf import issue
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Share,
  Lock,
  Unlock,
  Calendar,
  User,
  File,
  Image,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  FolderOpen,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Edit,
  Copy,
  Archive,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { z } from "zod";
import { format, parseISO } from "date-fns";

const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  type: z.enum(['contract', 'permit', 'invoice', 'receipt', 'photo', 'other']),
  description: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface Document {
  id: number;
  projectId: number;
  uploadedBy: number;
  name: string;
  type: 'contract' | 'permit' | 'invoice' | 'receipt' | 'photo' | 'other';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  createdAt: string;
  uploader?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DocumentManagerProps {
  projectId: number;
  canUpload?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
}

export function DocumentManager({ 
  projectId, 
  canUpload = false, 
  canDelete = false, 
  canEdit = false 
}: DocumentManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      type: 'other',
      description: "",
    },
  });

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      if (!selectedFile) throw new Error('No file selected');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('projectId', projectId.toString());
      formData.append('uploadedBy', user?.id?.toString() || '');
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('description', data.description || '');

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description: "Document has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      setShowUploadForm(false);
      setSelectedFile(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete document');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Deleted",
        description: "Document has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DocumentFormData) => {
    uploadDocumentMutation.mutate(data);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill document name from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      form.setValue('name', nameWithoutExt);
    }
  };

  const handleDelete = (document: Document) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(document.id);
    }
  };

  const getFileIcon = (mimeType: string, type: string) => {
    if (type === 'photo' || mimeType.startsWith('image/')) {
      return <Image className="h-6 w-6 text-green-600" />;
    }
    if (mimeType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-600" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
    }
    if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-6 w-6 text-purple-600" />;
    }
    if (mimeType.startsWith('audio/')) {
      return <FileAudio className="h-6 w-6 text-blue-600" />;
    }
    return <FileText className="h-6 w-6 text-gray-600" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-blue-100 text-blue-800';
      case 'permit':
        return 'bg-green-100 text-green-800';
      case 'invoice':
        return 'bg-yellow-100 text-yellow-800';
      case 'receipt':
        return 'bg-purple-100 text-purple-800';
      case 'photo':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesTab = activeTab === 'all' || doc.type === activeTab;
    
    return matchesSearch && matchesType && matchesTab;
  });

  // Group documents by type
  const documentsByType = documents.reduce((acc: any, doc: Document) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {});

  const documentTypes = [
    { key: 'contract', label: 'Contracts', icon: FileText, count: documentsByType.contract?.length || 0 },
    { key: 'permit', label: 'Permits', icon: CheckCircle, count: documentsByType.permit?.length || 0 },
    { key: 'invoice', label: 'Invoices', icon: FileSpreadsheet, count: documentsByType.invoice?.length || 0 },
    { key: 'receipt', label: 'Receipts', icon: File, count: documentsByType.receipt?.length || 0 },
    { key: 'photo', label: 'Photos', icon: Image, count: documentsByType.photo?.length || 0 },
    { key: 'other', label: 'Other', icon: FolderOpen, count: documentsByType.other?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Document Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {documentTypes.map((type) => (
          <Card key={type.key} className="cursor-pointer hover:bg-gray-50" onClick={() => setActiveTab(type.key)}>
            <CardContent className="p-4 text-center">
              <type.icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{type.count}</div>
              <div className="text-sm text-gray-600">{type.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Document Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Management
            </CardTitle>
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {canUpload && (
                <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* File Upload */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select File</label>
                          <input
                            type="file"
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.txt"
                          />
                          {selectedFile && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              {getFileIcon(selectedFile.type, 'other')}
                              <span>{selectedFile.name}</span>
                              <span>({formatFileSize(selectedFile.size)})</span>
                            </div>
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter document name..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select document type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="contract">Contract</SelectItem>
                                  <SelectItem value="permit">Permit</SelectItem>
                                  <SelectItem value="invoice">Invoice</SelectItem>
                                  <SelectItem value="receipt">Receipt</SelectItem>
                                  <SelectItem value="photo">Photo</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the document..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-2">
                          <Button
                            type="submit"
                            disabled={uploadDocumentMutation.isPending || !selectedFile}
                            className="flex-1"
                          >
                            {uploadDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowUploadForm(false);
                              setSelectedFile(null);
                              form.reset();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="contract">Contracts</TabsTrigger>
              <TabsTrigger value="permit">Permits</TabsTrigger>
              <TabsTrigger value="invoice">Invoices</TabsTrigger>
              <TabsTrigger value="receipt">Receipts</TabsTrigger>
              <TabsTrigger value="photo">Photos</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="contract">Contracts</SelectItem>
                    <SelectItem value="permit">Permits</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="receipt">Receipts</SelectItem>
                    <SelectItem value="photo">Photos</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Document List */}
              {isLoading ? (
                <div className="text-center py-8">Loading documents...</div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
                  <p className="text-gray-600 mb-4">
                    {documents.length === 0 
                      ? "No documents have been uploaded yet."
                      : "No documents match your current filters."
                    }
                  </p>
                  {canUpload && documents.length === 0 && (
                    <Button onClick={() => setShowUploadForm(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Document
                    </Button>
                  )}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                  {filteredDocuments.map((document: Document) => (
                    <Card key={document.id} className={viewMode === 'grid' ? 'hover:shadow-md transition-shadow' : ''}>
                      <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-3'}>
                        {viewMode === 'grid' ? (
                          // Grid View
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(document.mimeType, document.type)}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">{document.name}</h4>
                                  <Badge variant="outline" className={getTypeColor(document.type)}>
                                    {document.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(document.fileUrl, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                                                onClick={() => {
                                const link = window.document.createElement('a');
                                link.href = document.fileUrl;
                                link.download = document.name;
                                link.click();
                              }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                {canDelete && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(document)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {document.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{document.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatFileSize(document.fileSize)}</span>
                              <span>{format(parseISO(document.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <User className="h-3 w-3" />
                              <span>
                                {document.uploader?.firstName} {document.uploader?.lastName}
                              </span>
                            </div>
                          </div>
                        ) : (
                          // List View
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(document.mimeType, document.type)}
                              <div>
                                <h4 className="font-medium">{document.name}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Badge variant="outline" className={getTypeColor(document.type)}>
                                    {document.type}
                                  </Badge>
                                  <span>{formatFileSize(document.fileSize)}</span>
                                  <span>•</span>
                                  <span>{format(parseISO(document.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(document.fileUrl, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const link = window.document.createElement('a');
                                  link.href = document.fileUrl;
                                  link.download = document.name;
                                  link.click();
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(document)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 