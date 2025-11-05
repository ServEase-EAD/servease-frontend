# Appointment Service Frontend Implementation

This document describes the frontend implementation for the Appointment Service in ServEase.

## Overview

The Appointment Service allows customers to schedule service appointments for their vehicles, and enables employees to manage and track these appointments through their lifecycle.

## API Configuration

All appointment-related endpoints are routed through the Nginx API gateway at `/api/v1/appointments/`.

### Configured Endpoints

```typescript
APPOINTMENTS: {
  // CRUD Operations
  LIST: "/api/v1/appointments/appointments/",
  DETAIL: (id: string) => `/api/v1/appointments/appointments/${id}/`,
  CREATE: "/api/v1/appointments/appointments/",
  UPDATE: (id: string) => `/api/v1/appointments/appointments/${id}/`,
  DELETE: (id: string) => `/api/v1/appointments/appointments/${id}/`,

  // Status Actions
  CONFIRM: (id: string) => `/api/v1/appointments/appointments/${id}/confirm/`,
  START: (id: string) => `/api/v1/appointments/appointments/${id}/start/`,
  COMPLETE: (id: string) => `/api/v1/appointments/appointments/${id}/complete/`,
  CANCEL: (id: string) => `/api/v1/appointments/appointments/${id}/cancel/`,
  RESCHEDULE: (id: string) => `/api/v1/appointments/appointments/${id}/reschedule/`,
  ASSIGN: (id: string) => `/api/v1/appointments/appointments/${id}/assign/`,

  // Query Endpoints
  AVAILABLE_SLOTS: "/api/v1/appointments/appointments/available_slots/",
  STATS: "/api/v1/appointments/appointments/stats/",
  HISTORY: (id: string) => `/api/v1/appointments/appointments/${id}/history/`,
  CUSTOMER_APPOINTMENTS: "/api/v1/appointments/appointments/customer_appointments/",
  EMPLOYEE_SCHEDULE: "/api/v1/appointments/appointments/employee_schedule/",
  VEHICLE_HISTORY: "/api/v1/appointments/appointments/vehicle_history/",
},

TIMESLOTS: {
  LIST: "/api/v1/appointments/time-slots/",
  DETAIL: (id: string) => `/api/v1/appointments/time-slots/${id}/`,
  CREATE: "/api/v1/appointments/time-slots/",
  UPDATE: (id: string) => `/api/v1/appointments/time-slots/${id}/`,
  DELETE: (id: string) => `/api/v1/appointments/time-slots/${id}/`,
  BULK_CREATE: "/api/v1/appointments/time-slots/bulk_create/",
}
```

## File Structure

```
frontend/src/
├── services/
│   └── appointmentService.ts          # API service for appointment operations
├── components/
│   ├── Appointments/
│   │   ├── AppointmentList.tsx        # List view with filters
│   │   ├── CreateAppointmentForm.tsx  # Create new appointment form
│   │   ├── AppointmentDetails.tsx     # View appointment details
│   │   └── index.ts                   # Component exports
│   └── CustomerDashboard/
│       └── AppointmentsSection.tsx    # Customer's appointment view
├── pages/
│   └── AppointmentsPage.tsx           # Full appointments management page
├── types/
│   └── index.ts                       # TypeScript type definitions
└── utils/
    └── dateUtils.ts                   # Date/time formatting utilities
```

## Components

### 1. AppointmentList

**Location**: `src/components/Appointments/AppointmentList.tsx`

A comprehensive list view for viewing and managing appointments.

**Features**:

- Displays appointments in a table format
- Filtering by status, type, and date range
- Action menu for each appointment (view, edit, cancel)
- Status indicators with color coding
- Pagination support (if needed)

**Props**: None (standalone component)

**Usage**:

```tsx
import { AppointmentList } from "../components/Appointments";

<AppointmentList />;
```

### 2. CreateAppointmentForm

**Location**: `src/components/Appointments/CreateAppointmentForm.tsx`

