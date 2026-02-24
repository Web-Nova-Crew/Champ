import 'dio_service.dart';
import 'api_constants.dart';
import '../models/api_response.dart';
import '../models/booking_model.dart';

class BookingService {
  static BookingService? _instance;
  final DioService _dioService = DioService.instance;
  
  BookingService._internal();
  
  static BookingService get instance {
    _instance ??= BookingService._internal();
    return _instance!;
  }
  
  // Get user bookings
  Future<ApiResponse<List<BookingModel>>> getUserBookings({
    String? status,
    int? page = 1,
    int? limit = 20,
  }) async {
    final queryParams = <String, dynamic>{};
    
    if (status != null) queryParams['status'] = status;
    if (page != null) queryParams['page'] = page;
    if (limit != null) queryParams['limit'] = limit;
    
    final response = await _dioService.get<List<dynamic>>(
      '/bookings',
      queryParameters: queryParams,
      fromJson: (json) => json as List<dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final bookings = response.data!
          .map((json) => BookingModel.fromJson(json as Map<String, dynamic>))
          .toList();
      return ApiResponse.success(bookings, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to fetch bookings');
  }
  
  // Create new booking
  Future<ApiResponse<BookingModel>> createBooking({
    required String propertyId,
    required String scheduledDate,
    required String scheduledTime,
    String? notes,
  }) async {
    final data = {
      'propertyId': propertyId,
      'scheduledDate': scheduledDate,
      'scheduledTime': scheduledTime,
      if (notes != null) 'notes': notes,
    };
    
    final response = await _dioService.post<Map<String, dynamic>>(
      '/bookings',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final booking = BookingModel.fromJson(response.data!);
      return ApiResponse.success(booking, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to create booking');
  }
  
  // Update booking status
  Future<ApiResponse<BookingModel>> updateBookingStatus({
    required String bookingId,
    required String status, // pending, confirmed, cancelled, completed
  }) async {
    final data = {
      'status': status,
    };
    
    final response = await _dioService.put<Map<String, dynamic>>(
      '/bookings/$bookingId',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final booking = BookingModel.fromJson(response.data!);
      return ApiResponse.success(booking, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to update booking');
  }
  
  // Cancel booking
  Future<ApiResponse<BookingModel>> cancelBooking(String bookingId) async {
    return await updateBookingStatus(
      bookingId: bookingId,
      status: 'cancelled',
    );
  }
  
  // Confirm booking (for property owners/agents)
  Future<ApiResponse<BookingModel>> confirmBooking(String bookingId) async {
    return await updateBookingStatus(
      bookingId: bookingId,
      status: 'confirmed',
    );
  }
  
  // Complete booking
  Future<ApiResponse<BookingModel>> completeBooking(String bookingId) async {
    return await updateBookingStatus(
      bookingId: bookingId,
      status: 'completed',
    );
  }
  
  // Get booking by ID
  Future<ApiResponse<BookingModel>> getBookingById(String bookingId) async {
    final response = await _dioService.get<Map<String, dynamic>>(
      '/bookings/$bookingId',
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final booking = BookingModel.fromJson(response.data!);
      return ApiResponse.success(booking, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to fetch booking');
  }
  
  // Delete booking
  Future<ApiResponse<void>> deleteBooking(String bookingId) async {
    return await _dioService.delete<void>('/bookings/$bookingId');
  }
}
