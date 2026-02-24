// ignore_for_file: dangling_library_doc_comments

/// Configuration Service
/// 
/// Centralized configuration for app settings
/// Estato - Real Estate App for Lucknow

class ConfigService {
  // App Configuration
  static const String appName = 'Estato';
  static const String appVersion = '1.0.0';
  static const String appTagline = 'Your Home, Our Priority';
  static const String supportEmail = 'support@estatoprop.com';
  static const String supportPhone = '+91 9872364476';
  
  // App Logo
  static const String appLogo = 'assets/icons/Estato Logo.png';
  
  // Backend API Configuration
  static const String apiBaseUrl = 'https://champ-y6eg.onrender.com/api';
  
  // Feature Flags
  static const bool enableChat = true;
  static const bool enableBookings = true;
  static const bool enableNotifications = true;
  
  // API Configuration
  static const int apiTimeoutSeconds = 30;
  static const int maxRetryAttempts = 3;
  
  // Image Configuration
  static const int maxImageSizeMB = 5;
  static const List<String> allowedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Location (Lucknow focused)
  static const String defaultCity = 'Lucknow';
  static const String defaultState = 'Uttar Pradesh';
  static const String defaultCountry = 'India';
}

