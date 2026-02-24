import 'package:flutter/foundation.dart';
import '../models/booking.dart';
import '../services/api_client.dart';

class BookingProvider with ChangeNotifier {
  List<Booking> _bookings = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Booking> get bookings => _bookings;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  BookingProvider() {
    // Don't auto-load - will be loaded when user is authenticated
  }

  /// Load bookings from API
  Future<void> loadBookings({String? status}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiClient.getBookings(status: status);
      if (response['success'] == true) {
        final List<dynamic> data = response['data'] ?? [];
        _bookings = data.map((json) => Booking.fromJson(json)).toList();
      } else {
        _errorMessage = response['error'] ?? 'Failed to load bookings';
      }
    } catch (e) {
      _errorMessage = 'Network error. Please try again.';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Create booking via API
  Future<bool> createBooking({
    required String propertyId,
    required String propertyTitle,
    required String propertyOwnerId,
    required String propertyOwnerName,
    required String propertyOwnerPhone,
    required String bookerId,
    required String bookerName,
    required String bookerPhone,
    required String bookerEmail,
    required DateTime scheduledDate,
    required String scheduledTime,
    String? notes,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiClient.createBooking(
        propertyId: propertyId,
        scheduledDate: scheduledDate.toIso8601String(),
        scheduledTime: scheduledTime,
        notes: notes,
      );

      if (response['success'] == true) {
        // Create local booking object from response or provided data
        final booking = Booking(
          id: response['data']?['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
          propertyId: propertyId,
          propertyTitle: propertyTitle,
          propertyOwnerId: propertyOwnerId,
          propertyOwnerName: propertyOwnerName,
          propertyOwnerPhone: propertyOwnerPhone,
          bookerId: bookerId,
          bookerName: bookerName,
          bookerPhone: bookerPhone,
          bookerEmail: bookerEmail,
          scheduledDate: scheduledDate,
          scheduledTime: scheduledTime,
          notes: notes,
          status: BookingStatus.pending,
          createdAt: DateTime.now(),
        );

        _bookings.insert(0, booking);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = response['error'] ?? 'Failed to create booking';
      }
    } catch (e) {
      _errorMessage = 'Network error. Please try again.';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// Update booking status via API
  Future<bool> updateBookingStatus(String bookingId, BookingStatus status) async {
    try {
      final response = await ApiClient.updateBooking(
        bookingId,
        status.toString().split('.').last,
      );

      if (response['success'] == true) {
        final index = _bookings.indexWhere((booking) => booking.id == bookingId);
        if (index != -1) {
          final booking = _bookings[index];
          _bookings[index] = Booking(
            id: booking.id,
            propertyId: booking.propertyId,
            propertyTitle: booking.propertyTitle,
            propertyOwnerId: booking.propertyOwnerId,
            propertyOwnerName: booking.propertyOwnerName,
            propertyOwnerPhone: booking.propertyOwnerPhone,
            bookerId: booking.bookerId,
            bookerName: booking.bookerName,
            bookerPhone: booking.bookerPhone,
            bookerEmail: booking.bookerEmail,
            scheduledDate: booking.scheduledDate,
            scheduledTime: booking.scheduledTime,
            notes: booking.notes,
            status: status,
            createdAt: booking.createdAt,
            updatedAt: DateTime.now(),
          );
          notifyListeners();
        }
        return true;
      }
    } catch (e) {
      // Handle error silently
    }
    return false;
  }

  List<Booking> getBookingsForUser(String userId) {
    return _bookings.where((booking) =>
        booking.propertyOwnerId == userId || booking.bookerId == userId).toList();
  }

  List<Booking> getBookingsForProperty(String propertyId) {
    return _bookings.where((booking) => booking.propertyId == propertyId).toList();
  }

  List<Booking> getPendingBookings(String userId) {
    return _bookings.where((booking) =>
        (booking.propertyOwnerId == userId || booking.bookerId == userId) &&
        booking.status == BookingStatus.pending).toList();
  }

  Future<void> cancelBooking(String bookingId) async {
    await updateBookingStatus(bookingId, BookingStatus.cancelled);
  }

  Future<void> confirmBooking(String bookingId) async {
    await updateBookingStatus(bookingId, BookingStatus.confirmed);
  }
}

