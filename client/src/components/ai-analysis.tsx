import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Star, MapPin, Clock, DollarSign, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

interface ProjectAnalysis {
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  budgetRange: string;
  requiredSpecialties: string[];
  riskFactors: string[];
}

interface CompatibilityScore {
  contractorId: number;
  score: number;
  factors: {
    specialty: number;
    location: number;
    budget: number;
    timeline: number;
    experience: number;
    rating: number;
  };
  recommendations: string[];
  contractor: {
    id: number;
    userId: number;
    companyName: string;
    specialties: string[];
    experienceYears: number;
    rating: string;
    reviewCount: number;
    isVerified: boolean;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      city: string;
      state: string;
    };
  };
}

interface AIAnalysisProps {
  projectId: number;
  onContractorSelect?: (contractorId: number) => void;
}

export function AIAnalysis({ projectId, onContractorSelect }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<{
    projectAnalysis: ProjectAnalysis;
    compatibilityScores: CompatibilityScore[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [projectId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', `/api/ai/analyze-project/${projectId}`);
      const data = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI analysis');
    } finally {
      setLoading(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFactorColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysis) {
    return null;
  }

  const { projectAnalysis, compatibilityScores } = analysis;

  return (
    <div className="space-y-6">
      {/* Project Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            AI Project Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Complexity</div>
              <Badge className={getComplexityColor(projectAnalysis.complexity)}>
                {projectAnalysis.complexity.charAt(0).toUpperCase() + projectAnalysis.complexity.slice(1)}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Duration</div>
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{projectAnalysis.estimatedDuration}</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Budget Range</div>
              <div className="flex items-center justify-center gap-1">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{projectAnalysis.budgetRange}</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Specialties</div>
              <div className="font-medium">{projectAnalysis.requiredSpecialties.length}</div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Required Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {projectAnalysis.requiredSpecialties.map((specialty, index) => (
                <Badge key={index} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {projectAnalysis.riskFactors.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {projectAnalysis.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contractor Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            AI Contractor Recommendations
            <Badge variant="secondary" className="ml-2">
              {compatibilityScores.length} matches found
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {compatibilityScores.slice(0, 5).map((score, index) => (
              <div key={score.contractorId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">
                        {score.contractor?.companyName || 'Unknown Company'}
                      </h4>
                      {score.contractor?.isVerified && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {score.contractor?.user?.city || 'Unknown'}, {score.contractor?.user?.state || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {score.contractor?.rating || '0'} ({score.contractor?.reviewCount || 0} reviews)
                      </span>
                      <span>{score.contractor?.experienceYears || 0} years experience</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {(score.contractor?.specialties || []).slice(0, 3).map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {(score.contractor?.specialties || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(score.contractor?.specialties || []).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                      {score.score}%
                    </div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>

                {/* Compatibility Factors */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Specialty</div>
                    <Progress value={score.factors.specialty} className="h-2" />
                    <div className="text-xs mt-1">{score.factors.specialty}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Location</div>
                    <Progress value={score.factors.location} className="h-2" />
                    <div className="text-xs mt-1">{score.factors.location}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Budget</div>
                    <Progress value={score.factors.budget} className="h-2" />
                    <div className="text-xs mt-1">{score.factors.budget}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Timeline</div>
                    <Progress value={score.factors.timeline} className="h-2" />
                    <div className="text-xs mt-1">{score.factors.timeline}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Experience</div>
                    <Progress value={score.factors.experience} className="h-2" />
                    <div className="text-xs mt-1">{score.factors.experience}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Rating</div>
                    <Progress value={score.factors.rating} className="h-2" />
                    <div className="text-xs mt-1">{score.factors.rating}%</div>
                  </div>
                </div>

                {/* Recommendations */}
                {score.recommendations.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Why this contractor:</div>
                    <ul className="space-y-1">
                      {score.recommendations.slice(0, 3).map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => onContractorSelect?.(score.contractorId)}
                    className="flex-1"
                  >
                    View Profile
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`/contractor/${score.contractorId}`, '_blank')}
                  >
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {compatibilityScores.length > 5 && (
            <div className="text-center mt-4">
              <Button variant="outline" onClick={() => window.open(`/ai-recommendations/${projectId}`, '_blank')}>
                View All {compatibilityScores.length} Recommendations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 