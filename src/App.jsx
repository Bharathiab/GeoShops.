import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./layouts.css";

// LOGIN & REGISTER
import SignIn from "./components/SignIn/SignIn";
import UserRegister from "./components/SignIn/UserRegister";
import UserLogin from "./components/SignIn/UserLogin";
import HostRegister from "./components/SignIn/HostRegister";
import HostLogin from "./components/SignIn/HostLogin";
import AdminLogin from "./components/SignIn/AdminLogin";

// DASHBOARDS
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import UserHome from "./pages/UserDashboard/UserHome";
import UserBookings from "./pages/UserDashboard/UserBookings";
import Support from "./pages/UserDashboard/Support";
import Membership from "./pages/UserDashboard/Membership";
import HostDashboard from "./pages/HostDashboard/HostDashboard";
import HostProperties from "./pages/HostDashboard/HostProperties";
import HostProfile from "./pages/HostDashboard/HostProfile";
import HostCouponsOffers from "./pages/HostDashboard/HostCouponsOffers";
import HostBookings from "./pages/HostDashboard/HostBookings";
import HostTodayArrivals from "./pages/HostDashboard/HostTodayArrivals";
import HostMembershipCards from "./pages/HostDashboard/HostMembershipCards";
import MembershipCardRequests from "./pages/HostDashboard/MembershipCardRequests";
import HostSubscription from "./pages/HostDashboard/HostSubscription";
import HostSubscriptionPlans from "./pages/HostDashboard/HostSubscriptionPlans";
import SubscriptionSelection from "./pages/HostDashboard/SubscriptionSelection";
import SubscriptionPayment from "./pages/HostDashboard/SubscriptionPayment";
import HostSubscriptionDetails from "./pages/HostDashboard/HostSubscriptionDetails";
import HostPropertyDetails from "./pages/HostDashboard/HostPropertyDetails";
import HostSupport from "./pages/HostDashboard/HostSupport";
import AdminDashboard from "./components/admin/AdminDashboard";

// USER BOOKING PAGES
import BookingSelection from "./pages/UserDashboard/BookingSelection";
import HospitalBooking from "./pages/UserDashboard/HospitalBooking";
import HotelBooking from "./pages/UserDashboard/HotelBooking";
import CabBooking from "./pages/UserDashboard/CabBooking";
import SalonBooking from "./pages/UserDashboard/SalonBooking";
import DynamicBooking from "./pages/UserDashboard/DynamicBooking";
import BookingPayment from "./pages/UserDashboard/BookingPayment";
import MembershipPayment from "./pages/UserDashboard/MembershipPayment";

// ADMIN SUB-PAGES
import AdminBookedHotels from "./pages/AdminDashboard/AdminBookedHotels";
import AdminHostsList from "./pages/AdminDashboard/AdminHostsList";
import AdminDepartments from "./pages/AdminDashboard/AdminDepartments";
import AdminHostProperties from "./pages/AdminDashboard/AdminHostProperties";
import AdminUsersList from "./pages/AdminDashboard/AdminUsersList";
import AdminOffers from "./pages/AdminDashboard/AdminOffers";
import AdminCoupons from "./pages/AdminDashboard/AdminCoupons";
import AdminSubscriptionList from "./pages/AdminDashboard/AdminSubscriptionList";
import AdminSubscriptionRequests from "./pages/AdminDashboard/AdminSubscriptionRequests";
import AdminMembershipList from "./pages/AdminDashboard/AdminMembershipList";
import AdminSystemSettings from "./pages/AdminDashboard/AdminSystemSettings";
import AdminTemplateManagement from "./pages/AdminDashboard/AdminTemplateManagement";
import AdminSupport from "./pages/AdminDashboard/AdminSupport";

import UserOffers from "./pages/UserDashboard/UserOffers";

import UserMembershipRequest from "./pages/UserDashboard/UserMembershipRequest";
import UserMembershipCards from "./pages/UserDashboard/UserMembershipCards";
import UserReviews from "./pages/UserDashboard/UserReviews";
import HostReviews from "./pages/HostDashboard/HostReviews";
import HostNotifications from "./pages/HostDashboard/HostNotifications";
import AdminNotifications from "./pages/AdminDashboard/AdminNotifications";
import GlobalNotificationHandler from "./components/common/GlobalNotificationHandler";
import AdminBookingDetails from "./pages/AdminDashboard/AdminBookingDetails";
import AdminPropertyDetails from "./pages/AdminDashboard/AdminPropertyDetails";
import AdminBranchRequests from "./pages/AdminDashboard/AdminBranchRequests";
import HostBookingDetailsPage from "./pages/HostDashboard/HostBookingDetailsPage";
import UserPropertyDetailsPage from "./pages/UserDashboard/UserPropertyDetailsPage";
import UserBookingPage from "./pages/UserDashboard/UserBookingPage";

