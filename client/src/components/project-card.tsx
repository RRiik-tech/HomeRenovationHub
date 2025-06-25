import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project & {
    homeowner?: any;
    bidCount?: number;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const timeAgo = (date: string | Date) => {
    const now = new Date();
    const projectDate = typeof date === 'string' ? new Date(date) : date;
    const diffTime = Math.abs(now.getTime() - projectDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      "Kitchen Remodeling": "bg-indigo-100 text-indigo-800",
      "Bathroom Renovation": "bg-pink-100 text-pink-800", 
      "Roofing": "bg-green-100 text-green-800",
      "Plumbing": "bg-blue-100 text-blue-800",
      "Electrical": "bg-orange-100 text-orange-800",
    };
    return colorMap[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover-lift overflow-hidden cursor-pointer">
        {project.photos && project.photos.length > 0 && (
          <img 
            src={`/api/uploads/${project.photos[0]}`} 
            alt={project.title}
            className="w-full h-48 object-cover"
          />
        )}
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className={getCategoryColor(project.category)}>
              {project.category}
            </Badge>
            <span className="text-gray-500 text-sm">
              {timeAgo(project.createdAt)}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 text-sm">{project.address}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">{project.budget}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">{project.timeline}</span>
                </div>
              </div>
              
              {project.bidCount !== undefined && (
                <div className="text-sm text-gray-500">
                  {project.bidCount} bid{project.bidCount !== 1 ? 's' : ''} received
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
