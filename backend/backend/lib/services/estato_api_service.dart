import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import 'api_constants.dart';
import '../models/api_response.dart';
import '../models/user_model.dart';
import '../models/property_model.dart';

class EstatoApiService {
  static EstatoApiService? _instance;
  String? _authToken;
  
  EstatoApiService._internal();
  
  static EstatoApiService get instance {
    _instance ??= EstatoApiService._internal();
    return _instance!;
  }
  
  // Storage keys
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  
  Map<String, String> get _defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    if (_authToken != null) 'Authorization': 'Bearer $_authToken',
  };
  
  void _logRequest(String method, String url, Map<String, String> headers, dynamic body) {
    if (kDebugMode) {
      print('🚀 API REQUEST: $method $url');
      print('📤 Headers: $headers');
      if (body != null) {
        print('📤 Body: $body');
      }
    }
  }
  
  void _logResponse(http.Response response) {
    if (kDebugMode) {
      print('✅ API RESPONSE: ${response.statusCode} ${response.request?.url}');
      print('📥 Body: ${response.body}');
    }
  }
  
  void _logError(String method, String url, dynamic error) {
    if (kDebugMode) {
      print('❌ API ERROR: $method $url');
      print('❌ Error: $error');
    }
  }
  
  Future<ApiResponse<T>> _handleResponse<T>(
    http.Response response,
    T Function(dynamic)? fromJson,
  ) async {
    try {
      final statusCode = response.statusCode;
      
      if (statusCode >= 200 && statusCode < 300) {
        if (response.body.isEmpty) {
          return ApiResponse.success(null);
        }
        
        final jsonData = jsonDecode(response.body);
        
        if (jsonData is Map<String, dynamic>) {
          if (jsonData['success'] == true) {
            final responseData = jsonData['data'];
            if (fromJson != null && responseData != null) {
              try {
                final parsedData = fromJson(responseData);
                return ApiResponse.success(parsedData, jsonData['message']);
              } catch (e) {
                return ApiResponse.error('Failed to parse response: ${e.toString()}');
              }
            } else {
              return ApiResponse.success(responseData as T?, jsonData['message']);
            }
          } else {
            return ApiResponse.error(jsonData['error'] ?? 'Unknown error occurred', statusCode);
          }
        } else {
          return ApiResponse.success(jsonData as T?, 'Success');
        }
      } else {
        String errorMessage = 'HTTP $statusCode';
        
        try {
          final jsonData = jsonDecode(response.body);
          if (jsonData is Map<String, dynamic>) {
            errorMessage = jsonData['error'] ?? jsonData['message'] ?? errorMessage;
          }
        } catch (e) {
          errorMessage = _getStatusCodeMessage(statusCode);
        }
        
        return ApiResponse.error(errorMessage, statusCode);
      }
    } catch (e) {
      return ApiResponse.error('Failed to process response: ${e.toString()}');
    }
  }
  
  String _getStatusCodeMessage(int statusCode) {
    switch (statusCode) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Forbidden. You don\'t have permission.';
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'HTTP $statusCode error occurred.';
    }
  }
  
  // Initialize service
  Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString(_tokenKey);
  }
  
  // Set auth token
  void setAuthToken(String token) {
    _authToken = token;
  }
  
  // Clear auth token
  void clearAuthToken() {
    _authToken = null;
  }
  
  // Save auth data
  Future<void> _saveAuthData(String token, UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
    setAuthToken(token);
  }
  
  // Clear auth data
  Future<void> _clearAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    clearAuthToken();
  }
  
  // Get stored user
  Future<UserModel?> getStoredUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      return UserModel.fromJson(jsonDecode(userJson));
    }
    return null;
  }
  
  // Check if logged in
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    return token != null && token.isNotEmpty;
  }
  
  // AUTHENTICATION METHODS
  
  // Register user
  Future<ApiResponse<UserModel>> register({
    required String email,
    required String password,
    required String name,
    required String phone,
    required String userType,
  }) async {
    try {
      final body = jsonEncode({
        'email': email,
        'password': password,
        'name': name,
        'phone': phone,
        'userType': userType,
      });
      
      _logRequest('POST', ApiConstants.authRegister, _defaultHeaders, body);
      
      final response = await http.post(
        Uri.parse(ApiConstants.authRegister),
        headers: _defaultHeaders,
        body: body,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      final apiResponse = await _handleResponse<Map<String, dynamic>>(
        response,
        (json) => json as Map<String, dynamic>,
      );
      
      if (apiResponse.isSuccess && apiResponse.data != null) {
        final userData = apiResponse.data!['user'] as Map<String, dynamic>;
        final sessionData = apiResponse.data!['session'] as Map<String, dynamic>;
        final token = sessionData['access_token'] as String;
        final user = UserModel.fromJson(userData);
        
        await _saveAuthData(token, user);
        return ApiResponse.success(user, apiResponse.message);
      }
      
      return ApiResponse.error(apiResponse.error ?? 'Registration failed');
    } catch (e) {
      _logError('POST', ApiConstants.authRegister, e);
      return ApiResponse.error('Registration failed: ${e.toString()}');
    }
  }
  
  // Login user
  Future<ApiResponse<UserModel>> login({
    required String email,
    required String password,
  }) async {
    try {
      final body = jsonEncode({
        'email': email,
        'password': password,
      });
      
      _logRequest('POST', ApiConstants.authLogin, _defaultHeaders, body);
      
      final response = await http.post(
        Uri.parse(ApiConstants.authLogin),
        headers: _defaultHeaders,
        body: body,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      final apiResponse = await _handleResponse<Map<String, dynamic>>(
        response,
        (json) => json as Map<String, dynamic>,
      );
      
      if (apiResponse.isSuccess && apiResponse.data != null) {
        final userData = apiResponse.data!['user'] as Map<String, dynamic>;
        final sessionData = apiResponse.data!['session'] as Map<String, dynamic>;
        final token = sessionData['access_token'] as String;
        final user = UserModel.fromJson(userData);
        
        await _saveAuthData(token, user);
        return ApiResponse.success(user, apiResponse.message);
      }
      
      return ApiResponse.error(apiResponse.error ?? 'Login failed');
    } catch (e) {
      _logError('POST', ApiConstants.authLogin, e);
      return ApiResponse.error('Login failed: ${e.toString()}');
    }
  }
  
  // Logout user
  Future<ApiResponse<void>> logout() async {
    try {
      _logRequest('POST', ApiConstants.authLogout, _defaultHeaders, null);
      
      final response = await http.post(
        Uri.parse(ApiConstants.authLogout),
        headers: _defaultHeaders,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      await _clearAuthData();
      return ApiResponse.success(null, 'Logged out successfully');
    } catch (e) {
      _logError('POST', ApiConstants.authLogout, e);
      await _clearAuthData(); // Clear local data even if API call fails
      return ApiResponse.success(null, 'Logged out locally');
    }
  }
  
  // Get current user
  Future<ApiResponse<UserModel>> getCurrentUser() async {
    try {
      _logRequest('GET', ApiConstants.authMe, _defaultHeaders, null);
      
      final response = await http.get(
        Uri.parse(ApiConstants.authMe),
        headers: _defaultHeaders,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      final apiResponse = await _handleResponse<Map<String, dynamic>>(
        response,
        (json) => json as Map<String, dynamic>,
      );
      
      if (apiResponse.isSuccess && apiResponse.data != null) {
        final user = UserModel.fromJson(apiResponse.data!);
        
        // Update stored user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_userKey, jsonEncode(user.toJson()));
        
        return ApiResponse.success(user, apiResponse.message);
      }
      
      return ApiResponse.error(apiResponse.error ?? 'Failed to get user data');
    } catch (e) {
      _logError('GET', ApiConstants.authMe, e);
      return ApiResponse.error('Failed to get user data: ${e.toString()}');
    }
  }
  
  // PROPERTY METHODS
  
  // Get properties
  Future<ApiResponse<List<PropertyModel>>> getProperties({
    String? propertyType,
    String? transactionType,
    double? minPrice,
    double? maxPrice,
    String? location,
    String? area,
    int? bedrooms,
    int? bathrooms,
    bool? isFurnished,
    int? page = 1,
    int? limit = 20,
  }) async {
    try {
      final queryParams = <String, String>{};
      
      if (propertyType != null) queryParams['propertyType'] = propertyType;
      if (transactionType != null) queryParams['transactionType'] = transactionType;
      if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
      if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
      if (location != null) queryParams['location'] = location;
      if (area != null) queryParams['area'] = area;
      if (bedrooms != null) queryParams['bedrooms'] = bedrooms.toString();
      if (bathrooms != null) queryParams['bathrooms'] = bathrooms.toString();
      if (isFurnished != null) queryParams['isFurnished'] = isFurnished.toString();
      if (page != null) queryParams['page'] = page.toString();
      if (limit != null) queryParams['limit'] = limit.toString();
      
      final uri = Uri.parse(ApiConstants.properties).replace(queryParameters: queryParams);
      
      _logRequest('GET', uri.toString(), _defaultHeaders, null);
      
      final response = await http.get(
        uri,
        headers: _defaultHeaders,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      final apiResponse = await _handleResponse<List<dynamic>>(
        response,
        (json) => json as List<dynamic>,
      );
      
      if (apiResponse.isSuccess && apiResponse.data != null) {
        final properties = apiResponse.data!
            .map((json) => PropertyModel.fromJson(json as Map<String, dynamic>))
            .toList();
        return ApiResponse.success(properties, apiResponse.message);
      }
      
      return ApiResponse.error(apiResponse.error ?? 'Failed to fetch properties');
    } catch (e) {
      _logError('GET', ApiConstants.properties, e);
      return ApiResponse.error('Failed to fetch properties: ${e.toString()}');
    }
  }
  
  // Get property by ID
  Future<ApiResponse<PropertyModel>> getPropertyById(String propertyId) async {
    try {
      final url = ApiConstants.propertyById(propertyId);
      
      _logRequest('GET', url, _defaultHeaders, null);
      
      final response = await http.get(
        Uri.parse(url),
        headers: _defaultHeaders,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      final apiResponse = await _handleResponse<Map<String, dynamic>>(
        response,
        (json) => json as Map<String, dynamic>,
      );
      
      if (apiResponse.isSuccess && apiResponse.data != null) {
        final property = PropertyModel.fromJson(apiResponse.data!);
        return ApiResponse.success(property, apiResponse.message);
      }
      
      return ApiResponse.error(apiResponse.error ?? 'Failed to fetch property');
    } catch (e) {
      _logError('GET', ApiConstants.propertyById(propertyId), e);
      return ApiResponse.error('Failed to fetch property: ${e.toString()}');
    }
  }
  
  // FAVORITES METHODS
  
  // Get favorites
  Future<ApiResponse<List<PropertyModel>>> getFavorites() async {
    try {
      _logRequest('GET', ApiConstants.favorites, _defaultHeaders, null);
      
      final response = await http.get(
        Uri.parse(ApiConstants.favorites),
        headers: _defaultHeaders,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      final apiResponse = await _handleResponse<List<dynamic>>(
        response,
        (json) => json as List<dynamic>,
      );
      
      if (apiResponse.isSuccess && apiResponse.data != null) {
        final favorites = apiResponse.data!
            .map((json) => PropertyModel.fromJson(json as Map<String, dynamic>))
            .toList();
        return ApiResponse.success(favorites, apiResponse.message);
      }
      
      return ApiResponse.error(apiResponse.error ?? 'Failed to fetch favorites');
    } catch (e) {
      _logError('GET', ApiConstants.favorites, e);
      return ApiResponse.error('Failed to fetch favorites: ${e.toString()}');
    }
  }
  
  // Add to favorites
  Future<ApiResponse<void>> addToFavorites(String propertyId) async {
    try {
      final body = jsonEncode({'propertyId': propertyId});
      
      _logRequest('POST', ApiConstants.favorites, _defaultHeaders, body);
      
      final response = await http.post(
        Uri.parse(ApiConstants.favorites),
        headers: _defaultHeaders,
        body: body,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      return await _handleResponse<void>(response, null);
    } catch (e) {
      _logError('POST', ApiConstants.favorites, e);
      return ApiResponse.error('Failed to add to favorites: ${e.toString()}');
    }
  }
  
  // Remove from favorites
  Future<ApiResponse<void>> removeFromFavorites(String propertyId) async {
    try {
      final url = ApiConstants.removeFavorite(propertyId);
      
      _logRequest('DELETE', url, _defaultHeaders, null);
      
      final response = await http.delete(
        Uri.parse(url),
        headers: _defaultHeaders,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      return await _handleResponse<void>(response, null);
    } catch (e) {
      _logError('DELETE', ApiConstants.removeFavorite(propertyId), e);
      return ApiResponse.error('Failed to remove from favorites: ${e.toString()}');
    }
  }
  
  // OTP METHODS
  
  // Send OTP
  Future<ApiResponse<Map<String, dynamic>>> sendOtp({
    required String phone,
    required String type,
  }) async {
    try {
      final body = jsonEncode({
        'phone': phone,
        'type': type,
      });
      
      _logRequest('POST', ApiConstants.otpSend, _defaultHeaders, body);
      
      final response = await http.post(
        Uri.parse(ApiConstants.otpSend),
        headers: _defaultHeaders,
        body: body,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      return await _handleResponse<Map<String, dynamic>>(
        response,
        (json) => json as Map<String, dynamic>,
      );
    } catch (e) {
      _logError('POST', ApiConstants.otpSend, e);
      return ApiResponse.error('Failed to send OTP: ${e.toString()}');
    }
  }
  
  // Verify OTP
  Future<ApiResponse<Map<String, dynamic>>> verifyOtp({
    required String phone,
    required String otp,
  }) async {
    try {
      final body = jsonEncode({
        'phone': phone,
        'otp': otp,
      });
      
      _logRequest('POST', ApiConstants.otpVerify, _defaultHeaders, body);
      
      final response = await http.post(
        Uri.parse(ApiConstants.otpVerify),
        headers: _defaultHeaders,
        body: body,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      return await _handleResponse<Map<String, dynamic>>(
        response,
        (json) => json as Map<String, dynamic>,
      );
    } catch (e) {
      _logError('POST', ApiConstants.otpVerify, e);
      return ApiResponse.error('Failed to verify OTP: ${e.toString()}');
    }
  }
}