A dialog form for creating new appointments.

**Features**:

- Select vehicle from customer's registered vehicles
- Choose appointment type (maintenance, repair, inspection, etc.)
- Date and time picker
- Duration selection
- Service description and customer notes
- Form validation

**Props**:

```typescript
interface CreateAppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: string;
}
```

**Usage**:

```tsx
import { CreateAppointmentForm } from "../components/Appointments";

<CreateAppointmentForm
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={handleSuccess}
  customerId={customerId}
/>;
```

### 3. AppointmentDetails

**Location**: `src/components/Appointments/AppointmentDetails.tsx`

A dialog for viewing detailed appointment information.

**Features**:

- Displays all appointment details
- Shows customer and vehicle information
- Employee assignment
- Service description and notes
- Appointment history timeline
- Status change log

**Props**:

```typescript
interface AppointmentDetailsProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
}
```

**Usage**:

```tsx
import { AppointmentDetails } from "../components/Appointments";

<AppointmentDetails
  open={isOpen}
  onClose={() => setIsOpen(false)}
  appointmentId={appointmentId}
/>;
```

### 4. AppointmentsSection

**Location**: `src/components/CustomerDashboard/AppointmentsSection.tsx`

Customer dashboard section for managing their own appointments.

**Features**:

- Displays customer's appointments
- Create new appointment button
- View appointment details
- Cancel appointments
- Reschedule appointments

**Props**: None

**Usage**:

```tsx
import AppointmentsSection from "../components/CustomerDashboard/AppointmentsSection";

<AppointmentsSection />;
```

### 5. AppointmentsPage

**Location**: `src/pages/AppointmentsPage.tsx`

Full page view for appointment management (Admin/Employee).

**Features**:

- Uses AppointmentList component
- Full page layout
- Suitable for admin/employee dashboards

**Props**: None

**Usage**:

```tsx
import AppointmentsPage from "../pages/AppointmentsPage";

// In your router
<Route path="/appointments" element={<AppointmentsPage />} />;
```

## Service Functions

### appointmentService.ts

All API calls are handled through the appointment service:

#### CRUD Operations

- `getAppointments(params?)` - Get all appointments with optional filters
- `getAppointmentById(id)` - Get a specific appointment
- `createAppointment(data)` - Create a new appointment
- `updateAppointment(id, data)` - Update an appointment
- `deleteAppointment(id)` - Delete an appointment

#### Status Management

- `confirmAppointment(id, data?)` - Confirm an appointment (Employee/Admin only)
- `startAppointment(id, data?)` - Start an appointment (Employee/Admin only)
- `completeAppointment(id, data?)` - Complete an appointment (Employee/Admin only)
- `cancelAppointment(id, data?)` - Cancel an appointment
- `rescheduleAppointment(id, data)` - Reschedule an appointment
- `assignEmployee(id, data)` - Assign employee to appointment (Employee/Admin only)

#### Query Operations

- `getAvailableSlots(startDate, endDate, duration)` - Get available time slots
- `getAppointmentStats()` - Get appointment statistics
- `getAppointmentHistory(id)` - Get appointment history
- `getCustomerAppointments(customerId)` - Get appointments for a customer
- `getEmployeeSchedule(employeeId)` - Get employee schedule
- `getVehicleHistory(vehicleId)` - Get vehicle service history

#### Time Slot Management

- `getTimeSlots(params?)` - Get all time slots
- `bulkCreateTimeSlots(startDate, endDate)` - Bulk create time slots (Employee/Admin only)

## TypeScript Types

### Appointment Types

```typescript
type AppointmentType =
  | "maintenance"
  | "repair"
  | "inspection"
  | "diagnostic"
  | "emergency";
type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

interface Appointment {
  id: string;
  customer_id: string;
  vehicle_id: string;
  assigned_employee_id?: string | null;
  appointment_type: AppointmentType;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  service_description?: string;
  customer_notes?: string;
  internal_notes?: string;
  estimated_cost?: number | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string | null;
  completed_at?: string | null;
  // Computed fields
  customer_name?: string;
  vehicle_details?: string;
  employee_name?: string;
  time_until_appointment?: string;
}
```

