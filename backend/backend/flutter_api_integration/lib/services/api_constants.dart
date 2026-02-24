class ApiConstants {
  // Base URLs
  static const String baseUrl = 'https://champ-y6eg.onrender.com/api';
  static const String healthUrl = 'https://champ-y6eg.onrender.com/health';
  
  // Authentication Endpoints
  static const String authRegister = '$baseUrl/auth/register';
  static const String authLogin = '$baseUrl/auth/login';
  static const String authLogout = '$baseUrl/auth/logout';
  static const String authMe = '$baseUrl/auth/me';
  static const String authForgotPassword = '$baseUrl/auth/forgot-password';
  static const String authResetPassword = '$baseUrl/auth/reset-password';
  static const String authRefresh = '$baseUrl/auth/refresh';
  
  // User Management Endpoints
  static const String userProfile = '$baseUrl/users/profile';
  static const String userAvatar = '$baseUrl/users/avatar';
  static const String userChangePassword = '$baseUrl/users/change-password';
  
  // Property Endpoints
  static const String properties = '$baseUrl/properties';
  static String propertyById(String id) => '$baseUrl/properties/$id';
  static String similarProperties(String id) => '$baseUrl/properties/$id/similar';
  
  // Favorites Endpoints
  static const String favorites = '$baseUrl/favorites';
  static String removeFavorite(String propertyId) => '$baseUrl/favorites/$propertyId';
  
  // Booking Endpoints
  static const String bookings = '$baseUrl/bookings';
  static String bookingById(String id) => '$baseUrl/bookings/$id';
  
  // Chat Endpoints
  static const String chats = '$baseUrl/chats';
  static String chatMessages(String chatId) => '$baseUrl/chats/$chatId/messages';
  static String sendMessage(String chatId) => '$baseUrl/chats/$chatId/messages';
  
  // Notification Endpoints
  static const String notifications = '$baseUrl/notifications';
  static String markNotificationRead(String id) => '$baseUrl/notifications/$id/read';
  
  // OTP Endpoints
  static const String otpSend = '$baseUrl/otp/send';
  static const String otpVerify = '$baseUrl/otp/verify';
  static const String otpResend = '$baseUrl/otp/resend';
  
  // Payment Endpoints
  static const String paymentCreate = '$baseUrl/payments/create';
  static const String paymentVerify = '$baseUrl/payments/verify';
  static const String paymentHistory = '$baseUrl/payments/history';
  
  // Admin Endpoints
  static const String adminDashboard = '$baseUrl/admin/dashboard';
  static const String adminUsers = '$baseUrl/admin/users';
  static const String adminProperties = '$baseUrl/admin/properties';
  static const String adminAgents = '$baseUrl/admin/agents';
  static const String adminReports = '$baseUrl/admin/reports';
  static String adminApproveProperty(String id) => '$baseUrl/admin/properties/$id/approve';
  static String adminRejectProperty(String id) => '$baseUrl/admin/properties/$id/reject';
  static String adminApproveAgent(String id) => '$baseUrl/admin/agents/$id/approve';
  static String adminVerifyUser(String id) => '$baseUrl/admin/users/$id/verify';
  static String adminResolveReport(String id) => '$baseUrl/admin/reports/$id/resolve';
  
  // Request Headers
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  static Map<String, String> authHeaders(String token) => {
    ...defaultHeaders,
    'Authorization': 'Bearer $token',
  };
  
  // Timeout Configuration
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);
}
