import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Brain, 
  FileText, 
  DollarSign, 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Star,
  TrendingUp,
  TrendingDown,
  Copy,
  Sparkles,
  MapPin,
  Award,
  Calendar,
  Zap,
  Shield
} from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

interface AIDashboardProps {
  projectId: number;
}

export function AIDashboard({ projectId }: AIDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Description Generator
  const [descriptionInput, setDescriptionInput] = useState({
    keywords: '',
    category: '',
    budget: ''
  });
  const [generatedDescription, setGeneratedDescription] = useState<any>(null);

  // AI Response Suggestions
  const [responseContext, setResponseContext] = useState('bid-received');
  const [contractorName, setContractorName] = useState('');
  const [responseSuggestions, setResponseSuggestions] = useState<any[]>([]);

  // AI Features Data
  const [descriptionData, setDescriptionData] = useState<any>(null);
  const [bidAnalysis, setBidAnalysis] = useState<any[]>([]);
  const [timelinePrediction, setTimelinePrediction] = useState<any>(null);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);

  // Form states
  const [descriptionForm, setDescriptionForm] = useState({
    keywords: '',
    category: '',
    budget: ''
  });

  const [responseForm, setResponseForm] = useState({
    context: 'bid-received',
    contractorName: '',
    bidAmount: '',
    projectTitle: ''
  });

  useEffect(() => {
    loadComprehensiveAnalysis();
  }, [projectId]);

  const loadComprehensiveAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', `/api/ai/comprehensive-analysis/${projectId}`);
      const data = await response.json();
      
      setTimelinePrediction(data.timelinePrediction);
      setRiskAssessment(data.riskAssessment);
      setBidAnalysis(data.bidAnalyses || []);
      setComprehensiveAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI analysis');
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/ai/generate-description', descriptionForm);
      const data = await response.json();
      setDescriptionData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate description');
    } finally {
      setLoading(false);
    }
  };

  const getResponseSuggestions = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/ai/response-suggestions', responseForm);
      const data = await response.json();
      setResponseSuggestions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to get response suggestions');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriceAnalysisColor = (analysis: string) => {
    switch (analysis) {
      case 'good': return 'text-green-600';
      case 'fair': return 'text-blue-600';
      case 'high': return 'text-red-600';
      case 'low': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading && !timelinePrediction) {
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

  if (!comprehensiveAnalysis) {
    return null;
  }

  const { projectAnalysis, compatibilityScores, timelinePrediction: originalTimelinePrediction, riskAssessment: originalRiskAssessment, bidAnalyses } = comprehensiveAnalysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold">AI-Powered Project Assistant</h2>
        <Badge variant="secondary" className="ml-2">
          All Features Active
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="description">Description AI</TabsTrigger>
          <TabsTrigger value="bids">Bid Analysis</TabsTrigger>
          <TabsTrigger value="responses">Response AI</TabsTrigger>
          <TabsTrigger value="timeline">Timeline AI</TabsTrigger>
          <TabsTrigger value="risks">Risk AI</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Timeline Prediction Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Timeline Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timelinePrediction ? (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {timelinePrediction.estimatedWeeks} weeks
                    </div>
                    <div className={`text-sm ${getConfidenceColor(timelinePrediction.confidence)}`}>
                      {timelinePrediction.confidence} confidence
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
              </CardContent>
            </Card>

            {/* Risk Assessment Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskAssessment ? (
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getRiskColor(riskAssessment.overallRisk)}`}>
                      {riskAssessment.overallRisk.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {riskAssessment.redFlags.length} red flags
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Loading...</div>
                )}
              </CardContent>
            </Card>

            {/* Bid Analysis Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Bid Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {bidAnalyses.length}
                  </div>
                  <div className="text-sm text-gray-500">
                    bids analyzed
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick AI Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => setActiveTab('description')}
                  className="justify-start"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Project Description
                </Button>
                <Button 
                  onClick={() => setActiveTab('responses')}
                  variant="outline"
                  className="justify-start"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Get Response Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Description Generator Tab */}
        <TabsContent value="description" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Project Description Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Keywords</label>
                  <Input
                    placeholder="e.g., modern, granite, stainless steel"
                    value={descriptionForm.keywords}
                    onChange={(e) => setDescriptionForm({...descriptionForm, keywords: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={descriptionForm.category} onValueChange={(value) => setDescriptionForm({...descriptionForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kitchen Remodeling">Kitchen Remodeling</SelectItem>
                      <SelectItem value="Bathroom Renovation">Bathroom Renovation</SelectItem>
                      <SelectItem value="Roofing">Roofing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Budget (optional)</label>
                  <Input
                    placeholder="e.g., $15,000"
                    value={descriptionForm.budget}
                    onChange={(e) => setDescriptionForm({...descriptionForm, budget: e.target.value})}
                  />
                </div>
              </div>
              
              <Button onClick={generateDescription} disabled={!descriptionForm.keywords || !descriptionForm.category}>
                Generate Description
              </Button>

              {descriptionData && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <h4 className="font-medium">Generated Content:</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input value={descriptionData.title} readOnly />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea value={descriptionData.description} readOnly rows={4} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Suggested Budget</label>
                        <Input value={descriptionData.suggestedBudget} readOnly />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Suggested Timeline</label>
                        <Input value={descriptionData.suggestedTimeline} readOnly />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Key Points</label>
                      <ul className="mt-2 space-y-1">
                        {descriptionData.keyPoints.map((point: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bid Analysis Tab */}
        <TabsContent value="bids" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Bid Quality & Price Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bidAnalyses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No bids to analyze yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bidAnalyses.map((analysis: any) => (
                    <Card key={analysis.bidId} className="border-l-4 border-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">Bid #{analysis.bidId}</h4>
                            <p className="text-sm text-gray-600">Fair Price: {analysis.fairPriceEstimate}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {analysis.qualityScore}%
                            </div>
                            <div className="text-sm text-gray-500">Quality Score</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Price Analysis</div>
                            <Badge variant={
                              analysis.priceAnalysis === 'good' ? 'default' :
                              analysis.priceAnalysis === 'fair' ? 'secondary' :
                              analysis.priceAnalysis === 'high' ? 'destructive' : 'outline'
                            }>
                              {analysis.priceAnalysis.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Quality</div>
                            <Progress value={analysis.qualityScore} className="h-2" />
                          </div>
                        </div>

                        {analysis.riskFactors.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-red-600 mb-1">Risk Factors:</div>
                            <ul className="space-y-1">
                              {analysis.riskFactors.map((risk: string, index: number) => (
                                <li key={index} className="text-xs text-red-600 flex items-start gap-2">
                                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{risk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysis.recommendations.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-green-600 mb-1">Recommendations:</div>
                            <ul className="space-y-1">
                              {analysis.recommendations.map((rec: string, index: number) => (
                                <li key={index} className="text-xs text-green-600 flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Response Suggestions Tab */}
        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Response Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Context</label>
                  <Select value={responseForm.context} onValueChange={(value) => setResponseForm({...responseForm, context: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bid-received">Bid Received</SelectItem>
                      <SelectItem value="bid-accepted">Bid Accepted</SelectItem>
                      <SelectItem value="bid-declined">Bid Declined</SelectItem>
                      <SelectItem value="follow-up">Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Contractor Name</label>
                  <Input
                    placeholder="e.g., John Smith"
                    value={responseForm.contractorName}
                    onChange={(e) => setResponseForm({...responseForm, contractorName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Bid Amount (optional)</label>
                  <Input
                    placeholder="e.g., $15,000"
                    value={responseForm.bidAmount}
                    onChange={(e) => setResponseForm({...responseForm, bidAmount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Title (optional)</label>
                  <Input
                    placeholder="e.g., Kitchen Remodel"
                    value={responseForm.projectTitle}
                    onChange={(e) => setResponseForm({...responseForm, projectTitle: e.target.value})}
                  />
                </div>
              </div>
              
              <Button onClick={getResponseSuggestions} disabled={!responseForm.contractorName}>
                Get Response Suggestions
              </Button>

              {responseSuggestions.length > 0 && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <h4 className="font-medium">Suggested Responses:</h4>
                  
                  <div className="space-y-3">
                    {responseSuggestions.map((suggestion, index) => (
                      <Card key={index} className="border-l-4 border-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.type.toUpperCase()}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.tone}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{suggestion.message}</p>
                          <Button size="sm" variant="outline" className="w-full">
                            Copy to Clipboard
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Prediction Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                AI Timeline Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timelinePrediction ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {timelinePrediction.estimatedWeeks} weeks
                    </div>
                    <div className={`text-lg ${getConfidenceColor(timelinePrediction.confidence)}`}>
                      {timelinePrediction.confidence} confidence
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Factors Considered:</h4>
                    <ul className="space-y-1">
                      {timelinePrediction.factors.map((factor: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {timelinePrediction.potentialDelays.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-orange-600">Potential Delays:</h4>
                      <ul className="space-y-1">
                        {timelinePrediction.potentialDelays.map((delay: string, index: number) => (
                          <li key={index} className="text-sm text-orange-600 flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{delay}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading timeline prediction...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AI Risk & Red Flag Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riskAssessment ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getRiskColor(riskAssessment.overallRisk)} mb-2`}>
                      {riskAssessment.overallRisk.toUpperCase()}
                    </div>
                    <div className="text-lg text-gray-600">
                      Overall Risk Level
                    </div>
                  </div>

                  <Separator />

                  {riskAssessment.redFlags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Red Flags ({riskAssessment.redFlags.length})
                      </h4>
                      <ul className="space-y-1">
                        {riskAssessment.redFlags.map((flag: string, index: number) => (
                          <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {riskAssessment.riskFactors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-orange-600">Risk Factors:</h4>
                      <ul className="space-y-1">
                        {riskAssessment.riskFactors.map((factor: string, index: number) => (
                          <li key={index} className="text-sm text-orange-600 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {riskAssessment.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Recommendations:</h4>
                      <ul className="space-y-1">
                        {riskAssessment.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm text-green-600 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading risk assessment...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 