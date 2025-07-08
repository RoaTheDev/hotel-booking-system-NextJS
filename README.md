# Hotel MVP - Page Structure & UI Routes

## 📁 Public Pages (No Authentication Required)

### `/` - Homepage
- **Hero section** with hotel images
- **Search form** (check-in, check-out, guests)
- **Featured room types** preview
- **About section** with hotel info
- **Contact information**

### `/rooms` - Room Listing
- **Room cards** with images, prices, amenities
- **Filter sidebar** (price range, amenities, room type)
- **Search results** based on dates/guests
- **"Book Now" buttons** → redirects to login if not authenticated

### `/rooms/[id]` - Room Detail
- **Room image gallery**
- **Room description** and specifications
- **Amenities list** with icons
- **Pricing information**
- **Availability calendar** view
- **Book Now form** (dates, guests)

### `/auth/login` - Login Page
- **Email/password form**
- **"Remember me" checkbox**
- **Link to register**
- **Admin login** (same form, role-based redirect)

### `/auth/register` - Registration Page
- **User details form** (name, email, phone)
- **Password requirements**
- **Terms acceptance**
- **Link to login**

---

## 🔒 Guest Protected Pages (GUEST Role)

### `/dashboard` - Guest Dashboard
- **Welcome message** with user name
- **Current bookings** (confirmed, upcoming)
- **Past bookings** history
- **Quick actions** (new booking, profile)

### `/booking/search` - Booking Search
- **Advanced search form** with date picker
- **Real-time availability** checking
- **Room comparison** tool
- **Filter by amenities**

### `/booking/[roomId]` - Booking Form
- **Room summary** with selected dates
- **Guest information** form
- **Special requests** text area
- **Price breakdown** (taxes, fees)
- **Payment section** (Stripe integration)

### `/booking/confirmation/[bookingId]` - Booking Confirmation
- **Booking details** summary
- **Confirmation number**
- **Payment receipt**
- **Hotel contact** information
- **Calendar add** buttons

### `/bookings` - My Bookings
- **Booking history** table/cards
- **Filter by status** (upcoming, past, cancelled)
- **Booking details** expandable
- **Cancel booking** option (with policies)

### `/bookings/[id]` - Booking Details
- **Complete booking** information
- **Room details** and amenities
- **Cancellation policy**
- **Contact hotel** option
- **Modify booking** (if policy allows)

### `/profile` - User Profile
- **Personal information** form
- **Password change** section
- **Booking preferences**
- **Delete account** option

---

## 🛡️ Admin Protected Pages (ADMIN Role)

### `/admin` - Admin Dashboard
- **Key metrics** (occupancy, revenue, bookings)
- **Today's check-ins/check-outs**
- **Recent bookings** list
- **Quick actions** (add room, view calendar)

### `/admin/rooms` - Room Management
- **Room list** with status indicators
- **Add new room** button
- **Edit/delete** actions
- **Room availability** toggle
- **Bulk actions** (maintenance mode)

### `/admin/rooms/add` - Add Room
- **Room details** form
- **Room type** selection
- **Amenities** checkboxes
- **Upload images** section
- **Pricing** settings

### `/admin/rooms/[id]/edit` - Edit Room
- **Pre-populated** room form
- **Image management** (add/remove)
- **Availability** settings
- **Maintenance** scheduling

### `/admin/bookings` - Booking Management
- **All bookings** table
- **Filter by status/date**
- **Search by guest** name/email
- **Booking actions** (confirm, cancel, modify)
- **Export bookings** (CSV)

### `/admin/bookings/[id]` - Booking Details (Admin)
- **Complete booking** information
- **Guest details** and contact
- **Payment status** and history
- **Admin notes** section
- **Modify booking** capabilities

### `/admin/availability` - Room Availability Calendar
- **Calendar view** (monthly/weekly)
- **Room availability** grid
- **Block dates** for maintenance
- **Bulk availability** updates

### `/admin/amenities` - Amenity Management
- **Amenities list** with usage count
- **Add new amenity** form
- **Edit/delete** amenities
- **Icon selection** for UI

### `/admin/users` - User Management
- **User list** with roles
- **Search users** by email/name
- **Change user roles**
- **View user** booking history

---

## 📱 Additional Pages

### `/404` - Not Found
- **Custom 404** page
- **Search functionality**
- **Popular rooms** suggestions
- **Back to home** button

### `/500` - Server Error
- **Friendly error** message
- **Contact support** information
- **Try again** button

### `/booking/cancelled` - Booking Cancelled
- **Cancellation confirmation**
- **Refund information**
- **New booking** suggestions

### `/maintenance` - Maintenance Mode
- **Maintenance message**
- **Expected back** time
- **Contact information**

---

## 🎯 MVP Priority (Build First)

### Phase 1 (Core MVP):
1. `/` - Homepage
2. `/rooms` - Room listing
3. `/rooms/[id]` - Room details
4. `/auth/login` & `/auth/register`
5. `/booking/[roomId]` - Booking form
6. `/booking/confirmation/[bookingId]`

### Phase 2 (User Management):
7. `/dashboard` - Guest dashboard
8. `/bookings` - My bookings
9. `/profile` - User profile

### Phase 3 (Admin Features):
10. `/admin` - Admin dashboard
11. `/admin/rooms` - Room management
12. `/admin/bookings` - Booking management

This structure gives you a complete hotel booking system while keeping the MVP focused on essential features first!