### Request Types

```typescript
interface CreateAppointmentData {
  customer_id: string;
  vehicle_id: string;
  appointment_type: AppointmentType;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes?: number;
  service_description?: string;
  customer_notes?: string;
  estimated_cost?: number;
}

interface UpdateAppointmentData {
  appointment_type?: AppointmentType;
  scheduled_date?: string;
  scheduled_time?: string;
  duration_minutes?: number;
  service_description?: string;
  customer_notes?: string;
  internal_notes?: string;
  estimated_cost?: number;
}

interface RescheduleAppointmentData {
  new_date: string;
  new_time: string;
  reason?: string;
}

interface AssignEmployeeData {
  employee_id: string;
}

interface StatusUpdateData {
  reason?: string;
}
```

## Utilities

### dateUtils.ts

Utility functions for date/time formatting:

- `formatDate(dateString)` - Format date to "MMM d, yyyy"
- `formatTime(timeString)` - Format time to "h:mm a"
- `formatDateTime(dateTimeString)` - Format datetime to "MMM d, yyyy h:mm a"
- `formatDuration(minutes)` - Format duration to human-readable format
- `getTodayDate()` - Get today's date in YYYY-MM-DD format
- `getDateDaysFromNow(days)` - Get date N days from now

## Features Implemented

### Customer Features

✅ View all appointments
✅ Create new appointments
✅ View appointment details
✅ Cancel appointments
✅ Reschedule appointments (UI ready, needs integration)
✅ Filter appointments by status and date

### Employee/Admin Features

✅ View all appointments with advanced filters
✅ Confirm appointments
✅ Start appointments
✅ Complete appointments
✅ Cancel appointments
✅ Assign employees to appointments (UI ready)
✅ View appointment history
✅ Get appointment statistics
✅ View employee schedules
✅ View vehicle service history
✅ Manage time slots

### Data Management

✅ Real-time data fetching from API
✅ Error handling and loading states
✅ Form validation
✅ Optimistic UI updates
✅ Cache management for related data (customers, vehicles, employees)

## Integration Requirements

### Nginx Configuration

Ensure the Nginx gateway is configured to route `/api/v1/appointments/` to the appointment service:

```nginx
location /api/v1/appointments/ {
    proxy_pass http://appointment-service:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Authorization $http_authorization;
}
```

### Authentication

All endpoints require JWT authentication. The token is automatically added to requests via the `apiClient` interceptor.

## Future Enhancements

- [ ] Real-time notifications for appointment updates
- [ ] Calendar view for appointments
- [ ] Drag-and-drop rescheduling
- [ ] Employee availability management
- [ ] Automated appointment reminders
- [ ] Integration with payment service for deposits
- [ ] SMS/Email confirmation system
- [ ] Recurring appointments
- [ ] Appointment templates
- [ ] Advanced search and filtering
- [ ] Export appointments to CSV/PDF
- [ ] Mobile-responsive improvements

## Testing

To test the appointment features:

1. Ensure the appointment service is running
2. Ensure Nginx is properly configured
3. Login as a customer or employee
4. Navigate to the appointments section
5. Test creating, viewing, and managing appointments

## Troubleshooting

### Common Issues

1. **"Failed to load appointments"**

   - Check if the appointment service is running
   - Verify Nginx routing configuration
   - Check JWT token validity

2. **"No vehicles available"**

   - Ensure customer has registered vehicles
   - Check vehicle service connectivity

3. **"Cannot create appointment"**
   - Verify all required fields are filled
   - Check customer_id is valid
   - Ensure time slot is available

## Support

For issues or questions, contact the development team or check the main ServEase documentation.
