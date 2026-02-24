class Booking {
  final String id;
  final String propertyId;
  final String propertyTitle;
  final String propertyOwnerId;
  final String propertyOwnerName;
  final String propertyOwnerPhone;
  final String bookerId;
  final String bookerName;
  final String bookerPhone;
  final String bookerEmail;
  final DateTime scheduledDate;
  final String scheduledTime;
  final String? notes;
  final BookingStatus status;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Booking({
    required this.id,
    required this.propertyId,
    required this.propertyTitle,
    required this.propertyOwnerId,
    required this.propertyOwnerName,
    required this.propertyOwnerPhone,
    required this.bookerId,
    required this.bookerName,
    required this.bookerPhone,
    required this.bookerEmail,
    required this.scheduledDate,
    required this.scheduledTime,
    this.notes,
    this.status = BookingStatus.pending,
    required this.createdAt,
    this.updatedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    // Handle both camelCase (app) and snake_case (backend) field names
    return Booking(
      id: json['id']?.toString() ?? '',
      propertyId: json['propertyId'] ?? json['property_id']?.toString() ?? '',
      propertyTitle: json['propertyTitle'] ?? json['property_title'] ?? json['properties']?['title'] ?? '',
      propertyOwnerId: json['propertyOwnerId'] ?? json['property_owner_id']?.toString() ?? '',
      propertyOwnerName: json['propertyOwnerName'] ?? json['property_owner_name'] ?? '',
      propertyOwnerPhone: json['propertyOwnerPhone'] ?? json['property_owner_phone'] ?? '',
      bookerId: json['bookerId'] ?? json['booker_id']?.toString() ?? '',
      bookerName: json['bookerName'] ?? json['booker_name'] ?? '',
      bookerPhone: json['bookerPhone'] ?? json['booker_phone'] ?? '',
      bookerEmail: json['bookerEmail'] ?? json['booker_email'] ?? '',
      scheduledDate: DateTime.parse(json['scheduledDate'] ?? json['scheduled_date'] ?? DateTime.now().toIso8601String()),
      scheduledTime: json['scheduledTime'] ?? json['scheduled_time'] ?? '',
      notes: json['notes'],
      status: BookingStatus.values.firstWhere(
        (e) => e.toString() == 'BookingStatus.${json['status']}',
        orElse: () => BookingStatus.pending,
      ),
      createdAt: DateTime.parse(json['createdAt'] ?? json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : json['updated_at'] != null
              ? DateTime.parse(json['updated_at'])
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'propertyId': propertyId,
      'propertyTitle': propertyTitle,
      'propertyOwnerId': propertyOwnerId,
      'propertyOwnerName': propertyOwnerName,
      'propertyOwnerPhone': propertyOwnerPhone,
      'bookerId': bookerId,
      'bookerName': bookerName,
      'bookerPhone': bookerPhone,
      'bookerEmail': bookerEmail,
      'scheduledDate': scheduledDate.toIso8601String(),
      'scheduledTime': scheduledTime,
      'notes': notes,
      'status': status.toString().split('.').last,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}

enum BookingStatus {
  pending,
  confirmed,
  completed,
  cancelled,
}

