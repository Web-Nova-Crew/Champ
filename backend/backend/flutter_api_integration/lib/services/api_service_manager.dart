import 'auth_service.dart';
import 'property_service.dart';
import 'user_service.dart';
import 'booking_service.dart';
import 'favorites_service.dart';
import 'chat_service.dart';
import 'otp_service.dart';
import 'dio_service.dart';
import 'http_service.dart';

/// Central API Service Manager
/// Provides easy access to all API services
class ApiServiceManager {
  static ApiServiceManager? _instance;
  
  ApiServiceManager._internal();
  
  static ApiServiceManager get instance {
    _instance ??= ApiServiceManager._internal();
    return _instance!;
  }
  
  // Service instances
  AuthService get auth => AuthService.instance;
  PropertyService get property => PropertyService.instance;
  UserService get user => UserService.instance;
  BookingService get booking => BookingService.instance;
  FavoritesService get favorites => FavoritesService.instance;
  ChatService get chat => ChatService.instance;
  OtpService get otp => OtpService.instance;
  
  // Network service instances
  DioService get dio => DioService.instance;
  HttpService get http => HttpService.instance;
  
  /// Initialize all services
  /// Call this in your main.dart before runApp()
  Future<void> initialize() async {
    await auth.initialize();
  }
  
  /// Set authentication token for all services
  void setAuthToken(String token) {
    dio.setAuthToken(token);
    http.setAuthToken(token);
  }
  
  /// Clear authentication token from all services
  void clearAuthToken() {
    dio.clearAuthToken();
    http.clearAuthToken();
  }
  
  /// Dispose all services
  void dispose() {
    http.dispose();
  }
}

/// Extension for easy access in your app
extension ApiServiceExtension on ApiServiceManager {
  // Quick access methods
  
  /// Login user and set auth token
  Future<void> loginAndSetToken(String email, String password) async {
    final response = await auth.login(email: email, password: password);
    if (response.isSuccess && response.data != null) {
      setAuthToken(response.data!.session.accessToken);
    }
  }
  
  /// Logout user and clear auth token
  Future<void> logoutAndClearToken() async {
    await auth.logout();
    clearAuthToken();
  }
  
  /// Check if user is authenticated
  Future<bool> isAuthenticated() async {
    return await auth.isLoggedIn();
  }
}
