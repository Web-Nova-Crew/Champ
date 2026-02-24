import 'package:flutter/foundation.dart';
import '../services/api_client.dart';

class NotificationProvider with ChangeNotifier {
  List<AppNotification> _notifications = [];
  int _unreadCount = 0;

  List<AppNotification> get notifications => _notifications;
  int get unreadCount => _unreadCount;

  NotificationProvider() {
    _loadNotifications();
  }

  void _addNotification(AppNotification notification) {
    _notifications.insert(0, notification);
    if (!notification.isRead) {
      _unreadCount++;
    }
    notifyListeners();
  }

  Future<void> _loadNotifications() async {
    try {
      final response = await ApiClient.getNotifications();
      if (response['success'] == true) {
        final List<dynamic> notificationsData = response['data'] ?? [];
        _notifications = notificationsData.map((data) {
          return AppNotification(
            id: data['id'].toString(),
            title: data['title'] ?? 'Notification',
            message: data['message'] ?? '',
            type: _parseNotificationType(data['type']),
            timestamp: DateTime.parse(data['created_at'] ?? DateTime.now().toIso8601String()),
            isRead: data['is_read'] ?? false,
            data: data['data'],
          );
        }).toList();

        _unreadCount = _notifications.where((n) => !n.isRead).length;
        notifyListeners();
      }
    } catch (e) {
      // Handle error silently
    }
  }

  NotificationType _parseNotificationType(String? type) {
    switch (type?.toLowerCase()) {
      case 'booking':
        return NotificationType.booking;
      case 'property':
        return NotificationType.property;
      case 'chat':
        return NotificationType.chat;
      case 'payment':
        return NotificationType.payment;
      default:
        return NotificationType.general;
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      final response = await ApiClient.markNotificationRead(notificationId);
      if (response['success'] == true) {
        final index = _notifications.indexWhere((n) => n.id == notificationId);
        if (index != -1 && !_notifications[index].isRead) {
          _notifications[index] = _notifications[index].copyWith(isRead: true);
          _unreadCount = (_unreadCount - 1).clamp(0, _notifications.length);
          notifyListeners();
        }
      }
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> markAllAsRead() async {
    try {
      // Mark all unread notifications as read
      final unreadNotifications = _notifications.where((n) => !n.isRead).toList();
      
      for (final notification in unreadNotifications) {
        await markAsRead(notification.id);
      }
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      // Note: This would require a delete endpoint in the API
      final index = _notifications.indexWhere((n) => n.id == notificationId);
      if (index != -1) {
        final notification = _notifications[index];
        _notifications.removeAt(index);
        if (!notification.isRead) {
          _unreadCount = (_unreadCount - 1).clamp(0, _notifications.length);
        }
        notifyListeners();
      }
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> refresh() async {
    await _loadNotifications();
  }
}

enum NotificationType {
  general,
  booking,
  property,
  chat,
  payment,
}

class AppNotification {
  final String id;
  final String title;
  final String message;
  final NotificationType type;
  final DateTime timestamp;
  final bool isRead;
  final Map<String, dynamic>? data;

  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.timestamp,
    required this.isRead,
    this.data,
  });

  AppNotification copyWith({
    String? id,
    String? title,
    String? message,
    NotificationType? type,
    DateTime? timestamp,
    bool? isRead,
    Map<String, dynamic>? data,
  }) {
    return AppNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      data: data ?? this.data,
    );
  }
}
