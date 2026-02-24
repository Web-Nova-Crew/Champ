import 'package:flutter/material.dart';
import '../services/estato_api_service.dart';
import '../models/api_response.dart';

class ApiHelper {
  static final EstatoApiService _api = EstatoApiService.instance;
  
  /// Show loading dialog
  static void showLoadingDialog(BuildContext context, {String message = 'Loading...'}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Row(
          children: [
            const CircularProgressIndicator(),
            const SizedBox(width: 16),
            Text(message),
          ],
        ),
      ),
    );
  }
  
  /// Hide loading dialog
  static void hideLoadingDialog(BuildContext context) {
    Navigator.of(context).pop();
  }
  
  /// Show error snackbar
  static void showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 4),
        action: SnackBarAction(
          label: 'DISMISS',
          textColor: Colors.white,
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
          },
        ),
      ),
    );
  }
  
  /// Show success snackbar
  static void showSuccessSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }
  
  /// Handle API response with UI feedback
  static Future<T?> handleApiCall<T>(
    BuildContext context,
    Future<ApiResponse<T>> apiCall, {
    String? loadingMessage,
    String? successMessage,
    bool showLoading = true,
    bool showSuccess = false,
    bool showError = true,
  }) async {
    if (showLoading) {
      showLoadingDialog(context, message: loadingMessage ?? 'Loading...');
    }
    
    try {
      final response = await apiCall;
      
      if (showLoading) {
        hideLoadingDialog(context);
      }
      
      if (response.isSuccess) {
        if (showSuccess && successMessage != null) {
          showSuccessSnackBar(context, successMessage);
        } else if (showSuccess && response.message != null) {
          showSuccessSnackBar(context, response.message!);
        }
        return response.data;
      } else {
        if (showError) {
          showErrorSnackBar(context, response.error ?? 'An error occurred');
        }
        return null;
      }
    } catch (e) {
      if (showLoading) {
        hideLoadingDialog(context);
      }
      if (showError) {
        showErrorSnackBar(context, 'Network error: ${e.toString()}');
      }
      return null;
    }
  }
  
  /// Quick login helper
  static Future<bool> quickLogin(
    BuildContext context, {
    required String email,
    required String password,
  }) async {
    final user = await handleApiCall(
      context,
      _api.login(email: email, password: password),
      loadingMessage: 'Signing in...',
      successMessage: 'Welcome back!',
      showSuccess: true,
    );
    
    return user != null;
  }
  
  /// Quick register helper
  static Future<bool> quickRegister(
    BuildContext context, {
    required String email,
    required String password,
    required String name,
    required String phone,
    required String userType,
  }) async {
    final user = await handleApiCall(
      context,
      _api.register(
        email: email,
        password: password,
        name: name,
        phone: phone,
        userType: userType,
      ),
      loadingMessage: 'Creating account...',
      successMessage: 'Account created successfully!',
      showSuccess: true,
    );
    
    return user != null;
  }
  
  /// Quick logout helper
  static Future<void> quickLogout(BuildContext context) async {
    await handleApiCall(
      context,
      _api.logout(),
      loadingMessage: 'Signing out...',
      successMessage: 'Signed out successfully',
      showSuccess: true,
    );
  }
  
  /// Check authentication status
  static Future<bool> isAuthenticated() async {
    return await _api.isLoggedIn();
  }
  
  /// Get stored user
  static Future<dynamic> getStoredUser() async {
    return await _api.getStoredUser();
  }
  
  /// Handle network errors with retry option
  static void showNetworkErrorDialog(
    BuildContext context, {
    required VoidCallback onRetry,
    String? message,
  }) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Network Error'),
        content: Text(message ?? 'Please check your internet connection and try again.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              onRetry();
            },
            child: const Text('RETRY'),
          ),
        ],
      ),
    );
  }
  
  /// Show confirmation dialog
  static Future<bool> showConfirmationDialog(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'CONFIRM',
    String cancelText = 'CANCEL',
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(cancelText),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(confirmText),
          ),
        ],
      ),
    );
    
    return result ?? false;
  }
}
