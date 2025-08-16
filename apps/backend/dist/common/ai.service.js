var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AIService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
let AIService = AIService_1 = class AIService {
    configService;
    logger = new Logger(AIService_1.name);
    openai;
    anthropic;
    constructor(configService) {
        this.configService = configService;
        const openaiKey = this.configService.get('OPENAI_API_KEY');
        const anthropicKey = this.configService.get('ANTHROPIC_API_KEY');
        if (openaiKey) {
            this.openai = new OpenAI({ apiKey: openaiKey });
        }
        if (anthropicKey) {
            this.anthropic = new Anthropic({ apiKey: anthropicKey });
        }
    }
    async analyzeDocument(buffer, mimeType, filename) {
        try {
            let textContent = '';
            if (mimeType.includes('pdf')) {
                const pdfData = await pdfParse(buffer);
                textContent = pdfData.text;
            }
            else if (mimeType.includes('document') || mimeType.includes('word')) {
                const docData = await mammoth.extractRawText({ buffer });
                textContent = docData.value;
            }
            else if (mimeType.includes('image')) {
                const { data: { text } } = await Tesseract.recognize(buffer);
                textContent = text;
            }
            else {
                textContent = buffer.toString('utf-8');
            }
            if (!textContent.trim()) {
                throw new Error('No text content extracted from document');
            }
            const analysisPrompt = `
        Analyze this real estate document and extract key information. The document content is:
        
        ${textContent}
        
        Please provide:
        1. Document type (contract, inspection_report, disclosure, financial, etc.)
        2. Key extracted data in structured format
        3. A brief summary
        4. Confidence score (0-1)
        5. Important fields with their values and confidence scores
        
        Respond in JSON format.
      `;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: analysisPrompt }],
                temperature: 0.1,
                max_tokens: 2000,
            });
            const aiResponse = response.choices[0]?.message?.content;
            if (!aiResponse) {
                throw new Error('No response from AI service');
            }
            const parsedResponse = this.parseAIResponse(aiResponse);
            return {
                type: parsedResponse.type || 'unknown',
                category: parsedResponse.category || 'other',
                extractedData: parsedResponse.extractedData || {},
                summary: parsedResponse.summary || 'Analysis completed',
                confidenceScore: parsedResponse.confidenceScore || 0.8,
                keyFields: parsedResponse.keyFields || [],
            };
        }
        catch (error) {
            this.logger.error(`Document analysis failed: ${error.message}`, error.stack);
            throw new Error(`Document analysis failed: ${error.message}`);
        }
    }
    async analyzeProperty(propertyData, marketData) {
        try {
            const analysisPrompt = `
        Analyze this property for market value and provide insights:
        
        Property Details:
        ${JSON.stringify(propertyData, null, 2)}
        
        Market Data:
        ${JSON.stringify(marketData || {}, null, 2)}
        
        Provide:
        1. Estimated market value with range and confidence
        2. Comparable properties analysis
        3. Market trends assessment
        4. Investment recommendations
        
        Respond in JSON format.
      `;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: analysisPrompt }],
                temperature: 0.2,
                max_tokens: 1500,
            });
            const aiResponse = response.choices[0]?.message?.content;
            if (!aiResponse) {
                throw new Error('No response from AI service');
            }
            return this.parseAIResponse(aiResponse);
        }
        catch (error) {
            this.logger.error(`Property analysis failed: ${error.message}`, error.stack);
            throw new Error(`Property analysis failed: ${error.message}`);
        }
    }
    async analyzeOffer(offerData, propertyData, marketData) {
        try {
            const analysisPrompt = `
        Analyze this real estate offer and provide risk assessment:
        
        Offer Details:
        ${JSON.stringify(offerData, null, 2)}
        
        Property Details:
        ${JSON.stringify(propertyData, null, 2)}
        
        Market Context:
        ${JSON.stringify(marketData || {}, null, 2)}
        
        Provide:
        1. Risk assessment (level, factors, score)
        2. Market comparison analysis
        3. Negotiation points and recommendations
        
        Respond in JSON format.
      `;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: analysisPrompt }],
                temperature: 0.2,
                max_tokens: 1500,
            });
            const aiResponse = response.choices[0]?.message?.content;
            if (!aiResponse) {
                throw new Error('No response from AI service');
            }
            return this.parseAIResponse(aiResponse);
        }
        catch (error) {
            this.logger.error(`Offer analysis failed: ${error.message}`, error.stack);
            throw new Error(`Offer analysis failed: ${error.message}`);
        }
    }
    async generatePropertyDescription(propertyDetails) {
        try {
            const prompt = `
        Create an engaging property description for this listing:
        ${JSON.stringify(propertyDetails, null, 2)}
        
        Make it professional, appealing, and highlight key features.
        Keep it under 300 words.
      `;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 400,
            });
            return response.choices[0]?.message?.content || 'Property description generation failed';
        }
        catch (error) {
            this.logger.error(`Description generation failed: ${error.message}`, error.stack);
            throw new Error(`Description generation failed: ${error.message}`);
        }
    }
    async processPropertyImages(images) {
        try {
            const results = [];
            for (const imageBuffer of images) {
                const base64Image = imageBuffer.toString('base64');
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-4-vision-preview',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Analyze this property image and describe what you see. Identify key features, room type, condition, and any notable aspects.'
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 500,
                });
                const description = response.choices[0]?.message?.content || 'Image analysis failed';
                const features = this.extractFeaturesFromDescription(description);
                results.push({ description, features });
            }
            return results;
        }
        catch (error) {
            this.logger.error(`Image processing failed: ${error.message}`, error.stack);
            throw new Error(`Image processing failed: ${error.message}`);
        }
    }
    async searchProperties(naturalLanguageQuery, filters = {}) {
        try {
            const prompt = `
        Convert this natural language property search query into structured search parameters:
        "${naturalLanguageQuery}"
        
        Consider these filters: ${JSON.stringify(filters)}
        
        Extract:
        - Price range
        - Property type
        - Bedrooms/bathrooms
        - Location preferences
        - Special features
        - Any other relevant criteria
        
        Return as JSON search parameters.
      `;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 500,
            });
            const aiResponse = response.choices[0]?.message?.content;
            return this.parseAIResponse(aiResponse);
        }
        catch (error) {
            this.logger.error(`Property search processing failed: ${error.message}`, error.stack);
            throw new Error(`Property search processing failed: ${error.message}`);
        }
    }
    parseAIResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return {
                error: 'Failed to parse AI response',
                rawResponse: response,
            };
        }
        catch (error) {
            this.logger.warn(`Failed to parse AI response: ${error.message}`);
            return {
                error: 'Invalid JSON response from AI',
                rawResponse: response,
            };
        }
    }
    extractFeaturesFromDescription(description) {
        const commonFeatures = [
            'hardwood floors', 'carpet', 'tile', 'granite countertops', 'stainless steel appliances',
            'fireplace', 'vaulted ceilings', 'bay windows', 'walk-in closet', 'master suite',
            'updated kitchen', 'updated bathroom', 'new paint', 'crown molding', 'ceiling fans',
            'patio', 'deck', 'garage', 'swimming pool', 'garden', 'landscaping'
        ];
        const features = [];
        const lowerDescription = description.toLowerCase();
        for (const feature of commonFeatures) {
            if (lowerDescription.includes(feature.toLowerCase())) {
                features.push(feature);
            }
        }
        return features;
    }
};
AIService = AIService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], AIService);
export { AIService };
//# sourceMappingURL=ai.service.js.map