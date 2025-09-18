# Product Requirements Document - Baru Taraje Hotel Management System

## Core Purpose & Success

**Mission Statement**: Baru Taraje is a comprehensive hotel management system that streamlines hotel operations from guest booking to staff management, providing an intuitive mobile-first experience for customers and a powerful dashboard for staff.

**Success Indicators**: 
- Reduced booking time for customers 
- Streamlined staff workflows
- Centralized data management
- Mobile-responsive interface adoption

**Experience Qualities**: Intuitive, Professional, Efficient

## Project Classification & Approach

**Complexity Level**: Complex Application (advanced functionality, multiple user roles, comprehensive CRUD operations)

**Primary User Activity**: Creating, Managing, and Interacting with hotel data across multiple user roles

## Thought Process for Feature Selection

**Core Problem Analysis**: Hotels need integrated systems to manage guests, rooms, staff, and operations efficiently while providing customers with easy booking and account management.

**User Context**: Staff will use desktop dashboards during work hours, while customers will primarily access via mobile devices for booking and account management.

**Critical Path**: 
1. Staff authentication and role-based access
2. Customer registration and booking flow  
3. Room management and availability tracking
4. Staff user management and permissions

**Key Moments**: 
- Staff login and dashboard access
- Customer booking completion
- Room status updates

## Essential Features

### Phase 1: Master Data Management (Completed)

#### User Management (Phase 1.1a) ✅
**What it does**: Complete CRUD operations for staff users (Admin & Resepsionis) with role-based access control
**Why it matters**: Establishes secure foundation for system access and permissions
**Success criteria**: Only Admin users can manage staff accounts, with proper validation and security measures

#### Room Type Management (Phase 1.1b) ✅
**What it does**: Comprehensive management of room types including pricing, capacity, and imagery
**Why it matters**: Foundation for room management and booking system - defines available room categories
**Success criteria**: Admin can create, edit, and delete room types with protection against deleting types in use

#### Guest Management (Phase 1.1c) ✅
**What it does**: Complete CRUD operations for guest database with identity verification and contact management
**Why it matters**: Central CRM system for guest data that will be referenced in booking system
**Success criteria**: Admin can manage guest records with validation, duplicate prevention, and booking history protection

### Phase 2: Operational Management (Current Implementation)

#### Room Management (Phase 1.2a) ✅
**What it does**: Visual room status management with role-based features and drag-and-drop layout design
**Why it matters**: Real-time room status tracking and visual floor planning for operational efficiency
**Success criteria**: Staff can update room status, Admin can design floor layouts, both see real-time status

#### Booking Calendar (Phase 1.2b) ✅
**What it does**: Interactive calendar-based booking system with complete reservation workflow
**Why it matters**: Central hub for all booking operations with visual scheduling and payment tracking
**Success criteria**: Staff can create bookings, manage payments, track availability, and handle guest check-ins/outs

### Future Phases:
- Transaction Management (Financial reporting)
- Reporting and Analytics (Occupancy, Revenue)
- Customer Portal Enhancement

## Design Direction

### Visual Tone & Identity
**Emotional Response**: Professional confidence with approachable warmth
**Design Personality**: Modern, clean, and trustworthy - balancing corporate professionalism with hospitality warmth
**Visual Metaphors**: Clean lines representing efficiency, warm colors representing hospitality
**Simplicity Spectrum**: Minimal interface with rich functionality - information density balanced with breathing room

### Color Strategy
**Color Scheme Type**: Monochromatic with accent colors
**Primary Color**: Deep blue (oklch(0.4 0.15 240)) - representing trust and professionalism
**Secondary Colors**: Warm gray (oklch(0.6 0.02 60)) for supporting elements
**Accent Color**: Warm orange (oklch(0.65 0.15 45)) for calls-to-action and highlights
**Color Psychology**: Blue builds trust for financial transactions, warm accents create hospitality feel
**Color Accessibility**: All combinations meet WCAG AA standards (4.5:1 contrast ratio)

