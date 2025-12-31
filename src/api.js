// API Module - Updated with review and host review functions
const API_URL = 'https://geoshops-production.up.railway.app/api';

export const fetchProperties = async (department) => {
  try {
    // Use the new generic endpoint for all departments
    const response = await fetch(`${API_URL}/properties/${department}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

export const fetchAllProperties = async () => {
  try {
    const response = await fetch(`${API_URL}/properties/all`);
    if (!response.ok) throw new Error('Failed to fetch all properties');
    return await response.json();
  } catch (error) {
    console.error('Error fetching all properties:', error);
    throw error;
  }
};

export const fetchAdminProperties = async () => {
  try {
    const response = await fetch(`${API_URL}/properties/admin/all`);
    if (!response.ok) throw new Error('Failed to fetch admin properties');
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin properties:', error);
    throw error;
  }
};

export const createProperty = async (department, propertyData) => {
  try {
    // Use the new generic properties endpoint
    const response = await fetch(`${API_URL}/properties/${department}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.details || 'Failed to create property');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

export const createBooking = async (department, bookingData) => {
  const endpointMap = {
    'Hotel': '/bookings/hotel',
    'Salon': '/bookings/salon',
    'Hospital': '/bookings/hospital',
    'Cab': '/bookings/cab'
  };

  let endpoint = endpointMap[department];

  // If no specific endpoint, use the generic one
  if (!endpoint) {
    endpoint = `/bookings/${department}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Failed to create booking');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const fetchBookings = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/bookings/users/${userId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const fetchHostBookings = async (hostId) => {
  try {
    const response = await fetch(`${API_URL}/bookings/hosts/${hostId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching host bookings:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const registerHost = async (hostData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register/host`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hostData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error registering host:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Invalid credentials');
    return await response.json();
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const loginHost = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login/host`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Invalid credentials');
    return await response.json();
  } catch (error) {
    console.error('Error logging in host:', error);
    throw error;
  }
};

export const loginAdmin = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Invalid credentials');
    return await response.json();
  } catch (error) {
    console.error('Error logging in admin:', error);
    throw error;
  }
};

export const sendOtp = async (otpData) => {
  try {
    const response = await fetch(`${API_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(otpData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const loginWithOtp = async (otpCredentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/otp/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(otpCredentials)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Invalid or expired OTP');
    return data;
  } catch (error) {
    console.error('Error logging in with OTP:', error);
    throw error;
  }
};

// Fetch all hosts (for admin)
export const fetchHosts = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/hosts`);
    if (!response.ok) throw new Error('Failed to fetch hosts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching hosts:', error);
    throw error;
  }
};

// Fetch single host by ID
export const fetchHostById = async (hostId) => {
  try {
    const response = await fetch(`${API_URL}/hosts/${hostId}`);
    if (!response.ok) throw new Error('Failed to fetch host');
    return await response.json();
  } catch (error) {
    console.error('Error fetching host:', error);
    throw error;
  }
};

// Fetch all properties for a specific host
export const fetchHostProperties = async (hostId) => {
  try {
    const response = await fetch(`${API_URL}/properties/host/${hostId}`);
    if (!response.ok) throw new Error('Failed to fetch host properties');
    return await response.json();
  } catch (error) {
    console.error('Error fetching host properties:', error);
    throw error;
  }
};

// Fetch all bookings (for admin)
export const fetchAllBookings = async () => {
  try {
    const response = await fetch(`${API_URL}/bookings/admin`);
    if (!response.ok) throw new Error('Failed to fetch all bookings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

// Fetch all users (for admin)
export const fetchAllUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Fetch dashboard statistics (for admin)
export const fetchDashboardStats = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/stats`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

// Fetch all users (Admin)
export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (department, bookingId, status) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${department}/${bookingId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to update booking status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Delete booking
export const deleteBooking = async (department, bookingId) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${department}/${bookingId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete booking');
    return await response.json();
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

// Update property status
export const updatePropertyStatus = async (department, propertyId, status) => {
  try {
    const response = await fetch(`${API_URL}/properties/${department}/${propertyId}/action`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: status })
    });
    if (!response.ok) throw new Error('Failed to update property status');
    return await response.json();
  } catch (error) {
    console.error('Error updating property status:', error);
    throw error;
  }
};

// Delete property
export const deleteProperty = async (department, propertyId) => {
  try {
    const response = await fetch(`${API_URL}/properties/${department}/${propertyId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete property');
    return await response.json();
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// Update property
export const updateProperty = async (department, propertyId, propertyData) => {
  try {
    const response = await fetch(`${API_URL}/properties/${department}/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to update property');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};


// Departments
// Departments
export const fetchDepartments = async (includeInactive = false) => {
  try {
    const query = includeInactive ? '?includeInactive=true' : '';
    const response = await fetch(`${API_URL}/departments${query}`);
    if (!response.ok) throw new Error('Failed to fetch departments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

export const createDepartment = async (data) => {
  try {
    const response = await fetch(`${API_URL}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create department');
    return await response.json();
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

export const updateDepartmentStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_URL}/departments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update department status');
    return await response.json();
  } catch (error) {
    console.error('Error updating department status:', error);
    throw error;
  }
};

// Offers
export const fetchOffers = async (userId = null) => {
  try {
    const query = userId ? `?userId=${userId}` : '';
    const response = await fetch(`${API_URL}/offers${query}`);
    if (!response.ok) throw new Error('Failed to fetch offers');
    return await response.json();
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
};

export const fetchActiveOffers = async (userId = null) => {
  try {
    const query = userId ? `?userId=${userId}` : '';
    const response = await fetch(`${API_URL}/offers/active${query}`);
    if (!response.ok) throw new Error('Failed to fetch active offers');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active offers:', error);
    throw error;
  }
};

export const createOffer = async (data) => {
  try {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_URL}/offers`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create offer');
    return await response.json();
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

export const updateOffer = async (id, data) => {
  try {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_URL}/offers/${id}`, {
      method: 'PUT',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update offer');
    return await response.json();
  } catch (error) {
    console.error('Error updating offer:', error);
    throw error;
  }
};

export const deleteOffer = async (id) => {
  try {
    const response = await fetch(`${API_URL}/offers/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete offer');
    return await response.json();
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};

// Notifications
export const fetchNotifications = async (userId, type = 'USER') => {
  try {
    const response = await fetch(`${API_URL}/notifications/${userId}?type=${type}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationRead = async (id) => {
  try {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Enhanced User/Host
export const updateUserProfile = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update user profile');
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateHostProfile = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/auth/hosts/${id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update host profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating host profile:', error);
    throw error;
  }
};

export const updateHostStatus = async (id, action) => {
  try {
    const response = await fetch(`${API_URL}/hosts/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (!response.ok) throw new Error('Failed to update host status');
    return await response.json();
  } catch (error) {
    console.error('Error updating host status:', error);
    throw error;
  }
};

// ---------- Coupons API ----------
export const fetchCoupons = async (userId = null) => {
  try {
    const query = userId ? `?userId=${userId}` : '';
    const response = await fetch(`${API_URL}/coupons${query}`);
    if (!response.ok) throw new Error('Failed to fetch coupons');
    return await response.json();
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

export const createCoupon = async (couponData) => {
  try {
    const response = await fetch(`${API_URL}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    if (!response.ok) throw new Error('Failed to create coupon');
    return await response.json();
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

export const updateCoupon = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update coupon');
    return await response.json();
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

export const deleteCoupon = async (id) => {
  try {
    const response = await fetch(`${API_URL}/coupons/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete coupon');
    return await response.json();
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

export const validateCoupon = async (code, userId = null, propertyId = null) => {
  try {
    const body = { code };
    if (userId) body.userId = userId;
    if (propertyId) body.propertyId = propertyId;

    const response = await fetch(`${API_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return { valid: false, message: data.error || 'Validation failed' };
    }

    return data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

// ---------- Subscriptions API ----------
export const fetchSubscriptions = async () => {
  try {
    const response = await fetch(`${API_URL}/subscriptions`);
    if (!response.ok) throw new Error('Failed to fetch subscriptions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

export const fetchHostSubscription = async (hostId) => {
  try {
    const response = await fetch(`${API_URL}/host/${hostId}/subscription`);
    if (!response.ok) throw new Error('Failed to fetch host subscription');
    return await response.json();
  } catch (error) {
    // If 404, it might mean no subscription, just return null or rethrow?
    // Based on HostSubscriptionDetails.jsx, it returns data or error.
    console.error('Error fetching host subscription:', error);
    throw error;
  }
};

export const createSubscription = async (data) => {
  try {
    const response = await fetch(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create subscription');
    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update subscription');
    return await response.json();
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const deleteSubscription = async (id) => {
  try {
    const response = await fetch(`${API_URL}/subscriptions/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete subscription');
    return await response.json();
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

export const updateSubscriptionStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_URL}/subscriptions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update subscription status');
    return await response.json();
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

// ---------- Membership Templates API ----------
export const fetchMembershipTemplates = async () => {
  try {
    const response = await fetch(`${API_URL}/membership/templates`);
    if (!response.ok) throw new Error('Failed to fetch membership templates');
    return await response.json();
  } catch (error) {
    console.error('Error fetching membership templates:', error);
    throw error;
  }
};

export const fetchHostMembershipTemplates = async (hostId) => {
  try {
    const response = await fetch(`${API_URL}/host/${hostId}/membership-templates`);
    if (!response.ok) throw new Error('Failed to fetch host membership templates');
    return await response.json();
  } catch (error) {
    console.error('Error fetching host membership templates:', error);
    throw error;
  }
};

export const fetchAllMembershipCardDesigns = async () => {
  try {
    const response = await fetch(`${API_URL}/membership/cards/designs/all`);
    if (!response.ok) throw new Error('Failed to fetch membership card designs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching membership card designs:', error);
    throw error;
  }
};

export const deleteMembershipCardDesign = async (id) => {
  try {
    const response = await fetch(`${API_URL}/membership/cards/designs/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete membership card design');
    return await response.json();
  } catch (error) {
    console.error('Error deleting membership card design:', error);
    throw error;
  }
};

export const createMembershipTemplate = async (data) => {
  try {
    const response = await fetch(`${API_URL}/host/membership-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create membership template');
    return await response.json();
  } catch (error) {



    throw error;
  }
};

// ---------- System Settings API ----------
export const fetchSystemSettings = async (department) => {
  try {
    const response = await fetch(`${API_URL}/system-settings/${department}`);
    if (!response.ok) throw new Error('Failed to fetch system settings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
};

export const saveSystemSettings = async (settings) => {
  try {
    const response = await fetch(`${API_URL}/system-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to save system settings');
    return await response.json();
  } catch (error) {
    console.error('Error saving system settings:', error);
    throw error;
  }
};



export const updateMembershipTemplate = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/host/membership-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update membership template');
    return await response.json();
  } catch (error) {
    console.error('Error updating membership template:', error);
    throw error;
  }
};

export const deleteMembershipTemplate = async (id) => {
  try {
    const response = await fetch(`${API_URL}/host/membership-templates/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete membership template');
    return await response.json();
  } catch (error) {
    console.error('Error deleting membership template:', error);
    throw error;
  }
};

// ---------- Support Queries API ----------
export const fetchUserQueries = async () => {
  try {
    const response = await fetch(`${API_URL}/support/user-queries`);
    if (!response.ok) throw new Error('Failed to fetch user queries');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user queries:', error);
    throw error;
  }
};

export const fetchHostQueries = async () => {
  try {
    const response = await fetch(`${API_URL}/support/host-queries`);
    if (!response.ok) throw new Error('Failed to fetch host queries');
    return await response.json();
  } catch (error) {
    console.error('Error fetching host queries:', error);
    throw error;
  }
};

export const replyToQuery = async (id, adminId, reply) => {
  try {
    const response = await fetch(`${API_URL}/support/queries/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, reply })
    });
    if (!response.ok) throw new Error('Failed to reply to query');
    return await response.json();
  } catch (error) {
    console.error('Error replying to query:', error);
    throw error;
  }
};

export const fetchTicketMessages = async (ticketId) => {
  try {
    const response = await fetch(`${API_URL}/support/queries/${ticketId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch ticket messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    throw error;
  }
};

export const sendSupportMessage = async (ticketId, messageData) => {
  try {
    const response = await fetch(`${API_URL}/support/queries/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const submitSupportQuery = async (queryData) => {
  try {
    const response = await fetch(`${API_URL}/support/queries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryData)
    });

    // Try to parse JSON response. If successful, use its error message.
    // If parsing fails (e.g. 404 HTML), throw generic error.
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMessage = data && (data.message || data.error)
        ? (data.message || data.error)
        : `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data; // Return successfully parsed data
  } catch (error) {
    console.error('Error submitting query:', error);
    throw error; // Re-throw to be caught by component
  }
};

export const fetchUserTickets = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/support/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user tickets');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

export const fetchHostTickets = async (hostId) => {
  try {
    const response = await fetch(`${API_URL}/support/host/${hostId}`);
    if (!response.ok) throw new Error('Failed to fetch host tickets');
    return await response.json();
  } catch (error) {
    console.error('Error fetching host tickets:', error);
    throw error;
  }
};

// ---------- Membership Cards API ----------
export const fetchHostDesigns = async (hostId) => {
  try {
    const response = await fetch(`${API_URL}/hosts/${hostId}/membership-cards/designs`);
    if (!response.ok) throw new Error('Failed to fetch host designs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching host designs:', error);
    throw error;
  }
};


export const createMembershipRequest = async (data) => {
  try {
    const response = await fetch(`${API_URL}/membership/cards/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create membership request');
    return await response.json();
  } catch (error) {
    console.error('Error creating membership request:', error);
    throw error;
  }
};

export const fetchUserMembershipRequests = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/membership/user/${userId}/requests`);
    if (!response.ok) throw new Error('Failed to fetch user membership requests');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user membership requests:', error);
    throw error;
  }
};

export const fetchHostMembershipRequests = async (hostId) => {
  try {
    const response = await fetch(`${API_URL}/membership/host/${hostId}/requests`);
    if (!response.ok) throw new Error('Failed to fetch host membership requests');
    return await response.json();
  } catch (error) {
    console.error('Error fetching host membership requests:', error);
    throw error;
  }
};

export const fetchHostCardDesigns = async (hostId) => {
  try {
    const response = await fetch(`${API_URL}/membership/host/${hostId}/cards/designs`);
    if (!response.ok) throw new Error('Failed to fetch host card designs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching host card designs:', error);
    throw error;
  }
};

export const submitMembershipPayment = async (requestId, paymentData) => {
  try {
    const response = await fetch(`${API_URL}/membership/cards/request/${requestId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit membership payment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error submitting membership payment:', error);
    throw error;
  }
};

// ---------- Subscription Payment Requests API ----------
export const fetchPendingSubscriptionPayments = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/subscription-payments/pending`);
    if (!response.ok) throw new Error('Failed to fetch pending subscription payments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending subscription payments:', error);
    throw error;
  }
};

export const fetchAllSubscriptionPayments = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/subscription-payments`);
    if (!response.ok) throw new Error('Failed to fetch subscription payments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription payments:', error);
    throw error;
  }
};

export const approveSubscriptionPayment = async (paymentId, adminId) => {
  try {
    const response = await fetch(`${API_URL}/admin/subscription-payments/${paymentId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId })
    });
    if (!response.ok) throw new Error('Failed to approve subscription payment');
    return await response.json();
  } catch (error) {
    console.error('Error approving subscription payment:', error);
    throw error;
  }
};

export const rejectSubscriptionPayment = async (paymentId, adminId) => {
  try {
    const response = await fetch(`${API_URL}/admin/subscription-payments/${paymentId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId })
    });
    if (!response.ok) throw new Error('Failed to reject subscription payment');
    return await response.json();
  } catch (error) {
    console.error('Error rejecting subscription payment:', error);
  }
};

// ---------- Reviews API ----------
export const createReview = async (data) => {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    // Check if response has content
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Server error: Expected JSON response but got ${contentType}. The backend may not have loaded the Review controller. Please restart the backend server.`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const fetchBookingReview = async (bookingId) => {
  try {
    const response = await fetch(`${API_URL}/reviews/booking/${bookingId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, message: 'No review found' };
      }
      throw new Error('Failed to fetch review');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching booking review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId, data) => {
  try {
    const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update review');
    return await response.json();
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const createReviewReply = async (reviewId, replyData) => {
  try {
    const response = await fetch(`${API_URL}/reviews/${reviewId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replyData)
    });
    if (!response.ok) throw new Error('Failed to create review reply');
    return await response.json();
  } catch (error) {
    console.error('Error creating review reply:', error);
    throw error;
  }
};

export const fetchReviewReplies = async (reviewId) => {
  try {
    const response = await fetch(`${API_URL}/reviews/${reviewId}/replies`);
    if (!response.ok) throw new Error('Failed to fetch review replies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching review replies:', error);
    throw error;
  }
};

export const fetchHostReviews = async (hostId) => {
  try {
    const response = await fetch(`${API_URL}/reviews/host/${hostId}`);
    if (!response.ok) throw new Error('Failed to fetch host reviews');
    return await response.json();
  } catch (error) {
    console.error('Error fetching host reviews:', error);
    throw error;
  }
};

export const resolveMapUrl = async (url) => {
  try {
    const response = await fetch(`${API_URL}/properties/resolve-url?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Failed to resolve URL');
    return await response.json();
  } catch (error) {
    console.error('Error resolving map URL:', error);
    throw error;
  }
};

// ---------- Property Images API ----------
export const fetchPropertyImages = async (department, propertyId) => {
  try {
    const response = await fetch(`${API_URL}/properties/${department}/${propertyId}/images`);
    if (!response.ok) throw new Error('Failed to fetch property images');
    return await response.json();
  } catch (error) {
    console.error('Error fetching property images:', error);
    throw error;
  }
};

export const addPropertyImages = async (department, propertyId, images) => {
  try {
    const response = await fetch(`${API_URL}/properties/${department}/${propertyId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images })
    });
    if (!response.ok) throw new Error('Failed to add property images');
    return await response.json();
  } catch (error) {
    console.error('Error adding property images:', error);
    throw error;
  }
};

export const deletePropertyImage = async (department, propertyId, imageId) => {
  try {
    const response = await fetch(`${API_URL}/properties/${department}/${propertyId}/images/${imageId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete property image');
    return await response.json();
  } catch (error) {
    console.error('Error deleting property image:', error);
    throw error;
  }
};


// Upload file (for receipts/images)
export const uploadFile = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/upload/images`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload file');
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};


// ================================================
// BOOKING PAYMENT API FUNCTIONS
// ================================================

// Submit booking payment
export const submitBookingPayment = async (bookingId, paymentData) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to submit payment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error submitting payment:', error);
    throw error;
  }
};

// Get booking payment details
export const getBookingPayment = async (bookingId) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/payment`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to get payment details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting payment:', error);
    throw error;
  }
};

// Verify booking payment (host)
export const verifyBookingPayment = async (bookingId, verificationData) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/payment/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to verify payment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Reject booking payment (host)
export const rejectBookingPayment = async (bookingId, rejectionData) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/payment/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rejectionData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to reject payment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error rejecting payment:', error);
    throw error;
  }
};

// ---------- Specialists API ----------
export const fetchSpecialistsByProperty = async (propertyId) => {
  try {
    const response = await fetch(`${API_URL}/specialists/property/${propertyId}`);
    if (!response.ok) throw new Error('Failed to fetch specialists');
    return await response.json();
  } catch (error) {
    console.error('Error fetching specialists:', error);
    throw error;
  }
};

export const addSpecialist = async (specialistData) => {
  try {
    const response = await fetch(`${API_URL}/specialists/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(specialistData)
    });
    if (!response.ok) throw new Error('Failed to add specialist');
    return await response.json();
  } catch (error) {
    console.error('Error adding specialist:', error);
    throw error;
  }
};

export const deleteSpecialist = async (id) => {
  try {
    const response = await fetch(`${API_URL}/specialists/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete specialist');
    return await response.json();
  } catch (error) {
    console.error('Error deleting specialist:', error);
    throw error;
  }
};


// ---------- Offered Services API ----------
export const fetchServicesByProperty = async (propertyId) => {
  try {
    const response = await fetch(`${API_URL}/offered-services/property/${propertyId}`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return await response.json();
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const addOfferedService = async (serviceData) => {
  try {
    const response = await fetch(`${API_URL}/offered-services/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData)
    });
    if (!response.ok) throw new Error('Failed to add service');
    return await response.json();
  } catch (error) {
    console.error('Error adding service:', error);
    throw error;
  }
};

export const deleteOfferedService = async (id) => {
  try {
    const response = await fetch(`${API_URL}/offered-services/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete service');
    return await response.json();
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};
