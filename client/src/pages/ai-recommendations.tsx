import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Star, MapPin, Clock, DollarSign, Award, AlertTriangle, CheckCircle, Filter, Search, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

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

export function AIRecommendationsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<CompatibilityScore[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<CompatibilityScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [locationFilter, setLocationFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'rating' | 'experience' | 'reviews'>('score');

  useEffect(() => {
    if (projectId) {
      loadRecommendations();
    }
  }, [projectId]);

  useEffect(() => {
    applyFilters();
  }, [recommendations, searchTerm, minScore, locationFilter, specialtyFilter, sortBy]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', `/api/ai/recommendations/${projectId}`);
      const data = await response.json();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recommendations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rec => 
        rec.contractor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.contractor.user.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.contractor.user.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.contractor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Minimum score filter
    if (minScore > 0) {
      filtered = filtered.filter(rec => rec.score >= minScore);
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(rec => 
        rec.contractor.user.state.toLowerCase() === locationFilter.toLowerCase()
      );
    }

    // Specialty filter
    if (specialtyFilter) {
      filtered = filtered.filter(rec => 
        rec.contractor.specialties.includes(specialtyFilter)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'rating':
          return parseFloat(b.contractor.rating) - parseFloat(a.contractor.rating);
        case 'experience':
          return b.contractor.experienceYears - a.contractor.experienceYears;
        case 'reviews':
          return b.contractor.reviewCount - a.contractor.reviewCount;
        default:
          return 0;
      }
    });

    setFilteredRecommendations(filtered);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUniqueStates = () => {
    const states = new Set(recommendations.map(rec => rec.contractor.user.state));
    return Array.from(states).sort();
  };

  const getUniqueSpecialties = () => {
    const specialties = new Set();
    recommendations.forEach(rec => {
      rec.contractor.specialties.forEach(specialty => specialties.add(specialty));
    });
    return Array.from(specialties).sort();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
        
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">AI Contractor Recommendations</h1>
          <Badge variant="secondary" className="ml-2">
            {recommendations.length} matches found
          </Badge>
        </div>
        
        <p className="text-gray-600">
          Our AI has analyzed your project requirements and found the best matching contractors based on specialty, location, budget, timeline, experience, and ratings.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contractors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Minimum Score</label>
              <Select value={minScore.toString()} onValueChange={(value) => setMinScore(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Score</SelectItem>
                  <SelectItem value="70">70%+</SelectItem>
                  <SelectItem value="80">80%+</SelectItem>
                  <SelectItem value="90">90%+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All States</SelectItem>
                  {getUniqueStates().map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Match Score</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="reviews">Review Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No contractors found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((score, index) => (
            <Card key={score.contractorId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">
                        #{index + 1} - {score.contractor.companyName}
                      </h3>
                      {score.contractor.isVerified && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {score.contractor.user.city}, {score.contractor.user.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {score.contractor.rating} ({score.contractor.reviewCount} reviews)
                      </span>
                      <span>{score.contractor.experienceYears} years experience</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {score.contractor.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className={`text-3xl font-bold ${getScoreColor(score.score)}`}>
                      {score.score}%
                    </div>
                    <div className="text-sm text-gray-500">Match Score</div>
                  </div>
                </div>

                {/* Compatibility Factors */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
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
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Why this contractor:</div>
                    <ul className="space-y-1">
                      {score.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator className="mb-4" />

                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate(`/contractor/${score.contractorId}`)}
                    className="flex-1"
                  >
                    View Full Profile
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/messaging?contractor=${score.contractorId}`)}
                  >
                    Send Message
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/project/${projectId}/bid?contractor=${score.contractorId}`)}
                  >
                    Request Bid
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredRecommendations.length > 0 && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{filteredRecommendations.length}</div>
                <div className="text-sm text-gray-600">Contractors Found</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(filteredRecommendations.reduce((sum, rec) => sum + rec.score, 0) / filteredRecommendations.length)}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredRecommendations.filter(rec => rec.contractor.isVerified).length}
                </div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(filteredRecommendations.reduce((sum, rec) => sum + parseFloat(rec.contractor.rating), 0) / filteredRecommendations.length * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 