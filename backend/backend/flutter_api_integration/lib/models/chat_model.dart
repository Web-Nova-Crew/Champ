import 'user_model.dart';
import 'property_model.dart';

class ChatModel {
  final String id;
  final String participant1Id;
  final String participant2Id;
  final String? propertyId;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;
  final UserModel? participant1;
  final UserModel? participant2;
  final PropertyModel? property;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  ChatModel({
    required this.id,
    required this.participant1Id,
    required this.participant2Id,
    this.propertyId,
    this.lastMessage,
    this.lastMessageAt,
    required this.unreadCount,
    this.participant1,
    this.participant2,
    this.property,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory ChatModel.fromJson(Map<String, dynamic> json) {
    return ChatModel(
      id: json['id'] as String,
      participant1Id: json['participant1_id'] as String,
      participant2Id: json['participant2_id'] as String,
      propertyId: json['property_id'] as String?,
      lastMessage: json['last_message'] as String?,
      lastMessageAt: json['last_message_at'] != null
          ? DateTime.parse(json['last_message_at'] as String)
          : null,
      unreadCount: json['unread_count'] as int? ?? 0,
      participant1: json['participant1'] != null
          ? UserModel.fromJson(json['participant1'] as Map<String, dynamic>)
          : null,
      participant2: json['participant2'] != null
          ? UserModel.fromJson(json['participant2'] as Map<String, dynamic>)
          : null,
      property: json['property'] != null
          ? PropertyModel.fromJson(json['property'] as Map<String, dynamic>)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'participant1_id': participant1Id,
      'participant2_id': participant2Id,
      'property_id': propertyId,
      'last_message': lastMessage,
      'last_message_at': lastMessageAt?.toIso8601String(),
      'unread_count': unreadCount,
      'participant1': participant1?.toJson(),
      'participant2': participant2?.toJson(),
      'property': property?.toJson(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
  
  ChatModel copyWith({
    String? id,
    String? participant1Id,
    String? participant2Id,
    String? propertyId,
    String? lastMessage,
    DateTime? lastMessageAt,
    int? unreadCount,
    UserModel? participant1,
    UserModel? participant2,
    PropertyModel? property,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ChatModel(
      id: id ?? this.id,
      participant1Id: participant1Id ?? this.participant1Id,
      participant2Id: participant2Id ?? this.participant2Id,
      propertyId: propertyId ?? this.propertyId,
      lastMessage: lastMessage ?? this.lastMessage,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
      unreadCount: unreadCount ?? this.unreadCount,
      participant1: participant1 ?? this.participant1,
      participant2: participant2 ?? this.participant2,
      property: property ?? this.property,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  UserModel? getOtherParticipant(String currentUserId) {
    if (participant1Id == currentUserId) {
      return participant2;
    } else if (participant2Id == currentUserId) {
      return participant1;
    }
    return null;
  }
  
  String getOtherParticipantId(String currentUserId) {
    if (participant1Id == currentUserId) {
      return participant2Id;
    } else {
      return participant1Id;
    }
  }
  
  bool get hasUnreadMessages => unreadCount > 0;
  
  String get formattedLastMessageTime {
    if (lastMessageAt == null) return '';
    
    final now = DateTime.now();
    final difference = now.difference(lastMessageAt!);
    
    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
  
  @override
  String toString() {
    return 'ChatModel(id: $id, participant1Id: $participant1Id, participant2Id: $participant2Id, unreadCount: $unreadCount)';
  }
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ChatModel && other.id == id;
  }
  
  @override
  int get hashCode => id.hashCode;
}
