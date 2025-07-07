import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { insertProjectSchema } from "@shared/schema";
import { PROJECT_CATEGORIES, BUDGET_RANGES, TIMELINE_OPTIONS } from "@/lib/constants";
import FileUpload from "@/components/file-upload";
import { z } from "zod";

const formSchema = insertProjectSchema.extend({
  photos: z.array(z.any()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function PostProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h1>
        <p className="text-xl text-gray-600 mb-8">Please sign in to post a project</p>
        <Button onClick={() => setLocation('/')}>Go to Home</Button>
      </div>
    );
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      homeownerId: user.id,
      title: "",
      description: "",
      category: "",
      budget: "",
      timeline: "",
      address: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user?.id) {
        throw new Error('User authentication required');
      }

      const formData = new FormData();
      
      // Append text fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'photos' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Append files
      uploadedFiles.forEach((file) => {
        formData.append('photos', file);
      });

      // Always use the authenticated user's ID
      formData.append('homeownerId', user.id.toString());

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      return response.json();
    },
    onSuccess: (project) => {
      toast({
        title: "Project Posted Successfully", 
        description: "Your project has been posted and contractors will start bidding soon!",
      });
      
      // Clear ALL cache to ensure fresh data
      queryClient.clear();
      
      // Small delay to allow cache clearing, then navigate
      setTimeout(() => {
        setLocation(`/project/${project.id}`);
      }, 200);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createProjectMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Your Project</h1>
        <p className="text-xl text-gray-600">Tell us about your home improvement needs and get competitive bids</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kitchen Renovation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROJECT_CATEGORIES.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your project in detail..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUDGET_RANGES.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMELINE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your property address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Photos
                </label>
                <FileUpload 
                  onFilesChange={setUploadedFiles}
                  maxFiles={10}
                />
              </div>

              <div className="text-center pt-6">
                <Button 
                  type="submit" 
                  size="lg"
                  className="button-gradient text-white font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? "Posting Project..." : "Post Project & Get Bids"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
