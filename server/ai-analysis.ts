import { 
  getContractors, 
  getProject, 
  getBid, 
  getBidsByProject,
  getUser
} from './firebase-storage';
import type { Project, Contractor, User, Bid } from './memory-schema';

interface CompatibilityScore {
  contractorId: number;
  contractor: Contractor;
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
}

interface ProjectAnalysis {
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  budgetRange: string;
  requiredSpecialties: string[];
  riskFactors: string[];
}

interface GeneratedDescription {
  title: string;
  description: string;
  suggestedBudget: string;
  suggestedTimeline: string;
  keyPoints: string[];
}

interface BidAnalysis {
  bidId: number;
  fairPriceEstimate: string;
  qualityScore: number;
  priceAnalysis: 'good' | 'fair' | 'high' | 'low';
  riskFactors: string[];
  recommendations: string[];
}

interface ResponseSuggestion {
  type: 'question' | 'negotiation' | 'acceptance' | 'decline';
  message: string;
  tone: 'professional' | 'friendly' | 'formal';
}

interface TimelinePrediction {
  estimatedWeeks: number;
  confidence: 'high' | 'medium' | 'low';
  factors: string[];
  potentialDelays: string[];
}

interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendations: string[];
  redFlags: string[];
}

export class AIAnalysisService {
  
  // Analyze project complexity and requirements
  async analyzeProject(project: Project): Promise<ProjectAnalysis> {
    const complexity = this.calculateProjectComplexity(project);
    const estimatedDuration = this.estimateProjectDuration(project);
    const budgetRange = this.analyzeBudgetRange(project);
    const requiredSpecialties = this.extractRequiredSpecialties(project);
    const riskFactors = this.identifyRiskFactors(project);

    return {
      complexity,
      estimatedDuration,
      budgetRange,
      requiredSpecialties,
      riskFactors
    };
  }

  // Find compatible contractors for a project
  async findCompatibleContractors(project: Project): Promise<CompatibilityScore[]> {
    const contractors = await getContractors();
    const compatibilityScores: CompatibilityScore[] = [];

    for (const contractor of contractors) {
      // Fetch user data for the contractor
      const user = await getUser(contractor.userId);
      
      // Convert Firebase contractor to compatible format with user data
      const compatibleContractor = {
        ...contractor,
        portfolio: contractor.portfolio || [],
        rating: contractor.rating || '4.0',
        reviewCount: contractor.reviewCount || 0,
        isVerified: contractor.isVerified || false,
        user: user ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          city: user.city || 'Unknown',
          state: user.state || 'Unknown'
        } : {
          id: 0,
          firstName: 'Unknown',
          lastName: 'Unknown',
          city: 'Unknown',
          state: 'Unknown'
        }
      };
      
      const score = await this.calculateCompatibilityScore(project, compatibleContractor);
      compatibilityScores.push(score);
    }
    