function App() {
  return (
    <BrowserRouter>
      <GlobalNotificationHandler />
      <Routes>
        {/* ROLE SELECTION PAGE */}
        <Route path="/" element={<UserHome />} />

        {/* USER ROUTES */}
        <Route path="/user-register" element={<UserRegister />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user" element={<UserHome />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route
          path="/user/hotel"
          element={<UserDashboard department="Hotel" />}
        />
        <Route
          path="/user/hospital"
          element={<UserDashboard department="Hospital" />}
        />
        <Route
          path="/user/salon"
          element={<UserDashboard department="Salon" />}
        />
        <Route path="/user/cab" element={<UserDashboard department="Cab" />} />
        <Route path="/user/bookings" element={<UserBookings />} />
        <Route path="/user/support" element={<Support />} />
        <Route path="/user/membership" element={<Membership />} />
        <Route path="/user/membership-request" element={<UserMembershipRequest />} />
        <Route path="/user/membership-cards" element={<UserMembershipCards />} />
        <Route path="/user/reviews" element={<UserReviews />} />

        {/* NEW BOOKING ROUTES - Specific routes MUST come before dynamic route */}
        <Route path="/user/booking-selection" element={<BookingSelection />} />
        <Route path="/user/booking/hotel" element={<HotelBooking />} />
        <Route path="/user/booking/hospital" element={<HospitalBooking />} />
        <Route path="/user/booking/cab" element={<CabBooking />} />
        <Route path="/user/booking/salon" element={<SalonBooking />} />
        {/* Dynamic route for custom departments - catches all other /user/booking/* routes */}
        <Route path="/user/booking/:department" element={<DynamicBooking />} />
        <Route path="/user/booking-payment" element={<BookingPayment />} />
        <Route path="/user/membership-payment" element={<MembershipPayment />} />

        {/* HOST ROUTES */}
        <Route path="/host-register" element={<HostRegister />} />
        <Route path="/host-login" element={<HostLogin />} />
        <Route path="/host/dashboard" element={<HostDashboard />} />
        <Route path="/host-dashboard" element={<HostDashboard />} />
        <Route path="/host-dashboard/create-property" element={<HostDashboard />} />
        <Route path="/host/properties" element={<HostProperties />} />
        <Route path="/host/property/:id" element={<HostPropertyDetails />} />
        <Route path="/host/profile" element={<HostProfile />} />
        <Route path="/host/coupons-offers" element={<HostCouponsOffers />} />
        <Route path="/host/bookings" element={<HostBookings />} />
        <Route path="/host/today-arrivals" element={<HostTodayArrivals />} />
        <Route path="/host/reviews" element={<HostReviews />} />
        <Route path="/host/membership-cards" element={<HostMembershipCards />} />
        <Route path="/host/subscription" element={<SubscriptionSelection />} />
        <Route path="/host/subscription-payment" element={<SubscriptionPayment />} />
        <Route path="/host/subscription-plans" element={<HostSubscriptionPlans />} />
        <Route path="/host/subscription-details" element={<HostSubscriptionDetails />} />
        <Route path="/host/support" element={<HostSupport />} />
        <Route path="/host/notifications" element={<HostNotifications />} />

        <Route path="/host/membership-requests" element={<MembershipCardRequests />} />
        <Route path="/host/booking-details/:department/:id" element={<HostBookingDetailsPage />} />
        <Route path="/user/property-details/:department/:id" element={<UserPropertyDetailsPage />} />
        <Route path="/user/booking/:department/:id" element={<UserBookingPage />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/booked-hotels" element={<AdminBookedHotels />} />
        <Route path="/admin/hosts" element={<AdminHostsList />} />
        <Route
          path="/admin/host-properties"
          element={<AdminHostProperties />}
        />
        <Route path="/admin/branch-requests" element={<AdminBranchRequests />} />
        <Route path="/admin/property/:id" element={<AdminPropertyDetails />} />
        <Route path="/admin/departments" element={<AdminDepartments />} />
        <Route path="/admin/properties/:department" element={<AdminDepartments />} />
        <Route path="/admin/users" element={<AdminUsersList />} />
        <Route path="/admin/coupons" element={<AdminCoupons />} />
        <Route path="/admin/offers" element={<AdminOffers />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptionList />} />
        <Route path="/admin/subscription-requests" element={<AdminSubscriptionRequests />} />
        <Route path="/admin/memberships" element={<AdminMembershipList />} />
        <Route path="/admin/support" element={<AdminSupport />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/templates" element={<AdminTemplateManagement />} />
        <Route path="/admin/system-settings" element={<AdminSystemSettings />} />

        <Route path="/admin/bookings/:id" element={<AdminBookingDetails />} />
        <Route path="/user/offers" element={<UserOffers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
