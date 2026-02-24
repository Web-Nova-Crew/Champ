import 'property_model.dart';
import 'user_model.dart';

class BookingModel {
  final String id;
  final String propertyId;
  final String userId;
  final String scheduledDate;
  final String scheduledTime;
  final String? notes;
  final String status; // pending, confirmed, cancelled, completed
  final PropertyModel? property;
  final UserModel? user;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  BookingModel({
    required this.id,
    required this.propertyId,
    required this.userId,
    required this.scheduledDate,
    required this.scheduledTime,
    this.notes,
    required this.status,
    this.property,
    this.user,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] as String,
      propertyId: json['property_id'] as String,
      userId: json['user_id'] as String,
      scheduledDate: json['scheduled_date'] as String,
      scheduledTime: json['scheduled_time'] as String,
      notes: json['notes'] as String?,
      status: json['status'] as String,
      property: json['property'] != null
          ? PropertyModel.fromJson(json['property'] as Map<String, dynamic>)
          : null,
      user: json['user'] != null
          ? UserModel.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'property_id': propertyId,
      'user_id': userId,
      'scheduled_date': scheduledDate,
      'scheduled_time': scheduledTime,
      'notes': notes,
      'status': status,
      'property': property?.toJson(),
      'user': user?.toJson(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
  
  BookingModel copyWith({
    String? id,
    String? propertyId,
    String? userId,
    String? scheduledDate,
    String? scheduledTime,
    String? notes,
    String? status,
    PropertyModel? property,
    UserModel? user,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BookingModel(
      id: id ?? this.id,
      propertyId: propertyId ?? this.propertyId,
      userId: userId ?? this.userId,
      scheduledDate: scheduledDate ?? this.scheduledDate,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      notes: notes ?? this.notes,
      status: status ?? this.status,
      property: property ?? this.property,
      user: user ?? this.user,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  bool get isPending => status == 'pending';
  bool get isConfirmed => status == 'confirmed';
  bool get isCancelled => status == 'cancelled';
  bool get isCompleted => status == 'completed';
  
  DateTime get scheduledDateTime {
    final date = DateTime.parse(scheduledDate);
    final timeParts = scheduledTime.split(':');
    final hour = int.parse(timeParts[0]);
    final minute = int.parse(timeParts[1]);
    
    return DateTime(date.year, date.month, date.day, hour, minute);
  }
  
  bool get isUpcoming => scheduledDateTime.isAfter(DateTime.now());
  bool get isPast => scheduledDateTime.isBefore(DateTime.now());
  
  String get formattedScheduledDate {
    final date = DateTime.parse(scheduledDate);
    return '${date.day}/${date.month}/${date.year}';
  }
  
  String get formattedScheduledTime {
    final timeParts = scheduledTime.split(':');
    final hour = int.parse(timeParts[0]);
    final minute = int.parse(timeParts[1]);
    
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
    
    return '$displayHour:${minute.toString().padLeft(2, '0')} $period';
  }
  
  @override
  String toString() {
    return 'BookingModel(id: $id, propertyId: $propertyId, status: $status, scheduledDate: $scheduledDate)';
  }
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is BookingModel && other.id == id;
  }
  
  @override
  int get hashCode => id.hashCode;
}
