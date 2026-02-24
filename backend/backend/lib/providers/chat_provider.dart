import 'package:flutter/foundation.dart';
import 'dart:async';
import '../models/message.dart';
import '../services/api_client.dart';

class ChatProvider with ChangeNotifier {
  List<Chat> _chats = [];
  List<Message> _messages = [];
  String? _currentChatId;
  Timer? _pollingTimer;
  bool _isPolling = false;

  List<Chat> get chats => _chats;
  List<Message> get messages => _messages;
  String? get currentChatId => _currentChatId;

  ChatProvider() {
    _loadSampleChats();
  }

  void _loadSampleChats() {
    // Sample chats for demo
    _chats = [];
  }

  void createChat({
    required String participant1Id,
    required String participant1Name,
    required String participant2Id,
    required String participant2Name,
    required String propertyId,
    required String propertyTitle,
  }) {
    final chatId = DateTime.now().millisecondsSinceEpoch.toString();
    final chat = Chat(
      id: chatId,
      participant1Id: participant1Id,
      participant1Name: participant1Name,
      participant2Id: participant2Id,
      participant2Name: participant2Name,
      propertyId: propertyId,
      propertyTitle: propertyTitle,
      createdAt: DateTime.now(),
    );
    _chats.insert(0, chat);
    notifyListeners();
  }

  Chat? getChatByPropertyAndParticipant(String propertyId, String participantId) {
    try {
      return _chats.firstWhere(
        (chat) =>
            chat.propertyId == propertyId &&
            (chat.participant1Id == participantId || chat.participant2Id == participantId),
      );
    } catch (e) {
      return null;
    }
  }

  void openChat(String chatId) {
    _currentChatId = chatId;
    _loadMessages(chatId);
    _startPolling(chatId);
    notifyListeners();
  }

  void closeChat() {
    _currentChatId = null;
    _stopPolling();
    notifyListeners();
  }

  void _startPolling(String chatId) {
    _stopPolling();
    _isPolling = true;
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      if (_currentChatId == chatId && _isPolling) {
        await _fetchMessagesFromAPI(chatId);
      }
    });
  }

  void _stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    _isPolling = false;
  }

  Future<void> _fetchMessagesFromAPI(String chatId) async {
    try {
      final response = await ApiClient.getChatMessages(chatId);
      if (response['success'] == true) {
        final List<dynamic> messagesData = response['data'] ?? [];
        final List<Message> fetchedMessages = messagesData.map((data) {
          return Message(
            id: data['id'].toString(),
            senderId: data['sender_id'].toString(),
            senderName: data['sender_name'] ?? 'Unknown',
            receiverId: data['receiver_id']?.toString() ?? '',
            receiverName: data['receiver_name'] ?? 'Unknown',
            propertyId: data['property_id']?.toString() ?? '',
            propertyTitle: data['property_title'] ?? '',
            content: data['content'] ?? '',
            timestamp: DateTime.parse(data['created_at'] ?? DateTime.now().toIso8601String()),
          );
        }).toList();

        // Update messages if there are new ones
        if (fetchedMessages.length != _messages.length) {
          _messages = fetchedMessages;
          notifyListeners();
        }
      }
    } catch (e) {
      // Handle error silently
    }
  }

  void _loadMessages(String chatId) {
    try {
      final chat = _chats.firstWhere((c) => c.id == chatId);
      // Filter messages for this specific chat
      _messages = _messages.where((msg) {
        return msg.propertyId == chat.propertyId &&
               ((msg.senderId == chat.participant1Id && msg.receiverId == chat.participant2Id) ||
                (msg.senderId == chat.participant2Id && msg.receiverId == chat.participant1Id));
      }).toList();
    } catch (e) {
      _messages = [];
    }
  }

  Future<void> sendMessage({
    required String chatId,
    required String senderId,
    required String senderName,
    required String receiverId,
    required String receiverName,
    required String propertyId,
    required String propertyTitle,
    required String content,
  }) async {
    // Add message locally first for immediate UI update
    final tempMessage = Message(
      id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
      senderId: senderId,
      senderName: senderName,
      receiverId: receiverId,
      receiverName: receiverName,
      propertyId: propertyId,
      propertyTitle: propertyTitle,
      content: content,
      timestamp: DateTime.now(),
    );

    _messages.add(tempMessage);
    notifyListeners();

    // Send to API
    try {
      final response = await ApiClient.sendMessage(chatId, content);
      if (response['success'] == true) {
        // Remove temp message and add real message from API
        _messages.removeWhere((msg) => msg.id == tempMessage.id);

        final messageData = response['data'];
        final realMessage = Message(
          id: messageData['id'].toString(),
          senderId: messageData['sender_id'].toString(),
          senderName: messageData['sender_name'] ?? senderName,
          receiverId: receiverId,
          receiverName: receiverName,
          propertyId: propertyId,
          propertyTitle: propertyTitle,
          content: messageData['content'] ?? content,
          timestamp: DateTime.parse(messageData['created_at'] ?? DateTime.now().toIso8601String()),
        );

        _messages.add(realMessage);
        notifyListeners();
      }
    } catch (e) {
      // Keep the temp message if API call fails
    }

    // Update chat's last message
    final chatIndex = _chats.indexWhere((chat) => chat.id == chatId);
    if (chatIndex != -1) {
      final chat = _chats[chatIndex];
      final lastMessage = Message(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        senderId: senderId,
        senderName: senderName,
        receiverId: receiverId,
        receiverName: receiverName,
        propertyId: propertyId,
        propertyTitle: propertyTitle,
        content: content,
        timestamp: DateTime.now(),
      );
      
      _chats[chatIndex] = Chat(
        id: chat.id,
        participant1Id: chat.participant1Id,
        participant1Name: chat.participant1Name,
        participant2Id: chat.participant2Id,
        participant2Name: chat.participant2Name,
        propertyId: chat.propertyId,
        propertyTitle: chat.propertyTitle,
        lastMessage: lastMessage,
        createdAt: chat.createdAt,
        unreadCount: receiverId == chat.participant1Id || receiverId == chat.participant2Id
            ? chat.unreadCount + 1
            : chat.unreadCount,
      );
    }

    notifyListeners();
  }

  List<Chat> getChatsForUser(String userId) {
    return _chats.where((chat) =>
        chat.participant1Id == userId || chat.participant2Id == userId).toList();
  }

  List<Message> getMessagesForChat(String chatId) {
    try {
      final chat = _chats.firstWhere((c) => c.id == chatId);
      return _messages.where((msg) {
        return msg.propertyId == chat.propertyId &&
               ((msg.senderId == chat.participant1Id && msg.receiverId == chat.participant2Id) ||
                (msg.senderId == chat.participant2Id && msg.receiverId == chat.participant1Id));
      }).toList()..sort((a, b) => a.timestamp.compareTo(b.timestamp));
    } catch (e) {
      return [];
    }
  }
}