    // Sort by score (highest first)
    return compatibilityScores.sort((a, b) => b.score - a.score);
  }

  // 1. AI-Powered Project Description Generator
  async generateProjectDescription(keywords: string, category: string, budget?: string): Promise<GeneratedDescription> {
    const templates = {
      'Kitchen Remodeling': {
        title: `Modern ${keywords} Kitchen Remodel`,
        description: `Transform your kitchen into a modern, functional space with ${keywords}. This comprehensive remodel will enhance both aesthetics and functionality, creating a kitchen that meets your lifestyle needs and adds value to your home.`,
        suggestedBudget: budget || '$15,000 - $25,000',
        suggestedTimeline: '4-6 weeks',
        keyPoints: [
          'Modern design with contemporary finishes',
          'Improved functionality and workflow',
          'Energy-efficient appliances and lighting',
          'Quality materials and craftsmanship'
        ]
      },
      'Bathroom Renovation': {
        title: `Luxury ${keywords} Bathroom Renovation`,
        description: `Create a spa-like retreat with this ${keywords} bathroom renovation. We'll transform your space into a luxurious, functional bathroom that combines style with modern amenities and superior craftsmanship.`,
        suggestedBudget: budget || '$8,000 - $15,000',
        suggestedTimeline: '2-3 weeks',
        keyPoints: [
          'Luxury fixtures and finishes',
          'Improved functionality and storage',
          'Modern plumbing and electrical',
          'Water-efficient features'
        ]
      },
      'Roofing': {
        title: `Professional ${keywords} Roof Installation`,
        description: `Protect your home with a high-quality ${keywords} roof installation. Our expert team ensures proper installation, weather protection, and long-term durability for your peace of mind.`,
        suggestedBudget: budget || '$5,000 - $12,000',
        suggestedTimeline: '3-5 days',
        keyPoints: [
          'Quality roofing materials',
          'Professional installation',
          'Weather protection and durability',
          'Warranty coverage'
        ]
      }
    };

    const template = templates[category as keyof typeof templates] || templates['Kitchen Remodeling'];
    
    return {
      title: template.title,
      description: template.description,
      suggestedBudget: template.suggestedBudget,
      suggestedTimeline: template.suggestedTimeline,
      keyPoints: template.keyPoints
    };
  }

  // 2. AI Bid Quality & Price Estimator
  async analyzeBid(bid: Bid, project: Project): Promise<BidAnalysis> {
    const budgetAmount = this.extractBudgetAmount(project.budget);
    const bidAmount = parseFloat(bid.amount);
    
    if (!budgetAmount || !bidAmount) {
      return {
        bidId: bid.id,
        fairPriceEstimate: 'Unable to determine',
        qualityScore: 70,
        priceAnalysis: 'fair',
        riskFactors: ['Insufficient pricing data'],
        recommendations: ['Request detailed breakdown']
      };
    }

    // Calculate fair price estimate (based on project complexity and market rates)
    const complexity = this.calculateProjectComplexity(project);
    const complexityMultiplier = { low: 0.8, medium: 1.0, high: 1.3 };
    const fairPrice = budgetAmount * complexityMultiplier[complexity];
    
    // Calculate quality score
    let qualityScore = 70;
    const bidProposal = bid.proposal.toLowerCase();
    
    if (bidProposal.includes('detailed') || bidProposal.includes('comprehensive')) qualityScore += 10;
    if (bidProposal.includes('warranty') || bidProposal.includes('guarantee')) qualityScore += 10;
    if (bidProposal.includes('licensed') || bidProposal.includes('insured')) qualityScore += 10;
    if (bidProposal.length > 100) qualityScore += 5;
    
    // Price analysis
    let priceAnalysis: 'good' | 'fair' | 'high' | 'low';
    const priceRatio = bidAmount / fairPrice;
    
    if (priceRatio < 0.7) priceAnalysis = 'low';
    else if (priceRatio < 0.9) priceAnalysis = 'good';
    else if (priceRatio < 1.2) priceAnalysis = 'fair';
    else priceAnalysis = 'high';

    // Risk factors
    const riskFactors: string[] = [];
    if (priceRatio < 0.6) riskFactors.push('Unusually low price - may indicate cutting corners');
    if (priceRatio > 1.5) riskFactors.push('Significantly higher than market rate');
    if (bidProposal.length < 50) riskFactors.push('Minimal detail in bid proposal');
    if (!bidProposal.includes('materials')) riskFactors.push('Materials not specified');

    // Recommendations
    const recommendations: string[] = [];
    if (priceAnalysis === 'low') recommendations.push('Request detailed breakdown of costs');
    if (priceAnalysis === 'high') recommendations.push('Negotiate price or request justification');
    if (qualityScore < 80) recommendations.push('Ask for more details about scope of work');
    if (!riskFactors.length) recommendations.push('This bid appears well-structured');

    return {
      bidId: bid.id,
      fairPriceEstimate: `$${Math.round(fairPrice).toLocaleString()}`,
      qualityScore: Math.min(qualityScore, 100),
      priceAnalysis,
      riskFactors,
      recommendations
    };
  }

  // 3. AI Contractor Response Assistant
  async generateResponseSuggestion(
    context: 'bid-received' | 'bid-accepted' | 'bid-declined' | 'follow-up',
    contractorName: string,
    bidAmount?: string,
    projectTitle?: string
  ): Promise<ResponseSuggestion[]> {
    const suggestions: ResponseSuggestion[] = [];

    switch (context) {
      case 'bid-received':
        suggestions.push({
          type: 'question',
          message: `Thank you for your bid on ${projectTitle}. Could you provide more details about the materials you plan to use and the estimated timeline for completion?`,
          tone: 'professional'
        });
        suggestions.push({
          type: 'question',
          message: `Hi ${contractorName}, thanks for the bid! I'd like to know if this includes all permits and cleanup, and what warranty you provide on the work.`,
          tone: 'friendly'
        });
        break;
      
      case 'bid-accepted':
        suggestions.push({
          type: 'acceptance',
          message: `Thank you for your competitive bid. I'm pleased to accept your proposal for ${projectTitle}. When can we schedule a meeting to discuss next steps?`,
          tone: 'professional'
        });
        break;
      
      case 'bid-declined':
        suggestions.push({
          type: 'decline',
          message: `Thank you for your interest in ${projectTitle}. After careful consideration, I've decided to go with another contractor. I appreciate your time and wish you the best.`,
          tone: 'professional'
        });
        break;
      
      case 'follow-up':
        suggestions.push({
          type: 'question',
          message: `Hi ${contractorName}, I wanted to follow up on your bid. Do you have any questions about the project requirements, and when would be a good time to discuss this further?`,
          tone: 'friendly'
        });
        break;
    }

    return suggestions;
  }

  // 4. AI Project Timeline Predictor
  async predictTimeline(project: Project): Promise<TimelinePrediction> {
    const complexity = this.calculateProjectComplexity(project);
    const category = project.category.toLowerCase();
    
    // Base timeline estimates
    const baseTimelines: { [key: string]: { [key: string]: number } } = {
      'kitchen remodeling': { low: 2, medium: 4, high: 8 },
      'bathroom renovation': { low: 1, medium: 3, high: 6 },
      'roofing': { low: 1, medium: 2, high: 3 },
      'plumbing': { low: 1, medium: 2, high: 3 },
      'electrical': { low: 1, medium: 2, high: 3 }
    };

    const baseWeeks = baseTimelines[category]?.[complexity] || 3;
    
    // Adjust based on project details
    let estimatedWeeks = baseWeeks;
    const factors: string[] = [];
    const potentialDelays: string[] = [];

    // Budget impact
    const budgetAmount = this.extractBudgetAmount(project.budget);
    if (budgetAmount && budgetAmount > 20000) {
      estimatedWeeks += 1;
      factors.push('High-budget project with premium materials');
    }

    // Timeline urgency
    if (project.timeline.toLowerCase().includes('urgent')) {
      estimatedWeeks = Math.max(estimatedWeeks - 1, 1);
      factors.push('Urgent timeline requested');
      potentialDelays.push('Rushing may affect quality');
    }

    // Location considerations
    if (project.address.toLowerCase().includes('downtown') || project.address.toLowerCase().includes('city')) {
      estimatedWeeks += 1;
      factors.push('Urban location with parking/access considerations');
      potentialDelays.push('City permits and inspections');
    }

    // Confidence level
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (project.description.length > 200 && budgetAmount) confidence = 'high';
    if (project.description.length < 50) confidence = 'low';

    return {
      estimatedWeeks,
      confidence,
      factors,
      potentialDelays
    };
  }

  // 5. AI Risk & Red Flag Detector
  async assessProjectRisks(project: Project, bids: Bid[]): Promise<RiskAssessment> {
    const riskFactors: string[] = [];
    const redFlags: string[] = [];
    const recommendations: string[] = [];

    // Project complexity risks
    const complexity = this.calculateProjectComplexity(project);
    if (complexity === 'high') {
      riskFactors.push('Complex project requiring experienced contractor');
      recommendations.push('Verify contractor has experience with similar projects');
    }

    // Budget risks
    const budgetAmount = this.extractBudgetAmount(project.budget);
    if (budgetAmount && budgetAmount < 5000) {
      riskFactors.push('Low budget may limit contractor options');
      redFlags.push('Very low budget for project scope');
    }

    // Timeline risks
    if (project.timeline.toLowerCase().includes('urgent') || project.timeline.toLowerCase().includes('quick')) {
      riskFactors.push('Tight timeline may affect quality');
      redFlags.push('Rushed timeline could lead to poor workmanship');
    }

    // Bid analysis
    if (bids.length > 0) {
      const bidAmounts = bids.map(bid => parseFloat(bid.amount));
      const avgBid = bidAmounts.reduce((a, b) => a + b, 0) / bidAmounts.length;
      const minBid = Math.min(...bidAmounts);
      const maxBid = Math.max(...bidAmounts);

      if (maxBid / minBid > 3) {
        riskFactors.push('Large variation in bid amounts');
        redFlags.push('Extreme bid variation suggests unclear project scope');
        recommendations.push('Clarify project requirements and get more detailed bids');
      }

      if (minBid < avgBid * 0.5) {
        redFlags.push('Unusually low bid - may indicate cutting corners');
        recommendations.push('Investigate low bid thoroughly before accepting');
      }
    }

    // Missing information
    if (project.description.length < 100) {
      riskFactors.push('Limited project description');
      recommendations.push('Provide more detailed project requirements');
    }

    if (!project.address || project.address.length < 10) {
      riskFactors.push('Incomplete location information');
      recommendations.push('Provide complete project address');
    }

    // Overall risk assessment
    let overallRisk: 'low' | 'medium' | 'high' = 'low';
    if (redFlags.length > 2 || riskFactors.length > 4) overallRisk = 'high';
    else if (redFlags.length > 0 || riskFactors.length > 2) overallRisk = 'medium';

    return {
      overallRisk,
      riskFactors,
      recommendations,
      redFlags
    };
  }

  // Calculate compatibility score between project and contractor
  private async calculateCompatibilityScore(project: Project, contractor: Contractor): Promise<CompatibilityScore> {
    const factors = {
      specialty: this.calculateSpecialtyMatch(project, contractor),
      location: await this.calculateLocationMatch(project, contractor),
      budget: this.calculateBudgetMatch(project, contractor),
      timeline: this.calculateTimelineMatch(project, contractor),
      experience: this.calculateExperienceMatch(project, contractor),
      rating: this.calculateRatingScore(contractor)
    };

    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0) / 6;
    
    const recommendations = this.generateRecommendations(project, contractor, factors);

    return {
      contractorId: contractor.id,
      contractor: contractor,
      score: Math.round(totalScore * 100) / 100,
      factors,
      recommendations
    };
  }

  // Calculate specialty match (0-100)
  private calculateSpecialtyMatch(project: Project, contractor: Contractor): number {
    const projectCategory = project.category.toLowerCase();
    const contractorSpecialties = contractor.specialties.map(s => s.toLowerCase());
    
    if (contractorSpecialties.includes(projectCategory)) {
      return 100;
    }
    
    // Check for related specialties
    const relatedSpecialties: { [key: string]: string[] } = {
      'kitchen remodeling': ['bathroom renovation', 'general contracting', 'cabinetry'],
      'bathroom renovation': ['kitchen remodeling', 'plumbing', 'tiling'],
      'roofing': ['general contracting', 'exterior work'],
      'plumbing': ['bathroom renovation', 'kitchen remodeling'],
      'electrical': ['general contracting', 'home improvement']
    };

    const related = relatedSpecialties[projectCategory] || [];
    const hasRelated = related.some(specialty => contractorSpecialties.includes(specialty));
    
    return hasRelated ? 70 : 30;
  }

  // Calculate location match (0-100)
  private async calculateLocationMatch(project: Project, contractor: Contractor): Promise<number> {
    try {
      const contractorUser = await getUser(contractor.userId);
      // For simplified location matching since detailed location data may not be available
      
      const projectLocation = project.address.toLowerCase();
      
      // Simple location matching based on common California cities
      if (projectLocation.includes('san francisco') || projectLocation.includes('sf') || 
          projectLocation.includes('california') || projectLocation.includes('ca')) {
        return 90; // Good match for CA-based contractors
      }
      
      return 75; // Default good score
    } catch (error) {
      return 50; // Default score if user data is unavailable
    }
  }

  // Calculate budget match (0-100)
  private calculateBudgetMatch(project: Project, contractor: Contractor): number {
    const budgetText = project.budget.toLowerCase();
    const budgetAmount = this.extractBudgetAmount(budgetText);
    
    if (!budgetAmount) return 70; // Default if can't parse budget
    
    // Simple budget matching logic
    const contractorRating = parseFloat(contractor.rating);
    const experienceYears = contractor.experienceYears;
    
    // Higher rated/experienced contractors typically charge more
    const expectedRate = (contractorRating * 0.3) + (experienceYears * 0.1);
    
    if (budgetAmount >= 20000 && expectedRate > 4.0) return 100;
    if (budgetAmount >= 15000 && expectedRate > 3.5) return 90;
    if (budgetAmount >= 10000 && expectedRate > 3.0) return 80;
    if (budgetAmount >= 5000 && expectedRate > 2.5) return 70;
    
    return 60;
  }

  // Calculate timeline match (0-100)
  private calculateTimelineMatch(project: Project, contractor: Contractor): number {
    const timelineText = project.timeline.toLowerCase();
    const projectDuration = this.extractTimelineDuration(timelineText);
    
    if (!projectDuration) return 70;
    
    // Contractors with more experience can handle longer projects better
    const experienceYears = contractor.experienceYears;
    
    if (projectDuration <= 1 && experienceYears >= 5) return 100;
    if (projectDuration <= 2 && experienceYears >= 3) return 90;
    if (projectDuration <= 3 && experienceYears >= 2) return 80;
    if (projectDuration <= 6 && experienceYears >= 1) return 70;
    
    return 60;
  }

  // Calculate experience match (0-100)
  private calculateExperienceMatch(project: Project, contractor: Contractor): number {
    const experienceYears = contractor.experienceYears;
    const projectComplexity = this.calculateProjectComplexity(project);
    
    switch (projectComplexity) {
      case 'low':
        return experienceYears >= 1 ? 100 : 70;
      case 'medium':
        return experienceYears >= 3 ? 100 : experienceYears >= 1 ? 80 : 60;
      case 'high':
        return experienceYears >= 5 ? 100 : experienceYears >= 3 ? 85 : experienceYears >= 1 ? 70 : 50;
      default:
        return 70;
    }
  }

  // Calculate rating score (0-100)
  private calculateRatingScore(contractor: Contractor): number {
    const rating = parseFloat(contractor.rating);
    const reviewCount = contractor.reviewCount;
    
    // Weight rating by number of reviews
    const weightedScore = rating * Math.min(reviewCount / 10, 1);
    return Math.min(weightedScore * 20, 100); // Convert 5-star to 100-point scale
  }

  // Generate personalized recommendations
  private generateRecommendations(project: Project, contractor: Contractor, factors: any): string[] {
    const recommendations: string[] = [];
    
    if (factors.specialty >= 90) {
      recommendations.push("Perfect specialty match for your project");
    } else if (factors.specialty >= 70) {
      recommendations.push("Good specialty alignment with related experience");
    }
    
    if (factors.location >= 90) {
      recommendations.push("Local contractor - convenient for site visits");
    }
    
    if (factors.experience >= 90) {
      recommendations.push("Highly experienced for your project complexity");
    }
    
    if (factors.rating >= 90) {
      recommendations.push("Excellent customer satisfaction rating");
    }
    
    if (contractor.isVerified) {
      recommendations.push("Verified contractor with credentials");
    }
    
    if (factors.budget >= 90) {
      recommendations.push("Budget-friendly option for your project");
    }
    
    return recommendations;
  }

  // Calculate project complexity
  private calculateProjectComplexity(project: Project): 'low' | 'medium' | 'high' {
    const title = project.title.toLowerCase();
    const description = project.description.toLowerCase();
    const category = project.category.toLowerCase();
    
    const complexityKeywords = {
      high: ['complete', 'remodel', 'renovation', 'major', 'extensive', 'full'],
      medium: ['update', 'upgrade', 'modify', 'improve', 'partial'],
      low: ['repair', 'fix', 'maintenance', 'small', 'minor']
    };
    
    const text = `${title} ${description} ${category}`;
    
    const highCount = complexityKeywords.high.filter(word => text.includes(word)).length;
    const mediumCount = complexityKeywords.medium.filter(word => text.includes(word)).length;
    const lowCount = complexityKeywords.low.filter(word => text.includes(word)).length;
    
    if (highCount > mediumCount && highCount > lowCount) return 'high';
    if (mediumCount > lowCount) return 'medium';
    return 'low';
  }

  // Estimate project duration
  private estimateProjectDuration(project: Project): string {
    const complexity = this.calculateProjectComplexity(project);
    const category = project.category.toLowerCase();
    
    const durationMap: { [key: string]: { [key: string]: string } } = {
      'kitchen remodeling': { low: '2-3 weeks', medium: '4-6 weeks', high: '8-12 weeks' },
      'bathroom renovation': { low: '1-2 weeks', medium: '3-4 weeks', high: '6-8 weeks' },
      'roofing': { low: '3-5 days', medium: '1-2 weeks', high: '2-3 weeks' },
      'plumbing': { low: '1-3 days', medium: '1 week', high: '2-3 weeks' },
      'electrical': { low: '1-3 days', medium: '1 week', high: '2-3 weeks' }
    };
    
    return durationMap[category]?.[complexity] || '2-4 weeks';
  }

  // Analyze budget range
  private analyzeBudgetRange(project: Project): string {
    const budgetText = project.budget.toLowerCase();
    const amount = this.extractBudgetAmount(budgetText);
    
    if (!amount) return 'Budget not specified';
    
    if (amount >= 25000) return 'High-end project';
    if (amount >= 15000) return 'Mid-range project';
    if (amount >= 5000) return 'Standard project';
    return 'Budget-friendly project';
  }

  // Extract required specialties
  private extractRequiredSpecialties(project: Project): string[] {
    const category = project.category;
    const specialties: { [key: string]: string[] } = {
      'Kitchen Remodeling': ['Kitchen Remodeling', 'Cabinetry', 'Plumbing', 'Electrical'],
      'Bathroom Renovation': ['Bathroom Renovation', 'Plumbing', 'Tiling'],
      'Roofing': ['Roofing', 'General Contracting'],
      'Plumbing': ['Plumbing', 'General Contracting'],
      'Electrical': ['Electrical', 'General Contracting']
    };
    
    return specialties[category] || [category];
  }

  // Identify risk factors
  private identifyRiskFactors(project: Project): string[] {
    const risks: string[] = [];
    const complexity = this.calculateProjectComplexity(project);
    
    if (complexity === 'high') {
      risks.push('Complex project requiring experienced contractor');
    }
    
    const budgetAmount = this.extractBudgetAmount(project.budget);
    if (budgetAmount && budgetAmount < 5000) {
      risks.push('Low budget may limit contractor options');
    }
    
    if (project.timeline.toLowerCase().includes('urgent') || project.timeline.toLowerCase().includes('quick')) {
      risks.push('Tight timeline may affect quality');
    }
    
    return risks;
  }

  // Helper methods
  private extractBudgetAmount(budgetText: string): number | null {
    const matches = budgetText.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
    if (!matches) return null;
    
    const amounts = matches.map(match => 
      parseFloat(match.replace(/[$,]/g, ''))
    );
    
    return Math.max(...amounts);
  }

  private extractTimelineDuration(timelineText: string): number | null {
    const matches = timelineText.match(/(\d+)\s*(week|month|day)/i);
    if (!matches) return null;
    
    const amount = parseInt(matches[1]);
    const unit = matches[2].toLowerCase();
    
    switch (unit) {
      case 'week': return amount;
      case 'month': return amount * 4;
      case 'day': return Math.ceil(amount / 7);
      default: return amount;
    }
  }
} 