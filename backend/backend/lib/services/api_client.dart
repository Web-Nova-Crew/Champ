import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'config_service.dart';

/// API Client for backend communication
/// 
/// This service handles all API calls to the Node.js backend with Supabase authentication
class ApiClient {
  // Use config service for base URL
  static String get baseUrl => ConfigService.apiBaseUrl;
  
  // Get stored access token
  static Future<String?> _getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('accessToken');
    return token;
  }

  // Save access token
  static Future<void> _saveAccessToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('accessToken', token);
  }

  // Clear access token
  static Future<void> _clearAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('accessToken');
  }

  // Make authenticated request
  static Future<Map<String, dynamic>> _makeRequest(
    String method,
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    bool requireAuth = true,
  }) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      
      final requestHeaders = <String, String>{
        'Content-Type': 'application/json',
        ...?headers,
      };

      if (requireAuth) {
        final token = await _getAccessToken();
        if (token == null) {
          return {
            'success': false,
            'error': 'Not authenticated. Please login.',
          };
        }
        requestHeaders['Authorization'] = 'Bearer $token';
      }

      http.Response response;

      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(url, headers: requestHeaders).timeout(
            const Duration(seconds: 30),
          );
          break;
        case 'POST':
          response = await http.post(
            url,
            headers: requestHeaders,
            body: body != null ? json.encode(body) : null,
          ).timeout(
            const Duration(seconds: 30),
          );
          break;
        case 'PUT':
          response = await http.put(
            url,
            headers: requestHeaders,
            body: body != null ? json.encode(body) : null,
          );
          break;
        case 'DELETE':
          response = await http.delete(url, headers: requestHeaders);
          break;
        default:
          throw Exception('Unsupported HTTP method: $method');
      }

      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 401) {
        // Token expired, clear and return error
        await _clearAccessToken();
        return {
          'success': false,
          'error': 'Session expired. Please login again.',
        };
      }

      return responseData;
    } catch (e) {
      String errorMessage = 'Network error';
      
      if (e.toString().contains('TimeoutException')) {
        errorMessage = 'Request timeout. Please check your internet connection.';
      } else if (e.toString().contains('SocketException')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (e.toString().contains('HandshakeException')) {
        errorMessage = 'SSL/TLS connection failed. Please try again.';
      } else if (e.toString().contains('FormatException')) {
        errorMessage = 'Invalid response from server.';
      } else {
        errorMessage = 'Network error: ${e.toString()}';
      }
      
      return {
        'success': false,
        'error': errorMessage,
      };
    }
  }

  // Authentication Methods
  static Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String name,
    required String phone,
    required String userType,
  }) async {
    final response = await _makeRequest(
      'POST',
      '/auth/register',
      body: {
        'email': email,
        'password': password,
        'name': name,
        'phone': phone,
        'userType': userType.toLowerCase(), // Valid: buyer, seller, agent, landlord, owner, both
      },
      requireAuth: false,
    );

    if (response['success'] == true && response['data'] != null) {
      // Handle both session and direct token response formats
      final data = response['data'];
      String? accessToken;
      
      if (data['session'] != null && data['session']['access_token'] != null) {
        accessToken = data['session']['access_token'];
      } else if (data['accessToken'] != null) {
        accessToken = data['accessToken'];
      }
      
      if (accessToken != null) {
        await _saveAccessToken(accessToken);
      }
    }

    return response;
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _makeRequest(
      'POST',
      '/auth/login',
      body: {
        'email': email,
        'password': password,
      },
      requireAuth: false,
    );

    if (response['success'] == true && response['data'] != null) {
      final accessToken = response['data']['accessToken'];
      if (accessToken != null) {
        await _saveAccessToken(accessToken);
      }
    }

    return response;
  }

  static Future<Map<String, dynamic>> logout() async {
    final response = await _makeRequest('POST', '/auth/logout');
    await _clearAccessToken();
    return response;
  }

  static Future<Map<String, dynamic>> getCurrentUser() async {
    return await _makeRequest('GET', '/auth/me');
  }

  static Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    final response = await _makeRequest(
      'POST',
      '/auth/refresh',
      body: {'refreshToken': refreshToken},
      requireAuth: false,
    );

    if (response['success'] == true && response['data'] != null) {
      final accessToken = response['data']['accessToken'];
      if (accessToken != null) {
        await _saveAccessToken(accessToken);
      }
    }

    return response;
  }

  // OTP Methods
  static Future<Map<String, dynamic>> sendOTP({
    String? phone,
    String? email,
  }) async {
    return await _makeRequest(
      'POST',
      '/otp/send',
      body: {
        if (phone != null) 'phone': phone,
        if (email != null) 'email': email,
      },
      requireAuth: false,
    );
  }

  static Future<Map<String, dynamic>> verifyOTP({
    String? phone,
    String? email,
    required String otp,
  }) async {
    return await _makeRequest(
      'POST',
      '/otp/verify',
      body: {
        if (phone != null) 'phone': phone,
        if (email != null) 'email': email,
        'otp': otp,
      },
      requireAuth: false,
    );
  }

  static Future<Map<String, dynamic>> resendOTP({
    String? phone,
    String? email,
  }) async {
    return await _makeRequest(
      'POST',
      '/otp/resend',
      body: {
        if (phone != null) 'phone': phone,
        if (email != null) 'email': email,
      },
      requireAuth: false,
    );
  }

  // User Methods
  static Future<Map<String, dynamic>> getUserProfile() async {
    return await _makeRequest('GET', '/users/profile');
  }

  static Future<Map<String, dynamic>> updateUserProfile({
    String? name,
    String? phone,
    String? bio,
  }) async {
    return await _makeRequest(
      'PUT',
      '/users/profile',
      body: {
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
        if (bio != null) 'bio': bio,
      },
    );
  }

  static Future<Map<String, dynamic>> uploadAvatar(String imagePath) async {
    try {
      final token = await _getAccessToken();
      if (token == null) {
        return {
          'success': false,
          'error': 'Not authenticated. Please login.',
        };
      }

      final url = Uri.parse('$baseUrl/users/avatar');
      final request = http.MultipartRequest('POST', url);
      
      // Add authorization header
      request.headers['Authorization'] = 'Bearer $token';
      
      // Add the file
      final file = await http.MultipartFile.fromPath('avatar', imagePath);
      request.files.add(file);
      
      final streamedResponse = await request.send().timeout(
        const Duration(seconds: 60),
      );
      
      final response = await http.Response.fromStream(streamedResponse);
      final responseData = json.decode(response.body) as Map<String, dynamic>;
      
      if (response.statusCode == 401) {
        await _clearAccessToken();
        return {
          'success': false,
          'error': 'Session expired. Please login again.',
        };
      }
      
      return responseData;
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to upload avatar. Please try again.',
      };
    }
  }

  static Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    return await _makeRequest(
      'POST',
      '/users/change-password',
      body: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }

  static Future<Map<String, dynamic>> deleteAccount() async {
    final response = await _makeRequest('DELETE', '/users/profile');
    if (response['success'] == true) {
      await _clearAccessToken();
    }
    return response;
  }

  // Property Methods
  static Future<Map<String, dynamic>> getProperties({
    String? propertyType,
    String? transactionType,
    double? minPrice,
    double? maxPrice,
    String? area,
    String? search,
  }) async {
    final queryParams = <String, String>{};
    if (propertyType != null) queryParams['propertyType'] = propertyType;
    if (transactionType != null) queryParams['transactionType'] = transactionType;
    if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
    if (area != null) queryParams['area'] = area;
    if (search != null) queryParams['search'] = search;

    final queryString = queryParams.entries
        .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')
        .join('&');

    return await _makeRequest(
      'GET',
      '/properties${queryString.isNotEmpty ? '?$queryString' : ''}',
      requireAuth: false,
    );
  }

  static Future<Map<String, dynamic>> getPropertyById(String id) async {
    return await _makeRequest('GET', '/properties/$id', requireAuth: false);
  }

  static Future<Map<String, dynamic>> createProperty(Map<String, dynamic> propertyData) async {
    try {
      final token = await _getAccessToken();
      if (token == null) {
        return {
          'success': false,
          'error': 'Not authenticated. Please login.',
        };
      }

      final url = Uri.parse('$baseUrl/properties');
      final request = http.MultipartRequest('POST', url);

      // Add authorization header
      request.headers['Authorization'] = 'Bearer $token';

      // Add text fields
      if (propertyData['title'] != null) {
        request.fields['title'] = propertyData['title'];
      }
      if (propertyData['description'] != null) {
        request.fields['description'] = propertyData['description'];
      }
      if (propertyData['price'] != null) {
        request.fields['price'] = propertyData['price'].toString();
      }
      if (propertyData['propertyType'] != null) {
        request.fields['propertyType'] = propertyData['propertyType'];
      }
      if (propertyData['transactionType'] != null) {
        request.fields['transactionType'] = propertyData['transactionType'];
      }
      if (propertyData['location'] != null) {
        request.fields['location'] = propertyData['location'];
      }
      if (propertyData['area'] != null) {
        request.fields['area'] = propertyData['area'];
      }
      if (propertyData['size'] != null) {
        request.fields['size'] = propertyData['size'].toString();
      }
      if (propertyData['bedrooms'] != null) {
        request.fields['bedrooms'] = propertyData['bedrooms'].toString();
      }
      if (propertyData['bathrooms'] != null) {
        request.fields['bathrooms'] = propertyData['bathrooms'].toString();
      }
      if (propertyData['ownerPhone'] != null) {
        request.fields['ownerPhone'] = propertyData['ownerPhone'];
      }
      if (propertyData['isFurnished'] != null) {
        request.fields['isFurnished'] = propertyData['isFurnished'].toString();
      }
      if (propertyData['yearBuilt'] != null) {
        request.fields['yearBuilt'] = propertyData['yearBuilt'].toString();
      }
      if (propertyData['latitude'] != null) {
        request.fields['latitude'] = propertyData['latitude'].toString();
      }
      if (propertyData['longitude'] != null) {
        request.fields['longitude'] = propertyData['longitude'].toString();
      }
      if (propertyData['isFeatured'] != null) {
        request.fields['isFeatured'] = propertyData['isFeatured'].toString();
      }
      if (propertyData['amenities'] != null && propertyData['amenities'] is List) {
        request.fields['amenities'] = json.encode(propertyData['amenities']);
      }

      // Add image files
      if (propertyData['images'] != null && propertyData['images'] is List) {
        final images = propertyData['images'] as List;
        for (int i = 0; i < images.length && i < 10; i++) {
          final imagePath = images[i];
          if (imagePath is String && imagePath.isNotEmpty) {
            // Check if it's a file path (local file) or URL (already uploaded)
            if (!imagePath.startsWith('http')) {
              // It's a local file path, add as multipart file
              try {
                // Determine content type from file extension
                String contentType = 'image/jpeg'; // default
                final lowerPath = imagePath.toLowerCase();
                if (lowerPath.endsWith('.png')) {
                  contentType = 'image/png';
                } else if (lowerPath.endsWith('.gif')) {
                  contentType = 'image/gif';
                } else if (lowerPath.endsWith('.webp')) {
                  contentType = 'image/webp';
                } else if (lowerPath.endsWith('.heic') || lowerPath.endsWith('.heif')) {
                  contentType = 'image/heic';
                }
                
                final file = await http.MultipartFile.fromPath(
                  'images', 
                  imagePath,
                  contentType: MediaType.parse(contentType),
                );
                request.files.add(file);
              } catch (e) {
                // Skip invalid files
                print('Error adding image file: $e');
                continue;
              }
            }
          }
        }
      }

      final streamedResponse = await request.send().timeout(
        const Duration(seconds: 60),
      );

      final response = await http.Response.fromStream(streamedResponse);
      final responseData = json.decode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 401) {
        await _clearAccessToken();
        return {
          'success': false,
          'error': 'Session expired. Please login again.',
        };
      }

      return responseData;
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to create property. Please try again.',
      };
    }
  }

  static Future<Map<String, dynamic>> updateProperty(String id, Map<String, dynamic> updates) async {
    return await _makeRequest('PUT', '/properties/$id', body: updates);
  }

  static Future<Map<String, dynamic>> deleteProperty(String id) async {
    return await _makeRequest('DELETE', '/properties/$id');
  }

  static Future<Map<String, dynamic>> getSimilarProperties(String propertyId) async {
    return await _makeRequest('GET', '/properties/$propertyId/similar', requireAuth: false);
  }

  // Favorite Methods
  static Future<Map<String, dynamic>> getFavorites() async {
    return await _makeRequest('GET', '/favorites');
  }

  static Future<Map<String, dynamic>> getFavoriteIds() async {
    return await _makeRequest('GET', '/favorites/ids');
  }

  static Future<Map<String, dynamic>> checkFavorite(String propertyId) async {
    return await _makeRequest('GET', '/favorites/check/$propertyId');
  }

  static Future<Map<String, dynamic>> addFavorite(String propertyId) async {
    return await _makeRequest('POST', '/favorites', body: {'propertyId': propertyId});
  }

  static Future<Map<String, dynamic>> toggleFavorite(String propertyId) async {
    return await _makeRequest('POST', '/favorites/toggle', body: {'propertyId': propertyId});
  }

  static Future<Map<String, dynamic>> removeFavorite(String propertyId) async {
    return await _makeRequest('DELETE', '/favorites/$propertyId');
  }

  // Chat Methods
  static Future<Map<String, dynamic>> getChats() async {
    return await _makeRequest('GET', '/chats');
  }

  static Future<Map<String, dynamic>> createChat({
    required String participant2Id,
    required String propertyId,
  }) async {
    return await _makeRequest('POST', '/chats', body: {
      'participant2Id': participant2Id,
      'propertyId': propertyId,
    });
  }

  static Future<Map<String, dynamic>> getChatMessages(String chatId) async {
    return await _makeRequest('GET', '/chats/$chatId/messages');
  }

  static Future<Map<String, dynamic>> sendMessage(String chatId, String content) async {
    return await _makeRequest('POST', '/chats/$chatId/messages', body: {
      'content': content,
    });
  }

  static Future<Map<String, dynamic>> getPropertyContact(String propertyId) async {
    return await _makeRequest('GET', '/chats/contact/$propertyId');
  }

  static Future<Map<String, dynamic>> startChatWithOwner(String propertyId, {String? message}) async {
    return await _makeRequest('POST', '/chats/start/$propertyId', body: {
      if (message != null) 'message': message,
    });
  }

  // Booking Methods
  static Future<Map<String, dynamic>> getBookings({String? status}) async {
    final query = status != null ? '?status=$status' : '';
    return await _makeRequest('GET', '/bookings$query');
  }

  static Future<Map<String, dynamic>> createBooking({
    required String propertyId,
    required String scheduledDate,
    required String scheduledTime,
    String? notes,
  }) async {
    return await _makeRequest('POST', '/bookings', body: {
      'propertyId': propertyId,
      'scheduledDate': scheduledDate,
      'scheduledTime': scheduledTime,
      if (notes != null) 'notes': notes,
    });
  }

  static Future<Map<String, dynamic>> updateBooking(String id, String status) async {
    return await _makeRequest('PUT', '/bookings/$id', body: {'status': status});
  }

  // Admin Methods
  static Future<Map<String, dynamic>> getAdminDashboard() async {
    return await _makeRequest('GET', '/admin/dashboard');
  }

  static Future<Map<String, dynamic>> getAdminUsers() async {
    return await _makeRequest('GET', '/admin/users');
  }

  static Future<Map<String, dynamic>> getAdminProperties({String? status}) async {
    final query = status != null ? '?status=$status' : '';
    return await _makeRequest('GET', '/admin/properties$query');
  }

  static Future<Map<String, dynamic>> approveProperty(String id) async {
    return await _makeRequest('PUT', '/admin/properties/$id/approve');
  }

  static Future<Map<String, dynamic>> rejectProperty(String id) async {
    return await _makeRequest('PUT', '/admin/properties/$id/reject');
  }

  static Future<Map<String, dynamic>> getAdminAgents() async {
    return await _makeRequest('GET', '/admin/agents');
  }

  static Future<Map<String, dynamic>> approveAgent(String id) async {
    return await _makeRequest('PUT', '/admin/agents/$id/approve');
  }

  static Future<Map<String, dynamic>> getAdminReports() async {
    return await _makeRequest('GET', '/admin/reports');
  }

  static Future<Map<String, dynamic>> resolveReport(String id) async {
    return await _makeRequest('PUT', '/admin/reports/$id/resolve');
  }

  // Authentication - Password Reset Methods
  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    return await _makeRequest(
      'POST',
      '/auth/forgot-password',
      body: {'email': email},
      requireAuth: false,
    );
  }

  static Future<Map<String, dynamic>> resetPassword({
    required String password,
    required String token,
  }) async {
    return await _makeRequest(
      'POST',
      '/auth/reset-password',
      body: {
        'password': password,
        'token': token,
      },
      requireAuth: false,
    );
  }

  // Notification Methods
  static Future<Map<String, dynamic>> getNotifications() async {
    return await _makeRequest('GET', '/notifications');
  }

  static Future<Map<String, dynamic>> markNotificationRead(String id) async {
    return await _makeRequest('PUT', '/notifications/$id/read');
  }

  static Future<Map<String, dynamic>> updateNotificationSettings(
    Map<String, dynamic> settings,
  ) async {
    return await _makeRequest(
      'PUT',
      '/notifications/settings',
      body: settings,
    );
  }
}

