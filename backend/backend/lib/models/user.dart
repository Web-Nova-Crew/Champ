class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? profileImage;
  final UserType userType;
  final List<String> favoriteProperties;
  final DateTime createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.profileImage,
    required this.userType,
    this.favoriteProperties = const [],
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      profileImage: json['profileImage'],
      userType: UserType.values.firstWhere(
        (e) => e.toString() == 'UserType.${json['userType']}',
        orElse: () => UserType.buyer,
      ),
      favoriteProperties: List<String>.from(json['favoriteProperties'] ?? []),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'profileImage': profileImage,
      'userType': userType.toString().split('.').last,
      'favoriteProperties': favoriteProperties,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

enum UserType {
  buyer,      // Property seeker
  seller,     // Property seller
  agent,      // Real estate agent
  landlord,   // Landlord (multiple properties)
  owner,      // Property owner
  both,       // Can buy and sell
}

