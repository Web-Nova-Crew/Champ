class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final String? error;
  final int? statusCode;
  
  const ApiResponse._({
    required this.success,
    this.data,
    this.message,
    this.error,
    this.statusCode,
  });
  
  // Success response
  factory ApiResponse.success(T? data, [String? message]) {
    return ApiResponse._(
      success: true,
      data: data,
      message: message,
    );
  }
  
  // Error response
  factory ApiResponse.error(String error, [int? statusCode]) {
    return ApiResponse._(
      success: false,
      error: error,
      statusCode: statusCode,
    );
  }
  
  // Loading state (for UI)
  factory ApiResponse.loading() {
    return const ApiResponse._(success: false);
  }
  
  bool get isSuccess => success;
  bool get isError => !success && error != null;
  bool get isLoading => !success && error == null;
  
  @override
  String toString() {
    if (success) {
      return 'ApiResponse.success(data: $data, message: $message)';
    } else {
      return 'ApiResponse.error(error: $error, statusCode: $statusCode)';
    }
  }
}
