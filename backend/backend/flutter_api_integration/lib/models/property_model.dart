class PropertyModel {
  final String id;
  final String title;
  final String description;
  final double price;
  final String propertyType; // Apartment, House, Villa, etc.
  final String transactionType; // Buy, Rent
  final String location;
  final String area;
  final int size;
  final int bedrooms;
  final int bathrooms;
  final List<String> amenities;
  final bool isFurnished;
  final String ownerId;
  final String ownerName;
  final String ownerPhone;
  final List<String> images;
  final String status; // pending, approved, rejected
  final DateTime createdAt;
  final DateTime updatedAt;
  
  PropertyModel({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.propertyType,
    required this.transactionType,
    required this.location,
    required this.area,
    required this.size,
    required this.bedrooms,
    required this.bathrooms,
    required this.amenities,
    required this.isFurnished,
    required this.ownerId,
    required this.ownerName,
    required this.ownerPhone,
    required this.images,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      price: (json['price'] as num).toDouble(),
      propertyType: json['property_type'] as String,
      transactionType: json['transaction_type'] as String,
      location: json['location'] as String,
      area: json['area'] as String,
      size: json['size'] as int,
      bedrooms: json['bedrooms'] as int,
      bathrooms: json['bathrooms'] as int,
      amenities: List<String>.from(json['amenities'] as List? ?? []),
      isFurnished: json['is_furnished'] as bool? ?? false,
      ownerId: json['owner_id'] as String,
      ownerName: json['owner_name'] as String,
      ownerPhone: json['owner_phone'] as String,
      images: List<String>.from(json['images'] as List? ?? []),
      status: json['status'] as String? ?? 'pending',
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'price': price,
      'property_type': propertyType,
      'transaction_type': transactionType,
      'location': location,
      'area': area,
      'size': size,
      'bedrooms': bedrooms,
      'bathrooms': bathrooms,
      'amenities': amenities,
      'is_furnished': isFurnished,
      'owner_id': ownerId,
      'owner_name': ownerName,
      'owner_phone': ownerPhone,
      'images': images,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
  
  PropertyModel copyWith({
    String? id,
    String? title,
    String? description,
    double? price,
    String? propertyType,
    String? transactionType,
    String? location,
    String? area,
    int? size,
    int? bedrooms,
    int? bathrooms,
    List<String>? amenities,
    bool? isFurnished,
    String? ownerId,
    String? ownerName,
    String? ownerPhone,
    List<String>? images,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return PropertyModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      price: price ?? this.price,
      propertyType: propertyType ?? this.propertyType,
      transactionType: transactionType ?? this.transactionType,
      location: location ?? this.location,
      area: area ?? this.area,
      size: size ?? this.size,
      bedrooms: bedrooms ?? this.bedrooms,
      bathrooms: bathrooms ?? this.bathrooms,
      amenities: amenities ?? this.amenities,
      isFurnished: isFurnished ?? this.isFurnished,
      ownerId: ownerId ?? this.ownerId,
      ownerName: ownerName ?? this.ownerName,
      ownerPhone: ownerPhone ?? this.ownerPhone,
      images: images ?? this.images,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  bool get isForSale => transactionType.toLowerCase() == 'buy';
  bool get isForRent => transactionType.toLowerCase() == 'rent';
  bool get isApproved => status == 'approved';
  bool get isPending => status == 'pending';
  bool get isRejected => status == 'rejected';
  
  String get formattedPrice {
    if (price >= 10000000) {
      return '₹${(price / 10000000).toStringAsFixed(1)} Cr';
    } else if (price >= 100000) {
      return '₹${(price / 100000).toStringAsFixed(1)} L';
    } else if (price >= 1000) {
      return '₹${(price / 1000).toStringAsFixed(1)} K';
    } else {
      return '₹${price.toStringAsFixed(0)}';
    }
  }
  
  String get primaryImage => images.isNotEmpty ? images.first : '';
  
  @override
  String toString() {
    return 'PropertyModel(id: $id, title: $title, price: $price, location: $location)';
  }
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PropertyModel && other.id == id;
  }
  
  @override
  int get hashCode => id.hashCode;
}
