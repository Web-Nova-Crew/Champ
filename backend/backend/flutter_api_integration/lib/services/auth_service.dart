import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'dio_service.dart';
import 'api_constants.dart';
import '../models/api_response.dart';
import '../models/user_model.dart';
import '../models/auth_models.dart';

class AuthService {
  static AuthService? _instance;
  final DioService _dioService = DioService.instance;
  
  AuthService._internal();
  
  static AuthService get instance {
    _instance ??= AuthService._internal();
    return _instance!;
  }
  
  // Storage keys
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _refreshTokenKey = 'refresh_token';
  
  // Register new user
  Future<ApiResponse<AuthResponse>> register({
    required String email,
    required String password,
    required String name,
    required String phone,
    required String userType, // buyer, seller, agent
  }) async {
    final data = {
      'email': email,
      'password': password,
      'name': name,
      'phone': phone,
      'userType': userType,
    };
    
    final response = await _dioService.post<Map<String, dynamic>>(
      '/auth/register',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final authResponse = AuthResponse.fromJson(response.data!);
      await _saveAuthData(authResponse);
      return ApiResponse.success(authResponse, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Registration failed');
  }
  
  // Login user
  Future<ApiResponse<AuthResponse>> login({
    required String email,
    required String password,
  }) async {
    final data = {
      'email': email,
      'password': password,
    };
    
    final response = await _dioService.post<Map<String, dynamic>>(
      '/auth/login',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final authResponse = AuthResponse.fromJson(response.data!);
      await _saveAuthData(authResponse);
      _dioService.setAuthToken(authResponse.session.accessToken);
      return ApiResponse.success(authResponse, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Login failed');
  }
  
  // Logout user
  Future<ApiResponse<void>> logout() async {
    final response = await _dioService.post<void>('/auth/logout');
    
    await _clearAuthData();
    _dioService.clearAuthToken();
    
    return response;
  }
  
  // Get current user
  Future<ApiResponse<UserModel>> getCurrentUser() async {
    final response = await _dioService.get<Map<String, dynamic>>(
      '/auth/me',
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final user = UserModel.fromJson(response.data!);
      await _saveUserData(user);
      return ApiResponse.success(user, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to get user data');
  }
  
  // Forgot password
  Future<ApiResponse<void>> forgotPassword({required String email}) async {
    final data = {'email': email};
    
    return await _dioService.post<void>(
      '/auth/forgot-password',
      data: data,
    );
  }
  
  // Reset password
  Future<ApiResponse<void>> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    final data = {
      'token': token,
      'newPassword': newPassword,
    };
    
    return await _dioService.post<void>(
      '/auth/reset-password',
      data: data,
    );
  }
  
  // Refresh token
  Future<ApiResponse<AuthResponse>> refreshToken() async {
    final refreshToken = await _getRefreshToken();
    if (refreshToken == null) {
      return ApiResponse.error('No refresh token available');
    }
    
    final data = {'refreshToken': refreshToken};
    
    final response = await _dioService.post<Map<String, dynamic>>(
      '/auth/refresh',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final authResponse = AuthResponse.fromJson(response.data!);
      await _saveAuthData(authResponse);
      _dioService.setAuthToken(authResponse.session.accessToken);
      return ApiResponse.success(authResponse, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Token refresh failed');
  }
  
  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getStoredToken();
    return token != null && token.isNotEmpty;
  }
  
  // Get stored token
  Future<String?> getStoredToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }
  
  // Get stored user data
  Future<UserModel?> getStoredUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      return UserModel.fromJson(jsonDecode(userJson));
    }
    return null;
  }
  
  // Private methods
  Future<void> _saveAuthData(AuthResponse authResponse) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, authResponse.session.accessToken);
    if (authResponse.session.refreshToken != null) {
      await prefs.setString(_refreshTokenKey, authResponse.session.refreshToken!);
    }
    await _saveUserData(authResponse.user);
  }
  
  Future<void> _saveUserData(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }
  
  Future<void> _clearAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    await prefs.remove(_refreshTokenKey);
  }
  
  Future<String?> _getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_refreshTokenKey);
  }
  
  // Initialize auth service (call this in main.dart)
  Future<void> initialize() async {
    final token = await getStoredToken();
    if (token != null && token.isNotEmpty) {
      _dioService.setAuthToken(token);
    }
  }
}
