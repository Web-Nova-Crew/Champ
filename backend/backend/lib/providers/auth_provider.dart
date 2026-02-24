import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_client.dart';

/// Authentication Provider - PRODUCTION MODE
///
/// This provider handles real API authentication with the backend
class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isLoggedIn = false;
  bool _isLoading = false;
  String? _errorMessage;

  User? get currentUser => _currentUser;
  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  /// Login with real API
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiClient.login(
        email: email,
        password: password,
      );

      if (response['success'] == true) {
        final userData = response['data']['user'];
        final profile = userData['profile'];

        _currentUser = User(
          id: userData['id'] ?? '',
          name: profile?['name'] ?? userData['user_metadata']?['name'] ?? '',
          email: profile?['email'] ?? userData['email'] ?? '',
          phone: profile?['phone'] ?? userData['user_metadata']?['phone'] ?? '',
          profileImage: profile?['avatar_url'],
          userType: _parseUserType(profile?['user_type'] ?? 'buyer'),
          favoriteProperties: List<String>.from(profile?['favorite_properties'] ?? []),
          createdAt: DateTime.parse(profile?['created_at'] ?? DateTime.now().toIso8601String()),
        );

        _isLoggedIn = true;

        // Save to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('isLoggedIn', true);
        await prefs.setString('userId', _currentUser!.id);
        await prefs.setString('userName', _currentUser!.name);
        await prefs.setString('userEmail', _currentUser!.email);
        await prefs.setString('userPhone', _currentUser!.phone);
        await prefs.setString('userType', _currentUser!.userType.toString());
        await prefs.setString('accessToken', response['data']['accessToken']);
        await prefs.setString('refreshToken', response['data']['refreshToken']);

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = response['error'] ?? 'Login failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (error) {
      _errorMessage = 'Network error. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Register with real API
  Future<bool> register(String name, String email, String phone, String password, UserType userType) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiClient.register(
        email: email,
        password: password,
        name: name,
        phone: phone,
        userType: userType.toString().split('.').last,
      );

      if (response['success'] == true) {
        final userData = response['data']['user'];

        _currentUser = User(
          id: userData['id'] ?? '',
          name: userData['user_metadata']?['name'] ?? name,
          email: userData['email'] ?? email,
          phone: userData['user_metadata']?['phone'] ?? phone,
          userType: userType,
          createdAt: DateTime.now(),
        );

        _isLoggedIn = true;

        // Save to local storage - IMPORTANT: Save tokens for authentication!
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('isLoggedIn', true);
        await prefs.setString('userId', _currentUser!.id);
        await prefs.setString('userName', _currentUser!.name);
        await prefs.setString('userEmail', _currentUser!.email);
        await prefs.setString('userPhone', _currentUser!.phone);
        await prefs.setString('userType', userType.toString());
        
        // Save access and refresh tokens for API authentication
        final data = response['data'];
        if (data['accessToken'] != null) {
          await prefs.setString('accessToken', data['accessToken']);
        } else if (data['session']?['access_token'] != null) {
          await prefs.setString('accessToken', data['session']['access_token']);
        }
        if (data['refreshToken'] != null) {
          await prefs.setString('refreshToken', data['refreshToken']);
        } else if (data['session']?['refresh_token'] != null) {
          await prefs.setString('refreshToken', data['session']['refresh_token']);
        }

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = response['error'] ?? 'Registration failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (error) {
      _errorMessage = 'Network error. Please try again';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await ApiClient.logout();
    } catch (error) {
      // Continue with local logout even if API call fails
    }

    _currentUser = null;
    _isLoggedIn = false;
    _errorMessage = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    notifyListeners();
  }

  /// Check if user is already logged in (from previous session)
  Future<void> checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    _isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

    if (_isLoggedIn) {
      // First restore from local storage as fallback
      final userId = prefs.getString('userId') ?? '';
      final userName = prefs.getString('userName') ?? 'User';
      final userEmail = prefs.getString('userEmail') ?? '';
      final userPhone = prefs.getString('userPhone') ?? '';
      final userTypeStr = prefs.getString('userType') ?? 'UserType.buyer';

      // Set user from local storage immediately
      _currentUser = User(
        id: userId,
        name: userName.isNotEmpty ? userName : 'User',
        email: userEmail,
        phone: userPhone,
        userType: _parseUserType(userTypeStr),
        createdAt: DateTime.now(),
      );

      // Try to get updated user from API
      try {
        var response = await ApiClient.getCurrentUser();
        
        // If token expired, try to refresh it
        if (response['success'] != true && response['error']?.toString().contains('expired') == true) {
          final refreshToken = prefs.getString('refreshToken');
          if (refreshToken != null) {
            final refreshResponse = await ApiClient.refreshToken(refreshToken);
            if (refreshResponse['success'] == true) {
              // Token refreshed, try getting user again
              response = await ApiClient.getCurrentUser();
            }
          }
        }
        
        if (response['success'] == true) {
          final userData = response['data'];
          final profile = userData['profile'];

          _currentUser = User(
            id: userData['id'] ?? userId,
            name: profile?['name'] ?? userData['user_metadata']?['name'] ?? userName,
            email: profile?['email'] ?? userData['email'] ?? userEmail,
            phone: profile?['phone'] ?? userData['user_metadata']?['phone'] ?? userPhone,
            profileImage: profile?['avatar_url'],
            userType: _parseUserType(profile?['user_type'] ?? userTypeStr),
            favoriteProperties: List<String>.from(profile?['favorite_properties'] ?? []),
            createdAt: DateTime.parse(profile?['created_at'] ?? DateTime.now().toIso8601String()),
          );
        } else if (response['error']?.toString().contains('authenticated') == true ||
                   response['error']?.toString().contains('expired') == true) {
          // Token invalid and refresh failed - logout user
          _isLoggedIn = false;
          _currentUser = null;
          await prefs.clear();
        }
      } catch (error) {
        // API call failed, continue with local storage data
      }
    }

    notifyListeners();
  }

  UserType _parseUserType(String userTypeStr) {
    switch (userTypeStr.toLowerCase()) {
      case 'buyer':
        return UserType.buyer;
      case 'seller':
        return UserType.seller;
      case 'agent':
        return UserType.agent;
      case 'landlord':
        return UserType.landlord;
      case 'owner':
        return UserType.owner;
      case 'both':
        return UserType.both;
      default:
        return UserType.buyer;
    }
  }

  /// Update user profile
  Future<bool> updateProfile({
    String? name,
    String? phone,
    String? bio,
  }) async {
    if (_currentUser == null) return false;

    try {
      final response = await ApiClient.updateUserProfile(
        name: name,
        phone: phone,
        bio: bio,
      );

      if (response['success'] == true) {
        final updatedData = response['data'];
        _currentUser = User(
          id: _currentUser!.id,
          name: updatedData['name'] ?? _currentUser!.name,
          email: _currentUser!.email,
          phone: updatedData['phone'] ?? _currentUser!.phone,
          profileImage: _currentUser!.profileImage,
          userType: _currentUser!.userType,
          favoriteProperties: _currentUser!.favoriteProperties,
          createdAt: _currentUser!.createdAt,
        );

        // Update local storage
        final prefs = await SharedPreferences.getInstance();
        if (name != null) await prefs.setString('userName', name);
        if (phone != null) await prefs.setString('userPhone', phone);

        notifyListeners();
        return true;
      } else {
        _errorMessage = response['error'] ?? 'Update failed';
        notifyListeners();
        return false;
      }
    } catch (error) {
      _errorMessage = 'Network error. Please try again.';
      notifyListeners();
      return false;
    }
  }

  /// Upload avatar/profile picture
  Future<bool> uploadAvatar(String imagePath) async {
    if (_currentUser == null) return false;

    try {
      final response = await ApiClient.uploadAvatar(imagePath);

      if (response['success'] == true) {
        final avatarUrl = response['data']?['avatarUrl'] ?? response['data']?['avatar_url'];
        
        _currentUser = User(
          id: _currentUser!.id,
          name: _currentUser!.name,
          email: _currentUser!.email,
          phone: _currentUser!.phone,
          profileImage: avatarUrl,
          userType: _currentUser!.userType,
          favoriteProperties: _currentUser!.favoriteProperties,
          createdAt: _currentUser!.createdAt,
        );

        // Update local storage
        final prefs = await SharedPreferences.getInstance();
        if (avatarUrl != null) await prefs.setString('userAvatar', avatarUrl);

        notifyListeners();
        return true;
      } else {
        _errorMessage = response['error'] ?? 'Avatar upload failed';
        notifyListeners();
        return false;
      }
    } catch (error) {
      _errorMessage = 'Network error. Please try again.';
      notifyListeners();
      return false;
    }
  }

  /// Change password
  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    if (_currentUser == null) return false;

    try {
      final response = await ApiClient.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );

      if (response['success'] == true) {
        return true;
      } else {
        _errorMessage = response['error'] ?? 'Password change failed';
        notifyListeners();
        return false;
      }
    } catch (error) {
      _errorMessage = 'Network error. Please try again.';
      notifyListeners();
      return false;
    }
  }

  /// Delete account
  Future<bool> deleteAccount() async {
    if (_currentUser == null) return false;

    try {
      final response = await ApiClient.deleteAccount();

      if (response['success'] == true) {
        // Clear all local data
        _currentUser = null;
        _isLoggedIn = false;
        _errorMessage = null;

        final prefs = await SharedPreferences.getInstance();
        await prefs.clear();

        notifyListeners();
        return true;
      } else {
        _errorMessage = response['error'] ?? 'Account deletion failed';
        notifyListeners();
        return false;
      }
    } catch (error) {
      _errorMessage = 'Network error. Please try again.';
      notifyListeners();
      return false;
    }
  }

  /// Toggle favorite property
  Future<bool> toggleFavorite(String propertyId) async {
    if (_currentUser == null) return false;

    try {
      final isCurrentlyFavorite = _currentUser!.favoriteProperties.contains(propertyId);

      final response = isCurrentlyFavorite
          ? await ApiClient.removeFavorite(propertyId)
          : await ApiClient.addFavorite(propertyId);

      if (response['success'] == true) {
        final favorites = List<String>.from(_currentUser!.favoriteProperties);
        if (isCurrentlyFavorite) {
          favorites.remove(propertyId);
        } else {
          favorites.add(propertyId);
        }

        _currentUser = User(
          id: _currentUser!.id,
          name: _currentUser!.name,
          email: _currentUser!.email,
          phone: _currentUser!.phone,
          profileImage: _currentUser!.profileImage,
          userType: _currentUser!.userType,
          favoriteProperties: favorites,
          createdAt: _currentUser!.createdAt,
        );

        notifyListeners();
        return true;
      } else {
        _errorMessage = response['error'] ?? 'Failed to update favorite';
        notifyListeners();
        return false;
      }
    } catch (error) {
      _errorMessage = 'Network error. Please try again.';
      notifyListeners();
      return false;
    }
  }

  bool isFavorite(String propertyId) {
    return _currentUser?.favoriteProperties.contains(propertyId) ?? false;
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}