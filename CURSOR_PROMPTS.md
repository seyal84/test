# Cursor Prompts for HomeFlow AI-Powered Real Estate Platform

## Project Overview

HomeFlow is an AI-powered real estate transaction platform built as a modern monorepo with:
- **Backend**: NestJS + Prisma + PostgreSQL (apps/backend)
- **Frontend**: React + Vite + TailwindCSS (apps/web)  
- **Mobile**: React Native + Expo scaffold (apps/mobile)
- **Infrastructure**: Docker + Terraform for AWS deployment

## Main Development Prompts

### 1. Document Processing & AI Integration Enhancement

**Main Prompt:**

I have a real estate platform (HomeFlow) with a basic document upload system in the storage module. I want to transform this into a comprehensive AI-powered document processing system that can extract and analyze real estate documents.

Here's what I'm starting with:
- `apps/backend/src/modules/storage/`: Basic S3 file upload service
- `apps/backend/src/modules/listings/`: Property listing management
- `apps/web/src/pages/ListingCreatePage.tsx`: Basic listing creation form
- Current document types: property images, contracts, inspection reports

Transform this into a comprehensive AI document processing system with:

#### Core Features
1. **Enhanced Document Upload Interface**
   - Support multiple real estate document formats:
     - PDF files (.pdf) - contracts, disclosures, inspection reports
     - Word documents (.docx) - agreements, amendments
     - Image files (.jpg, .jpeg, .png, .bmp, .tiff) - property photos, floor plans
     - Excel files (.xlsx) - financial analyses, comparables
   - Drag-and-drop functionality with document categorization
   - Document preview and validation before processing
   - File size limits and format validation
   - Batch upload with progress tracking

2. **AI Document Analysis & Extraction**
   - Extract key information from contracts (price, terms, dates, parties)
   - Analyze inspection reports for issues and recommendations
   - Process property disclosure documents
   - Extract comparable sales data from MLS sheets
   - Identify document types automatically using AI classification

3. **Professional Dashboard Interface**
   - Modern, real estate-focused design with property-themed colors
   - Document organization by property and transaction type
   - Processing status indicators and progress tracking
   - Document timeline and version management

#### Data Extraction & Display
Create structured data extraction for:
- **Contract Analysis**: Purchase price, closing date, contingencies, parties
- **Inspection Reports**: Property condition, recommended repairs, cost estimates
- **Disclosure Documents**: Known issues, HOA information, property history
- **Financial Documents**: Loan terms, payment schedules, closing costs
- **Property Details**: Square footage, lot size, features, amenities

#### Real Estate-Specific Features
- Transaction timeline visualization
- Document requirement checklists by transaction type
- Automated compliance checking for local regulations
- Integration with MLS data for property verification
- Comparative market analysis document processing

#### Technical Requirements
- Extend the existing NestJS backend with new AI processing modules
- Integrate with the current Prisma schema for document metadata
- Use the existing S3 service for secure document storage
- Maintain JWT authentication and RBAC (buyers, sellers, agents)
- Add comprehensive error handling for AI processing failures

Make it production-ready with:
- Clean integration with existing HomeFlow architecture
- Proper TypeScript types for all document schemas
- Comprehensive test coverage for document processing
- Professional UI that matches the current design system
- Real-time processing status updates using WebSockets or polling

Test with sample real estate documents to ensure accuracy and performance.

---

### 2. Advanced Property Search & AI Matching

**Main Prompt:**

I have a basic property search system in HomeFlow with simple text search. I want to transform this into an AI-powered property matching and recommendation system.

Here's what I'm starting with:
- `apps/backend/src/modules/listings/listings.service.ts`: Basic listing CRUD and search
- `apps/web/src/pages/ListingsPage.tsx`: Simple property grid with search
- Current search: Basic text matching on title and description
- Existing schema: Property listings with basic fields (price, location, features)

Transform this into an intelligent property matching system with:

