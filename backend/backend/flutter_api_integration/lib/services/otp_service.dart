import 'dio_service.dart';
import 'api_constants.dart';
import '../models/api_response.dart';

class OtpService {
  static OtpService? _instance;
  final DioService _dioService = DioService.instance;
  
  OtpService._internal();
  
  static OtpService get instance {
    _instance ??= OtpService._internal();
    return _instance!;
  }
  
  // Send OTP to phone number
  Future<ApiResponse<Map<String, dynamic>>> sendOtp({
    required String phone,
    required String type, // verification, login, password_reset
  }) async {
    final data = {
      'phone': phone,
      'type': type,
    };
    
    final response = await _dioService.post<Map<String, dynamic>>(
      '/otp/send',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      return ApiResponse.success(response.data!, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to send OTP');
  }
  
  // Send OTP to email
  Future<ApiResponse<Map<String, dynamic>>> sendEmailOtp({
    required String email,
    required String type, // verification, login, password_reset
  }) async {
    final data = {
      'email': email,
      'type': type,
    };
    
    final response = await _dioService.post<Map<String, dynamic>>(
      '/otp/send',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      return ApiResponse.success(response.data!, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to send email OTP');
  }
  
  // Verify OTP
  Future<ApiResponse<Map<String, dynamic>>> verifyOtp({
    String? phone,
    String? email,
    required String otp,
  }) async {
    final data = <String, dynamic>{
      'otp': otp,
    };
    
    if (phone != null) {
      data['phone'] = phone;
    } else if (email != null) {
      data['email'] = email;
    } else {
      return ApiResponse.error('Either phone or email is required');
    }
    
    final response = await _dioService.post<Map<String, dynamic>>(
      '/otp/verify',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      return ApiResponse.success(response.data!, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to verify OTP');
  }
  
  // Resend OTP
  Future<ApiResponse<Map<String, dynamic>>> resendOtp({
    String? phone,
    String? email,
    required String type,
  }) async {
    final data = <String, dynamic>{
      'type': type,
    };
    
    if (phone != null) {
      data['phone'] = phone;
    } else if (email != null) {
      data['email'] = email;
    } else {
      return ApiResponse.error('Either phone or email is required');
    }
    
    final response = await _dioService.post<Map<String, dynamic>>(
      '/otp/resend',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      return ApiResponse.success(response.data!, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to resend OTP');
  }
}
