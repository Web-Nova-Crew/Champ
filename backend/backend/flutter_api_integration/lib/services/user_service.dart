import 'dart:io';
import 'dio_service.dart';
import 'api_constants.dart';
import '../models/api_response.dart';
import '../models/user_model.dart';

class UserService {
  static UserService? _instance;
  final DioService _dioService = DioService.instance;
  
  UserService._internal();
  
  static UserService get instance {
    _instance ??= UserService._internal();
    return _instance!;
  }
  
  // Get user profile
  Future<ApiResponse<UserModel>> getUserProfile() async {
    final response = await _dioService.get<Map<String, dynamic>>(
      '/users/profile',
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final user = UserModel.fromJson(response.data!);
      return ApiResponse.success(user, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to fetch user profile');
  }
  
  // Update user profile
  Future<ApiResponse<UserModel>> updateUserProfile({
    String? name,
    String? phone,
    String? bio,
    String? userType,
  }) async {
    final data = <String, dynamic>{};
    
    if (name != null) data['name'] = name;
    if (phone != null) data['phone'] = phone;
    if (bio != null) data['bio'] = bio;
    if (userType != null) data['userType'] = userType;
    
    final response = await _dioService.put<Map<String, dynamic>>(
      '/users/profile',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final user = UserModel.fromJson(response.data!);
      return ApiResponse.success(user, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to update profile');
  }
  
  // Upload user avatar
  Future<ApiResponse<String>> uploadAvatar(File avatarFile) async {
    final response = await _dioService.uploadFile<Map<String, dynamic>>(
      '/users/avatar',
      avatarFile.path,
      fieldName: 'avatar',
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final avatarUrl = response.data!['avatarUrl'] as String?;
      if (avatarUrl != null) {
        return ApiResponse.success(avatarUrl, response.message);
      }
    }
    
    return ApiResponse.error(response.error ?? 'Failed to upload avatar');
  }
  
  // Change password
  Future<ApiResponse<void>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final data = {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    };
    
    return await _dioService.post<void>(
      '/users/change-password',
      data: data,
    );
  }
  
  // Delete user account
  Future<ApiResponse<void>> deleteAccount() async {
    return await _dioService.delete<void>('/users/profile');
  }
}
