# Frontend Functional Requirements - Tractor Rental Platform

**Scope**: Frontend Only | **Tech Stack**: React + Standard CSS | **Data**: Mock Data

---

## 1. Authentication & Entry
*   **Login UI**:
    *   [ ] Clear email/password fields with validation feedback.
    *   [ ] "Remember Me" checkbox.
    *   [ ] "Forgot Password" link (can be a mock page).
    *   [ ] Role selection toggle (Farmer vs Owner) if not auto-detected.
*   **Registration UI**:
    *   [ ] Multi-step or comprehensive form: Name, Email, Password, Role Selection.
    *   [ ] Client-side validation for password strength and email format.
*   **Feedback**:
    *   [ ] Show loading spinner on submit.
    *   [ ] Display error messages inline or via toast (e.g., "Invalid credentials").
    *   [ ] Redirect to respective dashboard upon success.

## 2. Customer (Renter) Requirements
*   **Listing Page**:
    *   [ ] Grid/List view of tractors.
    *   [ ] **Search**: Text input for location/tractor name.
    *   [ ] **Filters**: Sidebar or dropdown for Price Range, HP, Type (Harvester, Plough, etc.).
    *   [ ] **Sorting**: Price (Low-High), Rating (High-Low).
*   **Equipment Detail View**:
    *   [ ] High-quality image gallery (carousel).
    *   [ ] Specifications: HP, Fuel Type, Attachments.
    *   [ ] Owner profile summary (Name, Rating).
    *   [ ] **Booking Form**: Date/Time picker, Duration selector.
    *   [ ] **Price Calculation**: Dynamic total price update based on duration.
*   **Booking Management**:
    *   [ ] **History**: List of Past, Active, and Upcoming bookings.
    *   [ ] **Status Indicators**: Color-coded badges (Pending: Yellow, Confirmed: Green, Cancelled: Red).
    *   [ ] **Actions**: "Cancel Booking" button (if eligible), "Download Receipt".
*   **Reviews**:
    *   [ ] Star rating input (1-5) and text area for comments.
    *   [ ] Visible only for completed bookings.

## 3. Equipment Owner Requirements
*   **Dashboard**:
    *   [ ] **Overview Cards**: Total Earnings, Active Rentals, Total Tractors.
    *   [ ] **Recent Activity**: List of latest booking requests.
*   **Equipment Management**:
    *   [ ] **Add Tractor**: Form with image upload (preview only), technical specs, hourly rate.
    *   [ ] **Edit/Delete**: Ability to modify availability or remove functionality.
    *   [ ] **Toggle Availability**: Quick switch to mark tractor as "Under Maintenance".
*   **Booking Requests**:
    *   [ ] List of pending requests with Farmer details.
    *   [ ] **Approve/Reject Actions**: Buttons with confirmation dialogs.

## 4. Admin Requirements
*   **Dashboard**:
    *   [ ] Platform-wide stats: Total Users, Total Tractors, Total Revenue.
*   **User Management**:
    *   [ ] Table view of all users with search/filter by Role.
    *   [ ] Action to "Ban/Suspend" user.
*   **Equipment Approval**:
    *   [ ] Queue of newly added tractors requiring verification.
    *   [ ] Approve/Reject buttons with reason input.
*   **Booking Monitoring**:
    *   [ ] Master list of all bookings with status.

## 5. Navigation & Routing
*   **Public Routes**: Home, Search, Login, Register, Tractor Details.
*   **Protected Routes**:
    *   `/dashboard/*` (Role-specific redirection).
    *   `/bookings` (Customer).
    *   `/my-tractors` (Owner).
    *   `/admin/*` (Admin only).
*   **Unauthorized Access**:
    *   [ ] specific "Access Denied" page or redirect to Login.
    *   [ ] Hide menu items based on role (e.g., "Add Tractor" hidden for Farmers).

## 6. UI Feedback & States
*   **Loading**: Skeleton loaders for lists (tractors, bookings) to prevent layout shift.
*   **Empty States**: Friendly illustrations/text when no data exists (e.g., "No bookings yet!").
*   **Error States**: "Retry" button for failed data fetches.
*   **Toast Notifications**: Auto-dismissing popups for success/error actions (e.g., "Booking Confirmed!").
*   **Confirmation Dialogs**: Modal warnings for destructive actions (Delete, Cancel).

## 7. Data Handling (Frontend Only)
*   **Mock Data**: Use robust JSON constants or a mock service worker to simulate API delays.
*   **State Management**:
    *   Global: User Session (AuthContext), Toast Notifications.
    *   Local: Form inputs, UI toggles.
*   **API Readiness**: Service layer structure that allows swapping mock functions with `axios` calls later.

---
**Non-Functional Requirements**:
- **Responsiveness**: Mobile-first design (hamburger menu on mobile, tables scrollable).
- **Accessibility**: ARIA labels on inputs, keyboard navigation support.
- **Code Quality**: Reusable components (`Button`, `Card`, `Modal`) to ensure consistency.
