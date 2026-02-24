class Message {
  final String id;
  final String senderId;
  final String senderName;
  final String receiverId;
  final String receiverName;
  final String propertyId;
  final String propertyTitle;
  final String content;
  final DateTime timestamp;
  final bool isRead;

  Message({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.receiverId,
    required this.receiverName,
    required this.propertyId,
    required this.propertyTitle,
    required this.content,
    required this.timestamp,
    this.isRead = false,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] ?? '',
      senderId: json['senderId'] ?? '',
      senderName: json['senderName'] ?? '',
      receiverId: json['receiverId'] ?? '',
      receiverName: json['receiverName'] ?? '',
      propertyId: json['propertyId'] ?? '',
      propertyTitle: json['propertyTitle'] ?? '',
      content: json['content'] ?? '',
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
      isRead: json['isRead'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'senderName': senderName,
      'receiverId': receiverId,
      'receiverName': receiverName,
      'propertyId': propertyId,
      'propertyTitle': propertyTitle,
      'content': content,
      'timestamp': timestamp.toIso8601String(),
      'isRead': isRead,
    };
  }
}

class Chat {
  final String id;
  final String participant1Id;
  final String participant1Name;
  final String participant2Id;
  final String participant2Name;
  final String propertyId;
  final String propertyTitle;
  final Message? lastMessage;
  final DateTime createdAt;
  final int unreadCount;

  Chat({
    required this.id,
    required this.participant1Id,
    required this.participant1Name,
    required this.participant2Id,
    required this.participant2Name,
    required this.propertyId,
    required this.propertyTitle,
    this.lastMessage,
    required this.createdAt,
    this.unreadCount = 0,
  });

  factory Chat.fromJson(Map<String, dynamic> json) {
    return Chat(
      id: json['id'] ?? '',
      participant1Id: json['participant1Id'] ?? '',
      participant1Name: json['participant1Name'] ?? '',
      participant2Id: json['participant2Id'] ?? '',
      participant2Name: json['participant2Name'] ?? '',
      propertyId: json['propertyId'] ?? '',
      propertyTitle: json['propertyTitle'] ?? '',
      lastMessage: json['lastMessage'] != null
          ? Message.fromJson(json['lastMessage'])
          : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      unreadCount: json['unreadCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'participant1Id': participant1Id,
      'participant1Name': participant1Name,
      'participant2Id': participant2Id,
      'participant2Name': participant2Name,
      'propertyId': propertyId,
      'propertyTitle': propertyTitle,
      'lastMessage': lastMessage?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'unreadCount': unreadCount,
    };
  }
}

