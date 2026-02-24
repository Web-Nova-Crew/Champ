import 'dio_service.dart';
import 'api_constants.dart';
import '../models/api_response.dart';
import '../models/chat_model.dart';
import '../models/message_model.dart';

class ChatService {
  static ChatService? _instance;
  final DioService _dioService = DioService.instance;
  
  ChatService._internal();
  
  static ChatService get instance {
    _instance ??= ChatService._internal();
    return _instance!;
  }
  
  // Get user chats
  Future<ApiResponse<List<ChatModel>>> getChats({
    int? page = 1,
    int? limit = 20,
  }) async {
    final queryParams = <String, dynamic>{};
    
    if (page != null) queryParams['page'] = page;
    if (limit != null) queryParams['limit'] = limit;
    
    final response = await _dioService.get<List<dynamic>>(
      '/chats',
      queryParameters: queryParams,
      fromJson: (json) => json as List<dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final chats = response.data!
          .map((json) => ChatModel.fromJson(json as Map<String, dynamic>))
          .toList();
      return ApiResponse.success(chats, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to fetch chats');
  }
  
  // Create new chat
  Future<ApiResponse<ChatModel>> createChat({
    required String participant2Id,
    String? propertyId,
  }) async {
    final data = {
      'participant2Id': participant2Id,
      if (propertyId != null) 'propertyId': propertyId,
    };
    
    final response = await _dioService.post<Map<String, dynamic>>(
      '/chats',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final chat = ChatModel.fromJson(response.data!);
      return ApiResponse.success(chat, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to create chat');
  }
  
  // Get chat messages
  Future<ApiResponse<List<MessageModel>>> getChatMessages({
    required String chatId,
    int? page = 1,
    int? limit = 50,
  }) async {
    final queryParams = <String, dynamic>{};
    
    if (page != null) queryParams['page'] = page;
    if (limit != null) queryParams['limit'] = limit;
    
    final response = await _dioService.get<List<dynamic>>(
      '/chats/$chatId/messages',
      queryParameters: queryParams,
      fromJson: (json) => json as List<dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final messages = response.data!
          .map((json) => MessageModel.fromJson(json as Map<String, dynamic>))
          .toList();
      return ApiResponse.success(messages, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to fetch messages');
  }
  
  // Send message
  Future<ApiResponse<MessageModel>> sendMessage({
    required String chatId,
    required String content,
    String? messageType = 'text', // text, image, file
  }) async {
    final data = {
      'content': content,
      'messageType': messageType,
    };
    
    final response = await _dioService.post<Map<String, dynamic>>(
      '/chats/$chatId/messages',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final message = MessageModel.fromJson(response.data!);
      return ApiResponse.success(message, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to send message');
  }
  
  // Mark messages as read
  Future<ApiResponse<void>> markMessagesAsRead(String chatId) async {
    return await _dioService.put<void>('/chats/$chatId/read');
  }
  
  // Delete chat
  Future<ApiResponse<void>> deleteChat(String chatId) async {
    return await _dioService.delete<void>('/chats/$chatId');
  }
  
  // Get chat by ID
  Future<ApiResponse<ChatModel>> getChatById(String chatId) async {
    final response = await _dioService.get<Map<String, dynamic>>(
      '/chats/$chatId',
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final chat = ChatModel.fromJson(response.data!);
      return ApiResponse.success(chat, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to fetch chat');
  }
  
  // Search chats
  Future<ApiResponse<List<ChatModel>>> searchChats(String query) async {
    final queryParams = {
      'search': query,
    };
    
    final response = await _dioService.get<List<dynamic>>(
      '/chats',
      queryParameters: queryParams,
      fromJson: (json) => json as List<dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final chats = response.data!
          .map((json) => ChatModel.fromJson(json as Map<String, dynamic>))
          .toList();
      return ApiResponse.success(chats, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to search chats');
  }
}