#### Core Features
1. **AI-Powered Search Interface**
   - Natural language search: "3 bedroom house near good schools under $500k"
   - Visual property comparison tools
   - Map-based search with intelligent radius suggestions
   - Saved searches with automated alerts
   - Voice search capability for mobile users

2. **Smart Property Recommendations**
   - ML-based user preference learning
   - Behavioral analysis for property suggestions
   - Market trend integration for timing recommendations
   - Similar property discovery based on viewing history
   - Price prediction and market analysis

3. **Advanced Filtering & Sorting**
   - Dynamic filter suggestions based on search context
   - Commute time calculations to important locations
   - School district ratings and demographic data
   - Neighborhood safety scores and amenities
   - Investment potential analysis

#### Technical Implementation
- Extend the existing listings service with AI capabilities
- Add new database tables for user preferences and search history
- Integrate with external APIs (school ratings, crime data, commute times)
- Implement caching for expensive ML operations
- Add search analytics and performance monitoring

---

### 3. Real-Time Offer Management & Negotiation System

**Main Prompt:**

I have a basic offer system in HomeFlow that needs to be transformed into a comprehensive real-time negotiation platform.

Here's what I'm starting with:
- `apps/backend/src/modules/offers/`: Basic offer CRUD operations
- `apps/web/src/pages/OffersPage.tsx`: Simple offer listing interface
- Current system: Static offer submission and basic status tracking

Transform this into a real-time negotiation platform with:

#### Core Features
1. **Real-Time Offer Interface**
   - Live offer status updates using WebSockets
   - Counter-offer management with automated calculations
   - Offer expiration timers and automatic notifications
   - Multi-party negotiation support (buyer, seller, agents)
   - Offer comparison tools for sellers with multiple offers

2. **Smart Negotiation Assistant**
   - AI-powered offer analysis and recommendations
   - Market-based pricing suggestions
   - Risk assessment for offer terms
   - Automated counter-offer generation
   - Historical negotiation pattern analysis

3. **Professional Communication Tools**
   - In-app messaging system for negotiation discussions
   - Document sharing for supporting materials
   - Automated email notifications for key events
   - Mobile push notifications for urgent updates
   - Audit trail for all negotiation activities

#### Technical Requirements
- Implement WebSocket connections for real-time updates
- Extend the existing offer module with negotiation workflows
- Add notification service for multi-channel communications
- Integrate with the existing user authentication system
- Maintain data consistency during concurrent negotiations

---

### 4. Escrow & Transaction Management Enhancement

**Main Prompt:**

I want to enhance the basic escrow module in HomeFlow into a comprehensive transaction management system.

Here's what I'm starting with:
- `apps/backend/src/modules/escrow/`: Basic escrow tracking
- `apps/web/src/pages/EscrowPage.tsx`: Simple escrow overview
- Existing integrations: Mocked Stripe and DocuSign services

Transform this into a full transaction management platform with:

#### Core Features
1. **Complete Transaction Lifecycle Management**
   - Automated milestone tracking and deadline management
   - Document requirement checklists with completion tracking
   - Integration with real Stripe for payment processing
   - Real DocuSign integration for digital signatures
   - Automated compliance checking and reporting

2. **Smart Transaction Assistant**
   - AI-powered timeline optimization
   - Risk identification and mitigation suggestions
   - Automated task assignments and reminders
   - Progress prediction based on historical data
   - Exception handling and resolution workflows

3. **Professional Transaction Dashboard**
   - Visual timeline with milestone progress
   - Document status and signature tracking
   - Payment and funding status monitoring
   - Communication hub for all transaction parties
   - Mobile-responsive design for on-the-go access

---

## UI/UX Enhancement Prompts

### Design System Modernization

**Enhance the visual design with:**
- Modern real estate-focused color palette (earth tones, professional blues)
- Custom CSS components for property cards and transaction timelines
- Improved typography optimized for document reading
- Status badges and progress indicators for all workflows
- Responsive design for desktop, tablet, and mobile devices
- Dark mode support for extended document review sessions

