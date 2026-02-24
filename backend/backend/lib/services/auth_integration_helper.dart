import 'package:flutter/material.dart';
import 'estato_api_service.dart';
import '../utils/api_helper.dart';
import '../models/user_model.dart';

/// Helper class to integrate real-time authentication with existing app
class AuthIntegrationHelper {
  static final EstatoApiService _api = EstatoApiService.instance;
  
  /// Replace your existing login function with this
  static Future<bool> authenticateUser(
    BuildContext context, {
    required String email,
    required String password,
  }) async {
    // Real-time authentication instead of demo
    final success = await ApiHelper.quickLogin(
      context,
      email: email,
      password: password,
    );
    
    return success;
  }
  
  /// Replace your existing registration function with this
  static Future<bool> registerUser(
    BuildContext context, {
    required String email,
    required String password,
    required String name,
    required String phone,
    required String userType,
  }) async {
    // Real-time registration instead of demo
    final success = await ApiHelper.quickRegister(
      context,
      email: email,
      password: password,
      name: name,
      phone: phone,
      userType: userType,
    );
    
    return success;
  }
  
  /// Check if user is authenticated (replace your existing check)
  static Future<bool> isUserAuthenticated() async {
    return await _api.isLoggedIn();
  }
  
  /// Get current user data (replace your existing user data)
  static Future<UserModel?> getCurrentUser() async {
    if (await _api.isLoggedIn()) {
      // Try to get fresh user data from API
      final response = await _api.getCurrentUser();
      if (response.isSuccess) {
        return response.data;
      }
      
      // Fallback to stored user data
      return await _api.getStoredUser();
    }
    return null;
  }
  
  /// Logout user (replace your existing logout)
  static Future<void> logoutUser(BuildContext context) async {
    await ApiHelper.quickLogout(context);
  }
  
  /// Initialize authentication on app start
  static Future<void> initializeAuth() async {
    await _api.initialize();
  }
  
  /// Check and redirect based on authentication status
  static Future<void> checkAuthAndRedirect(BuildContext context) async {
    final isAuthenticated = await isUserAuthenticated();
    
    if (isAuthenticated) {
      // User is logged in, go to home
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      // User not logged in, go to login
      Navigator.pushReplacementNamed(context, '/login');
    }
  }
}

/// Extension to easily integrate with existing AuthProvider
extension AuthProviderIntegration on AuthIntegrationHelper {
  
  /// Use this in your existing AuthProvider
  static Future<bool> providerLogin(
    BuildContext context,
    String email,
    String password,
  ) async {
    return await AuthIntegrationHelper.authenticateUser(
      context,
      email: email,
      password: password,
    );
  }
  
  /// Use this in your existing AuthProvider
  static Future<bool> providerRegister(
    BuildContext context, {
    required String email,
    required String password,
    required String name,
    required String phone,
    required String userType,
  }) async {
    return await AuthIntegrationHelper.registerUser(
      context,
      email: email,
      password: password,
      name: name,
      phone: phone,
      userType: userType,
    );
  }
}
