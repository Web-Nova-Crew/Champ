import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'api_constants.dart';
import '../models/api_response.dart';

class HttpService {
  static HttpService? _instance;
  late http.Client _client;
  String? _authToken;
  
  HttpService._internal() {
    _client = http.Client();
  }
  
  static HttpService get instance {
    _instance ??= HttpService._internal();
    return _instance!;
  }
  
  void setAuthToken(String token) {
    _authToken = token;
  }
  
  void clearAuthToken() {
    _authToken = null;
  }
  
  Map<String, String> get _defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    if (_authToken != null) 'Authorization': 'Bearer $_authToken',
  };
  
  void _logRequest(String method, String url, Map<String, String> headers, dynamic body) {
    if (kDebugMode) {
      print('🚀 HTTP REQUEST: $method $url');
      print('📤 Headers: $headers');
      if (body != null) {
        print('📤 Body: $body');
      }
    }
  }
  
  void _logResponse(http.Response response) {
    if (kDebugMode) {
      print('✅ HTTP RESPONSE: ${response.statusCode} ${response.request?.url}');
      print('📥 Body: ${response.body}');
    }
  }
  
  void _logError(String method, String url, dynamic error) {
    if (kDebugMode) {
      print('❌ HTTP ERROR: $method $url');
      print('❌ Error: $error');
    }
  }
  
  Future<ApiResponse<T>> get<T>(
    String endpoint, {
    Map<String, String>? queryParameters,
    Map<String, String>? headers,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final uri = _buildUri(endpoint, queryParameters);
      final requestHeaders = {..._defaultHeaders, ...?headers};
      
      _logRequest('GET', uri.toString(), requestHeaders, null);
      
      final response = await _client.get(uri, headers: requestHeaders)
          .timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      _logError('GET', endpoint, e);
      return _handleError<T>(e);
    }
  }
  
  Future<ApiResponse<T>> post<T>(
    String endpoint, {
    dynamic body,
    Map<String, String>? queryParameters,
    Map<String, String>? headers,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final uri = _buildUri(endpoint, queryParameters);
      final requestHeaders = {..._defaultHeaders, ...?headers};
      final requestBody = body != null ? jsonEncode(body) : null;
      
      _logRequest('POST', uri.toString(), requestHeaders, requestBody);
      
      final response = await _client.post(
        uri,
        headers: requestHeaders,
        body: requestBody,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      _logError('POST', endpoint, e);
      return _handleError<T>(e);
    }
  }
  
  Future<ApiResponse<T>> put<T>(
    String endpoint, {
    dynamic body,
    Map<String, String>? queryParameters,
    Map<String, String>? headers,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final uri = _buildUri(endpoint, queryParameters);
      final requestHeaders = {..._defaultHeaders, ...?headers};
      final requestBody = body != null ? jsonEncode(body) : null;
      
      _logRequest('PUT', uri.toString(), requestHeaders, requestBody);
      
      final response = await _client.put(
        uri,
        headers: requestHeaders,
        body: requestBody,
      ).timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      _logError('PUT', endpoint, e);
      return _handleError<T>(e);
    }
  }
  
  Future<ApiResponse<T>> delete<T>(
    String endpoint, {
    Map<String, String>? queryParameters,
    Map<String, String>? headers,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final uri = _buildUri(endpoint, queryParameters);
      final requestHeaders = {..._defaultHeaders, ...?headers};
      
      _logRequest('DELETE', uri.toString(), requestHeaders, null);
      
      final response = await _client.delete(uri, headers: requestHeaders)
          .timeout(ApiConstants.connectTimeout);
      
      _logResponse(response);
      
      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      _logError('DELETE', endpoint, e);
      return _handleError<T>(e);
    }
  }
  
  Future<ApiResponse<T>> uploadFile<T>(
    String endpoint,
    File file, {
    String fieldName = 'file',
    Map<String, String>? additionalFields,
    Map<String, String>? headers,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final uri = _buildUri(endpoint);
      final request = http.MultipartRequest('POST', uri);
      
      // Add headers
      final requestHeaders = {..._defaultHeaders, ...?headers};
      requestHeaders.remove('Content-Type'); // Let http package set this for multipart
      request.headers.addAll(requestHeaders);
      
      // Add file
      final multipartFile = await http.MultipartFile.fromPath(fieldName, file.path);
      request.files.add(multipartFile);
      
      // Add additional fields
      if (additionalFields != null) {
        request.fields.addAll(additionalFields);
      }
      
      _logRequest('POST (Multipart)', uri.toString(), request.headers, 'File: ${file.path}');
      
      final streamedResponse = await request.send().timeout(ApiConstants.sendTimeout);
      final response = await http.Response.fromStream(streamedResponse);
      
      _logResponse(response);
      
      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      _logError('POST (Multipart)', endpoint, e);
      return _handleError<T>(e);
    }
  }
  
  Uri _buildUri(String endpoint, [Map<String, String>? queryParameters]) {
    final baseUri = Uri.parse(ApiConstants.baseUrl);
    final fullPath = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    
    return Uri(
      scheme: baseUri.scheme,
      host: baseUri.host,
      port: baseUri.port,
      path: '${baseUri.path}$fullPath',
      queryParameters: queryParameters?.isNotEmpty == true ? queryParameters : null,
    );
  }
  
  ApiResponse<T> _handleResponse<T>(http.Response response, T Function(dynamic)? fromJson) {
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
        // Handle error responses
        String errorMessage = 'HTTP $statusCode';
        
        try {
          final jsonData = jsonDecode(response.body);
          if (jsonData is Map<String, dynamic>) {
            errorMessage = jsonData['error'] ?? jsonData['message'] ?? errorMessage;
          }
        } catch (e) {
          // If response body is not JSON, use status code message
          errorMessage = _getStatusCodeMessage(statusCode);
        }
        
        return ApiResponse.error(errorMessage, statusCode);
      }
    } catch (e) {
      return ApiResponse.error('Failed to process response: ${e.toString()}');
    }
  }
  
  ApiResponse<T> _handleError<T>(dynamic error) {
    String errorMessage;
    
    if (error is SocketException) {
      errorMessage = 'No internet connection. Please check your network.';
    } else if (error is HttpException) {
      errorMessage = 'HTTP error: ${error.message}';
    } else if (error is FormatException) {
      errorMessage = 'Invalid response format.';
    } else if (error.toString().contains('TimeoutException')) {
      errorMessage = 'Request timeout. Please try again.';
    } else {
      errorMessage = 'An unexpected error occurred: ${error.toString()}';
    }
    
    return ApiResponse.error(errorMessage);
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
      case 502:
        return 'Bad gateway. Server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'HTTP $statusCode error occurred.';
    }
  }
  
  void dispose() {
    _client.close();
  }
}
