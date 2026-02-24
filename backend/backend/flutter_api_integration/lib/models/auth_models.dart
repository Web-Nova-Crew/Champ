import 'user_model.dart';

class AuthResponse {
  final UserModel user;
  final SessionModel session;
  
  AuthResponse({
    required this.user,
    required this.session,
  });
  
  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      session: SessionModel.fromJson(json['session'] as Map<String, dynamic>),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'session': session.toJson(),
    };
  }
}

class SessionModel {
  final String accessToken;
  final String? refreshToken;
  final String tokenType;
  final int expiresIn;
  final DateTime expiresAt;
  
  SessionModel({
    required this.accessToken,
    this.refreshToken,
    required this.tokenType,
    required this.expiresIn,
    required this.expiresAt,
  });
  
  factory SessionModel.fromJson(Map<String, dynamic> json) {
    return SessionModel(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String?,
      tokenType: json['token_type'] as String? ?? 'Bearer',
      expiresIn: json['expires_in'] as int? ?? 3600,
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'] as String)
          : DateTime.now().add(Duration(seconds: json['expires_in'] as int? ?? 3600)),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'token_type': tokenType,
      'expires_in': expiresIn,
      'expires_at': expiresAt.toIso8601String(),
    };
  }
  
  bool get isExpired => DateTime.now().isAfter(expiresAt);
  bool get isExpiringSoon => DateTime.now().add(const Duration(minutes: 5)).isAfter(expiresAt);
  
  @override
  String toString() {
    return 'SessionModel(tokenType: $tokenType, expiresAt: $expiresAt, isExpired: $isExpired)';
  }
}

class LoginRequest {
  final String email;
  final String password;
  
  LoginRequest({
    required this.email,
    required this.password,
  });
  
  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}

class RegisterRequest {
  final String email;
  final String password;
  final String name;
  final String phone;
  final String userType;
  
  RegisterRequest({
    required this.email,
    required this.password,
    required this.name,
    required this.phone,
    required this.userType,
  });
  
  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
      'name': name,
      'phone': phone,
      'userType': userType,
    };
  }
}
