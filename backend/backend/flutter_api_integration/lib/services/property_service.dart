import 'dart:io';
import 'dio_service.dart';
import 'api_constants.dart';
import '../models/api_response.dart';
import '../models/property_model.dart';

class PropertyService {
  static PropertyService? _instance;
  final DioService _dioService = DioService.instance;
  
  PropertyService._internal();
  
  static PropertyService get instance {
    _instance ??= PropertyService._internal();
    return _instance!;
  }
  
  // Get all properties with optional filters
  Future<ApiResponse<List<PropertyModel>>> getProperties({
    String? propertyType,
    String? transactionType,
    double? minPrice,
    double? maxPrice,
    String? location,
    String? area,
    int? bedrooms,
    int? bathrooms,
    bool? isFurnished,
    int? page = 1,
    int? limit = 20,
  }) async {
    final queryParams = <String, dynamic>{};
    
    if (propertyType != null) queryParams['propertyType'] = propertyType;
    if (transactionType != null) queryParams['transactionType'] = transactionType;
    if (minPrice != null) queryParams['minPrice'] = minPrice;
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice;
    if (location != null) queryParams['location'] = location;
    if (area != null) queryParams['area'] = area;
    if (bedrooms != null) queryParams['bedrooms'] = bedrooms;
    if (bathrooms != null) queryParams['bathrooms'] = bathrooms;
    if (isFurnished != null) queryParams['isFurnished'] = isFurnished;
    if (page != null) queryParams['page'] = page;
    if (limit != null) queryParams['limit'] = limit;
    
    final response = await _dioService.get<List<dynamic>>(
      '/properties',
      queryParameters: queryParams,
      fromJson: (json) => json as List<dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final properties = response.data!
          .map((json) => PropertyModel.fromJson(json as Map<String, dynamic>))
          .toList();
      return ApiResponse.success(properties, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to fetch properties');
  }
  
  // Get property by ID
  Future<ApiResponse<PropertyModel>> getPropertyById(String propertyId) async {
    final response = await _dioService.get<Map<String, dynamic>>(
      '/properties/$propertyId',
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final property = PropertyModel.fromJson(response.data!);
      return ApiResponse.success(property, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to fetch property');
  }
  
  // Create new property
  Future<ApiResponse<PropertyModel>> createProperty({
    required String title,
    required String description,
    required double price,
    required String propertyType,
    required String transactionType,
    required String location,
    required String area,
    required int size,
    required int bedrooms,
    required int bathrooms,
    required List<String> amenities,
    required bool isFurnished,
    List<File>? images,
  }) async {
    final data = {
      'title': title,
      'description': description,
      'price': price,
      'propertyType': propertyType,
      'transactionType': transactionType,
      'location': location,
      'area': area,
      'size': size,
      'bedrooms': bedrooms,
      'bathrooms': bathrooms,
      'amenities': amenities,
      'isFurnished': isFurnished,
    };
    
    ApiResponse<Map<String, dynamic>> response;
    
    if (images != null && images.isNotEmpty) {
      // Upload with images using multipart form data
      response = await _dioService.uploadFile<Map<String, dynamic>>(
        '/properties',
        images.first.path,
        fieldName: 'images',
        additionalData: data,
        fromJson: (json) => json as Map<String, dynamic>,
      );
    } else {
      // Upload without images
      response = await _dioService.post<Map<String, dynamic>>(
        '/properties',
        data: data,
        fromJson: (json) => json as Map<String, dynamic>,
      );
    }
    
    if (response.isSuccess && response.data != null) {
      final property = PropertyModel.fromJson(response.data!);
      return ApiResponse.success(property, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to create property');
  }
  
  // Update property
  Future<ApiResponse<PropertyModel>> updateProperty({
    required String propertyId,
    String? title,
    String? description,
    double? price,
    String? propertyType,
    String? transactionType,
    String? location,
    String? area,
    int? size,
    int? bedrooms,
    int? bathrooms,
    List<String>? amenities,
    bool? isFurnished,
  }) async {
    final data = <String, dynamic>{};
    
    if (title != null) data['title'] = title;
    if (description != null) data['description'] = description;
    if (price != null) data['price'] = price;
    if (propertyType != null) data['propertyType'] = propertyType;
    if (transactionType != null) data['transactionType'] = transactionType;
    if (location != null) data['location'] = location;
    if (area != null) data['area'] = area;
    if (size != null) data['size'] = size;
    if (bedrooms != null) data['bedrooms'] = bedrooms;
    if (bathrooms != null) data['bathrooms'] = bathrooms;
    if (amenities != null) data['amenities'] = amenities;
    if (isFurnished != null) data['isFurnished'] = isFurnished;
    
    final response = await _dioService.put<Map<String, dynamic>>(
      '/properties/$propertyId',
      data: data,
      fromJson: (json) => json as Map<String, dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final property = PropertyModel.fromJson(response.data!);
      return ApiResponse.success(property, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to update property');
  }
  
  // Delete property
  Future<ApiResponse<void>> deleteProperty(String propertyId) async {
    return await _dioService.delete<void>('/properties/$propertyId');
  }
  
  // Get similar properties
  Future<ApiResponse<List<PropertyModel>>> getSimilarProperties(String propertyId) async {
    final response = await _dioService.get<List<dynamic>>(
      '/properties/$propertyId/similar',
      fromJson: (json) => json as List<dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final properties = response.data!
          .map((json) => PropertyModel.fromJson(json as Map<String, dynamic>))
          .toList();
      return ApiResponse.success(properties, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to fetch similar properties');
  }
  
  // Search properties
  Future<ApiResponse<List<PropertyModel>>> searchProperties({
    required String query,
    String? propertyType,
    String? transactionType,
    double? minPrice,
    double? maxPrice,
  }) async {
    final queryParams = <String, dynamic>{
      'search': query,
    };
    
    if (propertyType != null) queryParams['propertyType'] = propertyType;
    if (transactionType != null) queryParams['transactionType'] = transactionType;
    if (minPrice != null) queryParams['minPrice'] = minPrice;
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice;
    
    final response = await _dioService.get<List<dynamic>>(
      '/properties',
      queryParameters: queryParams,
      fromJson: (json) => json as List<dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final properties = response.data!
          .map((json) => PropertyModel.fromJson(json as Map<String, dynamic>))
          .toList();
      return ApiResponse.success(properties, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to search properties');
  }
}
