class Property {
  final String id;
  final String title;
  final String description;
  final double price;
  final String propertyType; // Apartment, House, Villa, Room, PG, Commercial, Shop, Warehouse, Plot, Farmhouse, Studio, Penthouse, Office Space
  final String transactionType; // Buy, Rent, Lease, Room Rent, PG, Co-living, Short-term Rent, Lease-to-Own
  final String location;
  final String area; // Lucknow specific areas
  final double size; // in sq ft
  final int bedrooms;
  final int bathrooms;
  final List<String> images;
  final String ownerId;
  final String ownerName;
  final String ownerPhone;
  final List<String> amenities;
  final bool isFurnished;
  final int yearBuilt;
  final DateTime listedDate;
  final bool isFeatured;
  final String status; // pending, approved, rejected

  Property({
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
    required this.images,
    required this.ownerId,
    required this.ownerName,
    required this.ownerPhone,
    required this.amenities,
    required this.isFurnished,
    required this.yearBuilt,
    required this.listedDate,
    this.isFeatured = false,
    this.status = 'pending',
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    // Handle both camelCase (app) and snake_case (backend) field names
    return Property(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      propertyType: json['propertyType'] ?? json['property_type'] ?? '',
      transactionType: json['transactionType'] ?? json['transaction_type'] ?? '',
      location: json['location'] ?? '',
      area: json['area'] ?? '',
      size: (json['size'] ?? 0).toDouble(),
      bedrooms: json['bedrooms'] ?? 0,
      bathrooms: json['bathrooms'] ?? 0,
      images: List<String>.from(json['images'] ?? []),
      ownerId: json['ownerId'] ?? json['owner_id']?.toString() ?? '',
      ownerName: json['ownerName'] ?? json['owner_name'] ?? '',
      ownerPhone: json['ownerPhone'] ?? json['owner_phone'] ?? '',
      amenities: List<String>.from(json['amenities'] ?? []),
      isFurnished: json['isFurnished'] ?? json['is_furnished'] ?? false,
      yearBuilt: json['yearBuilt'] ?? json['year_built'] ?? 0,
      listedDate: DateTime.parse(json['listedDate'] ?? json['listed_date'] ?? json['created_at'] ?? DateTime.now().toIso8601String()),
      isFeatured: json['isFeatured'] ?? json['is_featured'] ?? false,
      status: json['status'] ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'price': price,
      'propertyType': propertyType,
      'transactionType': transactionType,
      'location': location,
      'area': area,
      'size': size,
      'bedrooms': bedrooms,
      'bathrooms': bathrooms,
      'images': images,
      'ownerId': ownerId,
      'ownerName': ownerName,
      'ownerPhone': ownerPhone,
      'amenities': amenities,
      'isFurnished': isFurnished,
      'yearBuilt': yearBuilt,
      'listedDate': listedDate.toIso8601String(),
      'isFeatured': isFeatured,
      'status': status,
    };
  }
}

