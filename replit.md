# HomeConnect Pro - Contractor-Homeowner Marketplace

## Overview

HomeConnect Pro is a full-stack web application that connects homeowners with verified contractors for home improvement projects. Built with React, Express, and PostgreSQL, it provides a marketplace where homeowners can post projects and receive competitive bids from contractors.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Uploads**: Multer for handling image uploads
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon serverless driver for serverless deployment

## Key Components

### Authentication & User Management
- User registration and profile management
- Dual user types: homeowners and contractors
- Contractor verification system with license and insurance tracking
- Profile completion with company details and specialties

### Project Management
- Project posting with categories, budgets, and timelines
- Image upload functionality for project documentation
- Project status tracking (open, in_progress, completed, cancelled)
- Location-based project discovery

### Bidding System
- Contractors can submit bids on projects
- Bid management with accept/reject functionality
- Real-time bid tracking and notifications
- Competitive pricing transparency

### Messaging System
- Project-based messaging between homeowners and contractors
- Conversation history and management
- Real-time communication features

### File Management
- Image upload and storage for project photos
- Portfolio management for contractors
- File type validation and size limits

## Data Flow

1. **User Registration**: Users sign up as either homeowners or contractors
2. **Profile Setup**: Contractors complete verification with business details
3. **Project Posting**: Homeowners create projects with requirements and photos
4. **Contractor Discovery**: Contractors browse and filter available projects
5. **Bid Submission**: Contractors submit competitive bids
6. **Bid Evaluation**: Homeowners review and select contractors
7. **Project Communication**: Messaging facilitates project coordination

## External Dependencies

### UI Components
- Radix UI primitives for accessible components
- Lucide React for consistent iconography
- Embla Carousel for image galleries

### Data & Validation
- Zod for runtime type validation
- Date-fns for date manipulation
- Class-variance-authority for component variants

### File Handling
- React Dropzone for drag-and-drop uploads
- Multer for server-side file processing

### Development Tools
- ESBuild for server bundling
- TSX for TypeScript execution
- Replit development environment integration

## Deployment Strategy

### Development Environment
- Replit-based development with hot reloading
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation
- PostgreSQL database provisioning

### Production Build
- Vite build for optimized frontend assets
- ESBuild for server bundling
- Static file serving from Express
- Autoscale deployment target

### Database Management
- Drizzle migrations for schema changes
- Connection pooling with Neon serverless
- Environment-based configuration

## Changelog

```
Changelog:
- June 25, 2025. Initial setup
- June 25, 2025. Added location-based contractor filtering with 20km radius
- June 25, 2025. Enhanced project categories with 20 total categories
- June 25, 2025. Implemented geolocation tracking and distance calculation
- June 25, 2025. Fixed authentication system - all "Sign in and get started" buttons now working
- June 25, 2025. Completed full functionality testing - all features operational
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```