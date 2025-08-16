import { ConfigService } from '@nestjs/config';
export interface DocumentAnalysisResult {
    type: string;
    category: string;
    extractedData: Record<string, any>;
    summary: string;
    confidenceScore: number;
    keyFields: Array<{
        field: string;
        value: any;
        confidence: number;
    }>;
}
export interface PropertyAnalysisResult {
    marketValue: {
        estimated: number;
        range: {
            min: number;
            max: number;
        };
        confidence: number;
    };
    comparables: Array<{
        address: string;
        price: number;
        similarity: number;
        distance: number;
    }>;
    marketTrends: {
        priceChange: number;
        demandLevel: string;
        forecast: string;
    };
    recommendations: string[];
}
export interface OfferAnalysisResult {
    riskAssessment: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
        score: number;
    };
    marketComparison: {
        percentOfMarketValue: number;
        competitiveness: string;
        recommendation: string;
    };
    negotiationPoints: string[];
    recommendations: string[];
}
export declare class AIService {
    private configService;
    private readonly logger;
    private readonly openai;
    private readonly anthropic;
    constructor(configService: ConfigService);
    analyzeDocument(buffer: Buffer, mimeType: string, filename: string): Promise<DocumentAnalysisResult>;
    analyzeProperty(propertyData: any, marketData?: any): Promise<PropertyAnalysisResult>;
    analyzeOffer(offerData: any, propertyData: any, marketData?: any): Promise<OfferAnalysisResult>;
    generatePropertyDescription(propertyDetails: any): Promise<string>;
    processPropertyImages(images: Buffer[]): Promise<Array<{
        description: string;
        features: string[];
    }>>;
    searchProperties(naturalLanguageQuery: string, filters?: any): Promise<any>;
    private parseAIResponse;
    private extractFeaturesFromDescription;
}