### User Experience Improvements

**Improve the user experience with:**
- Contextual help and onboarding flows for new users
- Keyboard shortcuts for power users (agents, professionals)
- Accessibility compliance (WCAG 2.1 AA standards)
- Auto-save functionality for all forms and drafts
- Undo/redo capabilities for document annotations
- Offline mode for critical transaction data

### Performance Optimization

**Optimize the application with:**
- Lazy loading for document previews and large property images
- Virtual scrolling for large property lists
- Image optimization and progressive loading
- CDN integration for static assets
- Caching strategies for AI processing results
- Bundle optimization for faster initial load times

---

## Feature Expansion Prompts

### Analytics & Reporting Dashboard

**Add comprehensive analytics with:**
- Transaction success rate tracking
- User engagement and activity metrics
- Document processing performance analytics
- Market trend analysis and reporting
- Agent productivity dashboards
- Custom report generation tools

### Mobile App Enhancement

**Enhance the React Native mobile app with:**
- Push notifications for transaction updates
- Camera integration for document capture
- GPS-based property discovery
- Offline document access
- Biometric authentication
- Apple Wallet/Google Pay integration for payments

### Third-Party Integrations

**Add professional real estate integrations:**
- MLS data synchronization
- CRM system integrations (Salesforce, HubSpot)
- Accounting software connections (QuickBooks)
- Insurance provider APIs
- Home inspection service scheduling
- Mortgage lender pre-approval systems

---

## Development Guidelines

### Code Quality Standards
- Follow existing TypeScript patterns from the HomeFlow codebase
- Maintain consistency with current NestJS module structure
- Use Prisma for all database operations and schema changes
- Implement comprehensive error handling and logging
- Write unit tests for all new services and components
- Follow the existing RBAC patterns for user permissions

### Security Requirements
- Maintain JWT authentication flow with AWS Cognito
- Implement GDPR compliance for document processing
- Use helmet and rate limiting for API protection
- Secure file upload validation and virus scanning
- Encrypt sensitive document data at rest
- Audit logging for all financial transactions

### Performance Considerations
- Optimize database queries with proper indexing
- Implement caching for AI processing results
- Use CDN for document delivery and property images
- Monitor and optimize API response times
- Implement proper error boundaries in React components
- Use React Query for efficient data fetching and caching

---

## Key Context Files

When using these prompts, ensure you have access to:

**Backend Files:**
- `apps/backend/src/app.module.ts` - Main application module
- `apps/backend/src/modules/*/` - All existing service modules
- `apps/backend/prisma/schema.prisma` - Database schema
- `apps/backend/package.json` - Dependencies and scripts

**Frontend Files:**
- `apps/web/src/pages/*.tsx` - Existing page components
- `apps/web/src/lib/api.ts` - API client configuration
- `apps/web/src/styles.css` - Current styling system
- `apps/web/package.json` - Frontend dependencies

**Configuration Files:**
- `docker-compose.yml` - Development environment setup
- `.env.example` - Environment variable template
- `package.json` - Monorepo workspace configuration

**Infrastructure Files:**
- `infra/terraform/` - AWS deployment configuration
- `apps/backend/Dockerfile` - Backend containerization
- `apps/web/Dockerfile` - Frontend containerization

---

## Testing & Deployment

### Testing Strategy
- Unit tests for all new backend services using Jest
- Integration tests for API endpoints
- E2E tests for critical user flows using Cypress
- Load testing for document processing endpoints
- Security testing for file upload vulnerabilities

### Deployment Process
- GitHub Actions for CI/CD pipeline
- AWS ECS Fargate for container orchestration
- RDS for production database
- S3 for document storage with CloudFront CDN
- Blue/green deployment strategy for zero-downtime updates

### Monitoring & Observability
- Application performance monitoring (APM)
- Error tracking and alerting
- Database performance monitoring
- User session analytics
- Document processing success rates
- Transaction completion metrics