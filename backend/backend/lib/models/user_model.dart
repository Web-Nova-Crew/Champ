class UserModel {
  final String id;
  final String email;
  final String name;
  final String? phone;
  final String? avatarUrl;
  final String? bio;
  final String userType; // buyer, seller, agent, admin
  final String role; // user, admin
  final bool verified;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    this.avatarUrl,
    this.bio,
    required this.userType,
    required this.role,
    required this.verified,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      bio: json['bio'] as String?,
      userType: json['user_type'] as String,
      role: json['role'] as String,
      verified: json['verified'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'avatar_url': avatarUrl,
      'bio': bio,
      'user_type': userType,
      'role': role,
      'verified': verified,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
  
  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? phone,
    String? avatarUrl,
    String? bio,
    String? userType,
    String? role,
    bool? verified,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bio: bio ?? this.bio,
      userType: userType ?? this.userType,
      role: role ?? this.role,
      verified: verified ?? this.verified,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  bool get isBuyer => userType == 'buyer';
  bool get isSeller => userType == 'seller';
  bool get isAgent => userType == 'agent';
  bool get isAdmin => role == 'admin';
  
  @override
  String toString() {
    return 'UserModel(id: $id, email: $email, name: $name, userType: $userType, role: $role)';
  }
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserModel && other.id == id;
  }
  
  @override
  int get hashCode => id.hashCode;
}
