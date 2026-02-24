import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'api_constants.dart';
import '../models/api_response.dart';

class DioService {
  static DioService? _instance;
  late Dio _dio;
  
  DioService._internal() {
    _dio = Dio();
    _setupInterceptors();
    _setupOptions();
  }
  
  static DioService get instance {
    _instance ??= DioService._internal();
    return _instance!;
  }
  
  Dio get dio => _dio;
  
  void _setupOptions() {
    _dio.options = BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: ApiConstants.connectTimeout,
      receiveTimeout: ApiConstants.receiveTimeout,
      sendTimeout: ApiConstants.sendTimeout,
      headers: ApiConstants.defaultHeaders,
      validateStatus: (status) {
        return status != null && status < 500;
      },
    );
  }
  
  void _setupInterceptors() {
    // Request Interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (kDebugMode) {
            print('🚀 REQUEST: ${options.method} ${options.uri}');
            print('📤 Headers: ${options.headers}');
            if (options.data != null) {
              print('📤 Body: ${options.data}');
            }
          }
          handler.next(options);
        },
        onResponse: (response, handler) {
          if (kDebugMode) {
            print('✅ RESPONSE: ${response.statusCode} ${response.requestOptions.uri}');
            print('📥 Data: ${response.data}');
          }
          handler.next(response);
        },
        onError: (error, handler) {
          if (kDebugMode) {
            print('❌ ERROR: ${error.requestOptions.method} ${error.requestOptions.uri}');
            print('❌ Status: ${error.response?.statusCode}');
            print('❌ Message: ${error.message}');
            print('❌ Data: ${error.response?.data}');
          }
          handler.next(error);
        },
      ),
    );
    
    // Auth Token Interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token if available
          final token = await _getStoredToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          // Handle 401 errors (token expired)
          if (error.response?.statusCode == 401) {
            // Try to refresh token or redirect to login
            await _handleUnauthorized();
          }
          handler.next(error);
        },
      ),
    );
  }
  
  Future<String?> _getStoredToken() async {
    // Implement your token storage logic here
    // Example: return await SharedPreferences.getInstance().then((prefs) => prefs.getString('auth_token'));
    return null; // Replace with actual implementation
  }
  
  Future<void> _handleUnauthorized() async {
    // Implement logout logic or token refresh
    // Example: Navigate to login screen, clear stored data
    if (kDebugMode) {
      print('🔒 Unauthorized access - redirecting to login');
    }
  }
  
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }
  
  void clearAuthToken() {
    _dio.options.headers.remove('Authorization');
  }
  
  // Generic GET request
  Future<ApiResponse<T>> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.get(
        endpoint,
        queryParameters: queryParameters,
        options: options,
      );
      
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    } catch (e) {
      return ApiResponse.error('Unexpected error: ${e.toString()}');
    }
  }
  
  // Generic POST request
  Future<ApiResponse<T>> post<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    } catch (e) {
      return ApiResponse.error('Unexpected error: ${e.toString()}');
    }
  }
  
  // Generic PUT request
  Future<ApiResponse<T>> put<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.put(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    } catch (e) {
      return ApiResponse.error('Unexpected error: ${e.toString()}');
    }
  }
  
  // Generic DELETE request
  Future<ApiResponse<T>> delete<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.delete(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    } catch (e) {
      return ApiResponse.error('Unexpected error: ${e.toString()}');
    }
  }
  
  // File upload with progress
  Future<ApiResponse<T>> uploadFile<T>(
    String endpoint,
    String filePath, {
    String fieldName = 'file',
    Map<String, dynamic>? additionalData,
    ProgressCallback? onSendProgress,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(filePath),
        if (additionalData != null) ...additionalData,
      });
      
      final response = await _dio.post(
        endpoint,
        data: formData,
        onSendProgress: onSendProgress,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );
      
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    } catch (e) {
      return ApiResponse.error('Unexpected error: ${e.toString()}');
    }
  }
  
  ApiResponse<T> _handleResponse<T>(Response response, T Function(dynamic)? fromJson) {
    if (response.statusCode != null && response.statusCode! >= 200 && response.statusCode! < 300) {
      final data = response.data;
      
      if (data is Map<String, dynamic>) {
        if (data['success'] == true) {
          final responseData = data['data'];
          if (fromJson != null && responseData != null) {
            try {
              final parsedData = fromJson(responseData);
              return ApiResponse.success(parsedData, data['message']);
            } catch (e) {
              return ApiResponse.error('Failed to parse response: ${e.toString()}');
            }
          } else {
            return ApiResponse.success(responseData as T?, data['message']);
          }
        } else {
          return ApiResponse.error(data['error'] ?? 'Unknown error occurred');
        }
      } else {
        return ApiResponse.success(data as T?, 'Success');
      }
    } else {
      return ApiResponse.error('HTTP ${response.statusCode}: ${response.statusMessage}');
    }
  }
  
  ApiResponse<T> _handleError<T>(DioException error) {
    String errorMessage;
    
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        errorMessage = 'Connection timeout. Please check your internet connection.';
        break;
      case DioExceptionType.sendTimeout:
        errorMessage = 'Send timeout. Please try again.';
        break;
      case DioExceptionType.receiveTimeout:
        errorMessage = 'Receive timeout. Please try again.';
        break;
      case DioExceptionType.badResponse:
        final data = error.response?.data;
        if (data is Map<String, dynamic>) {
          errorMessage = data['error'] ?? data['message'] ?? 'Server error occurred';
        } else {
          errorMessage = 'Server error: ${error.response?.statusCode}';
        }
        break;
      case DioExceptionType.cancel:
        errorMessage = 'Request was cancelled';
        break;
      case DioExceptionType.connectionError:
        errorMessage = 'No internet connection. Please check your network.';
        break;
      default:
        errorMessage = 'An unexpected error occurred: ${error.message}';
    }
    
    return ApiResponse.error(errorMessage);
  }
}
