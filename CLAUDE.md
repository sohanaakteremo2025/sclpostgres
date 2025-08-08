# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-tenant school management system built with Next.js 15, supporting multiple institutions through subdomain-based routing. The system handles academic management, financial operations, student/staff management, and examination systems.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run postinstall` - Generate Prisma client

### Database & Seeding
- `npm run seed` - Run all seeders
- `npm run seed:student` - Seed students only
- `npm run seed:tenant` - Seed tenants only
- `npm run seed:employee` - Seed employees only

### Data Management
- `npm run backup` - Create data backup
- `npm run restore` - Restore from backup
- `npm run list-backups` - List available backups

## Architecture Overview

### Multi-tenant Structure
- **Tenant Isolation**: Each school/institution operates as separate tenant via subdomain
- **Domain Routing**: `school.domain.com` → `/institution/school/*` paths
- **Tenant Context**: Always use `const tenantId = await getTenantId()` from `lib/tenant`
- **Middleware**: Handles tenant resolution, billing checks, and role-based access

### Authentication & Authorization
- **NextAuth.js**: JWT-based authentication with session strategy
- **User Roles**: SUPER_ADMIN, ADMIN, STUDENT, TEACHER, EMPLOYEE, etc.
- **Role Hierarchy**: SUPER_ADMIN (CMS access), ADMIN (tenant admin), others (tenant users)
- **Route Protection**: Middleware enforces tenant boundaries and role access

### Feature-based Architecture
Features are organized in `features/` directory by domain:
- `academic-management/` - Classes, subjects, sessions, routines
- `student-management/` - Students, enrollment, attendance
- `financial-management/` - Fees, payments, dues, accounting
- `examination-management/` - Exams, schedules, results
- `staff-management/` - Employees, salaries
- `communication/` - Notices, messaging

Each feature follows the pattern:
```
feature-name/
├── api/           # Server actions
├── components/    # React components
├── db/           # Database repositories
├── services/     # Business logic
└── types/        # TypeScript types
```

### Database Design
- **Prisma ORM**: Schema-first approach with code generation
- **Multi-tenant**: Tenant-scoped data isolation
- **Enums**: Extensive use of enums for type safety
- **Relations**: Complex academic and financial relationships
- **Zod Validation**: Auto-generated schemas from Prisma

## Key Architectural Patterns

### Server Actions Pattern
- Use server actions in `api/` folders for data mutations
- Repository pattern in `db/` folders for data access
- Service layer in `services/` for business logic
- Always include tenant validation in repositories

### Component Organization
- Feature-specific components in `features/*/components/`
- Shared UI components in `components/ui/`
- Table components use custom data table implementation
- Form components use react-hook-form with Zod validation

### Caching Strategy
- **Next.js Cache**: `unstable_cache` for tenant lookups
- **Cache Tags**: Tagged caching for selective invalidation
- **Tenant Context**: Cached tenant data with different TTLs

### Form Handling
- **react-hook-form**: Primary form library
- **Zod Validation**: Schema validation throughout
- **Custom Form Builder**: `components/form-builder.tsx` for dynamic forms
- **School Form**: Feature-rich form system in `components/school-form/`

## Development Guidelines

### Tenant Management
- Always retrieve tenant context: `const tenantId = await getTenantId()`
- Use tenant-aware queries in all repositories
- Validate tenant boundaries in middleware
- Cache tenant data appropriately

### Database Operations
- Use repository pattern for data access
- Include proper error handling and validation
- Implement proper transaction management for complex operations
- Follow Prisma best practices for relations

### API Development
- Server actions for mutations, not REST APIs
- Proper error handling with structured responses
- Validate inputs with Zod schemas
- Include proper logging for debugging

### Component Development
- Follow existing patterns in feature components
- Use TypeScript strictly
- Implement proper loading states
- Handle errors gracefully

### Testing & Quality
- Run lint before commits (configured in husky)
- Use TypeScript strict mode
- Validate forms with Zod
- Test multi-tenant scenarios

## Important Notes

- **Multi-tenant Awareness**: All database operations must be tenant-scoped
- **Role-based Access**: Implement proper permission checks
- **Billing Integration**: System includes tenant billing with overdue protection
- **Performance**: Heavy use of caching for tenant and user lookups
- **Mobile Support**: PWA-enabled with offline capabilities