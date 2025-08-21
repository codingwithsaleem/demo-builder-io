# Manufacturing Quote Calculator

## Overview

A full-stack web application that calculates manufacturing quotes based on uploaded CAD files. The system extracts volume data from STP/STEP files, allows users to select materials, and calculates pricing with customizable markup percentages. Built as a modern React frontend with an Express.js backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui for consistent design system
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: React Dropzone for drag-and-drop STP/STEP file uploads

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful endpoints for materials, quotes, and file uploads
- **File Processing**: Mock STP volume extraction (simulates opencascade.js integration)
- **Storage**: In-memory storage implementation with interface for future database integration
- **Middleware**: Custom logging, JSON parsing, and error handling
- **Development**: Vite integration for hot module replacement in development

### Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle Kit
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema**: Two main entities - materials (density, cost per gram) and quotes (volume, pricing calculations)
- **Migrations**: Drizzle migrations stored in `/migrations` directory
- **Connection**: Neon serverless PostgreSQL driver for production deployments

### Authentication and Authorization
- Currently implements basic session-based approach
- Uses connect-pg-simple for PostgreSQL session storage
- No user authentication system implemented (single-user application)

### External Dependencies
- **Database**: Neon serverless PostgreSQL for cloud database hosting
- **File Processing**: Planned integration with opencascade.js for actual STP file volume extraction
- **UI Components**: Extensive Radix UI primitive library for accessible components
- **Development Tools**: Replit-specific plugins for development environment integration

### Key Architectural Decisions

**Monorepo Structure**: Client and server code in same repository with shared schema definitions, enabling type safety across the full stack and simplified development workflow.

**Real File Processing**: STP volume extraction uses opencascade.js library for authentic CAD file processing, extracting real volume data from uploaded .STP/.STEP files with fallback to mock data for development/testing scenarios.

**Type-Safe API**: Shared Zod schemas between client and server ensure runtime validation and compile-time type safety for all API interactions.

**Component-Based UI**: Leverages Radix UI primitives with custom styling through shadcn/ui, providing accessibility and consistency while maintaining design flexibility.

**Optimistic UX**: Real-time quote calculations and responsive file upload feedback provide immediate user feedback during potentially slow operations.