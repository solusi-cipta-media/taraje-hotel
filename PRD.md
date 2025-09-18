# Planning Guide

Baru Taraje is a comprehensive hotel management system that provides both customer-facing mobile-first experience and internal staff dashboard functionality.

**Experience Qualities**: 
1. Mobile-native feel with intuitive navigation for customers
2. Professional efficiency for staff operations
3. Seamless integration between customer and staff workflows

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Multi-role system supporting Admin, Receptionist, and Customer roles with distinct interfaces and permissions

## Essential Features

**Mobile-First Customer Interface**
- Functionality: Customer booking, profile management, order tracking
- Purpose: Provide hotel guests with self-service capabilities
- Trigger: Accessing public routes or customer account pages
- Progression: Landing → Browse Packages → Login/Register → Book → Track Orders → Manage Profile
- Success criteria: Seamless mobile experience with bottom navigation

**Internal Staff Dashboard**
- Functionality: Hotel operations management including rooms, bookings, guests, and reports
- Purpose: Enable staff to efficiently manage hotel operations
- Trigger: Staff accessing /dashboard/* routes
- Progression: Login → Dashboard → Select Module → Perform Operations → Generate Reports
- Success criteria: Desktop-optimized interface with sidebar navigation

**Dynamic Navigation System**
- Functionality: Navigation adapts based on user authentication status
- Purpose: Show relevant options to logged-in vs anonymous users
- Trigger: User login/logout state changes
- Progression: Anonymous (Home/Packages/Login) → Authenticated (Home/Packages/Orders/Profile)
- Success criteria: Navigation updates immediately on auth state change

**Multi-Role Authentication**
- Functionality: Support for Admin, Receptionist, and Customer roles
- Purpose: Provide appropriate access levels and interfaces
- Trigger: User login with role-based routing
- Progression: Login → Role Detection → Redirect to Appropriate Interface
- Success criteria: Correct interface and permissions per role

## Edge Case Handling
- **Unauthorized Access**: Redirect to appropriate login page
- **Invalid Routes**: Custom 404 page with navigation back to home
- **Network Failures**: Graceful error handling with retry options
- **Session Expiry**: Automatic logout with login prompt
- **Mobile Orientation**: Layout adapts to portrait/landscape

## Design Direction
The design should feel modern and professional for staff interfaces while maintaining a welcoming, mobile-app-like experience for customers with clean navigation and minimal cognitive load.

## Color Selection
Complementary (opposite colors) - Using warm and cool tones to distinguish between customer-facing warmth and professional staff efficiency.

- **Primary Color**: Deep Blue (oklch(0.4 0.15 240)) - Communicates trust and professionalism
- **Secondary Colors**: Warm Gray (oklch(0.6 0.02 60)) for neutral backgrounds and soft borders
- **Accent Color**: Warm Orange (oklch(0.65 0.15 45)) for call-to-action buttons and active states
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark Gray text (oklch(0.2 0 0)) - Ratio 10.4:1 ✓
  - Primary (Deep Blue oklch(0.4 0.15 240)): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Accent (Warm Orange oklch(0.65 0.15 45)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓
  - Card (Light Gray oklch(0.98 0 0)): Dark Gray text (oklch(0.2 0 0)) - Ratio 9.8:1 ✓

## Font Selection
Clean, modern sans-serif typography that works well on both mobile and desktop, emphasizing readability and professional appearance.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Inter Bold/24px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/20px/normal spacing
  - H3 (Card Titles): Inter Medium/18px/normal spacing
  - Body Text: Inter Regular/16px/relaxed line height
  - Small Text: Inter Regular/14px/normal spacing

## Animations
Subtle and purposeful animations that enhance usability without feeling excessive, focusing on state transitions and navigation feedback.

- **Purposeful Meaning**: Smooth transitions communicate app responsiveness and guide user attention during navigation changes
- **Hierarchy of Movement**: Bottom navigation active states, sidebar collapse/expand, and modal transitions receive animation priority

## Component Selection
- **Components**: Card for content containers, Button variants for different actions, Table for data display, Dialog for modals, Tabs for dashboard sections
- **Customizations**: Custom bottom navigation bar, collapsible sidebar, dynamic header component
- **States**: Clear hover/active states for all interactive elements, loading states for data operations
- **Icon Selection**: Lucide React icons for consistency (Home, Package, LogIn, User, ListOrdered, etc.)
- **Spacing**: Consistent 4px base unit using Tailwind's spacing scale (p-4, gap-6, etc.)
- **Mobile**: Bottom navigation replaces traditional menus, cards stack vertically, generous touch targets (min 44px)