### Typography System
**Font Pairing Strategy**: Single font family (Inter) with varied weights for hierarchy
**Typographic Hierarchy**: Bold headings, medium subheadings, regular body text with consistent spacing
**Font Personality**: Inter provides modern professionalism with excellent legibility
**Typography Consistency**: 1.5x line height for body text, generous spacing between sections

### Visual Hierarchy & Layout
**Attention Direction**: Primary actions use accent color, secondary actions use muted styling
**White Space Philosophy**: Generous spacing creates calm, focused experience
**Grid System**: Consistent spacing using Tailwind's spacing scale
**Responsive Approach**: Mobile-first design with progressive enhancement for desktop
**Content Density**: Balanced information display with clear grouping and separation

### UI Elements & Component Selection
**Component Usage**: Shadcn components for consistency - Cards for content grouping, Tables for data display, Modals for focused actions
**Component States**: Hover, focus, active, and disabled states for all interactive elements
**Icon Selection**: Lucide React icons for consistent visual language
**Spacing System**: Tailwind spacing scale (4px base unit) for mathematical consistency

### Accessibility & Readability
**Contrast Goal**: WCAG AA compliance minimum for all text and interactive elements

## Implementation Considerations

**Scalability Needs**: Modular component architecture supports feature expansion
**Testing Focus**: Role-based access control, form validation, data persistence
**Critical Questions**: How will user permissions scale as new roles are added?

## Current Implementation Status

✅ **Completed - Phase 1.1a: User Management Module**
- Comprehensive staff user CRUD operations
- Role-based access control (Admin-only access)
- Advanced filtering and search functionality
- Secure password management with reset functionality
- Form validation and email uniqueness checking
- Self-protection (users cannot disable their own accounts)
- Responsive design with mobile-first approach
- Toast notifications for user feedback
- Pagination for large datasets

✅ **Completed - Phase 1.1b: Room Type Management Module**
- Complete CRUD operations for room types (Tipe Kamar)
- Admin-only access with role-based security
- Automatic code generation (TK-01, TK-02, etc.)
- Form validation with real-time feedback
- Image preview and URL validation
- Delete protection for room types in use
- Search functionality for easy filtering
- Currency formatting for prices
- Tooltip help for disabled actions
- Mobile-responsive table design

✅ **Completed - Phase 1.1c: Guest Management Module**
- Comprehensive guest data CRUD operations
- Admin-only access with role-based security
- Automatic guest code generation (TAMU-001, TAMU-002, etc.)
- Identity type management (KTP, SIM, Paspor)
- Email and phone validation with uniqueness checking
- Delete protection for guests with booking history
- Advanced search across name, email, and phone
- Internal notes system for guest preferences
- Form validation with real-time feedback
- Mobile-responsive design
- Tooltip guidance for restricted actions

✅ **Completed - Phase 1.2a: Room Management Module**
- Visual room status management with card-based interface
- Role-based access (Admin + Resepsionis for status, Admin-only for layout)
- Real-time status updates with workflow validation
- Interactive drag-and-drop floor layout designer (Admin only)
- Multi-floor support with customizable grid layouts
- Status filtering and room type filtering
- Status transition logic (prevents unauthorized changes)
- Visual status indicators with color coding
- Mobile-responsive design for all screen sizes

✅ **Completed - Phase 1.2b: Booking Calendar Module**
- Interactive calendar interface using react-big-calendar
- Visual booking events with payment status color coding
- Comprehensive booking creation workflow with validation
- Real-time room availability checking
- Integrated guest management (search existing or add new)
- Payment processing with multiple options (DP, Full Payment, Pay Later)
- Transaction tracking and payment history
- Booking status management (Confirmed, Checked-in, Checked-out, Cancelled)
- Detailed booking information modals with full payment tracking
- Add additional payments functionality
- Booking modification and cancellation
- Multi-step form validation and error handling
- Mobile-responsive design optimized for staff workflows