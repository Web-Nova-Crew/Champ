import 'dio_service.dart';
import 'api_constants.dart';
import '../models/api_response.dart';
import '../models/property_model.dart';

class FavoritesService {
  static FavoritesService? _instance;
  final DioService _dioService = DioService.instance;
  
  FavoritesService._internal();
  
  static FavoritesService get instance {
    _instance ??= FavoritesService._internal();
    return _instance!;
  }
  
  // Get user favorites
  Future<ApiResponse<List<PropertyModel>>> getFavorites({
    int? page = 1,
    int? limit = 20,
  }) async {
    final queryParams = <String, dynamic>{};
    
    if (page != null) queryParams['page'] = page;
    if (limit != null) queryParams['limit'] = limit;
    
    final response = await _dioService.get<List<dynamic>>(
      '/favorites',
      queryParameters: queryParams,
      fromJson: (json) => json as List<dynamic>,
    );
    
    if (response.isSuccess && response.data != null) {
      final favorites = response.data!
          .map((json) => PropertyModel.fromJson(json as Map<String, dynamic>))
          .toList();
      return ApiResponse.success(favorites, response.message);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to fetch favorites');
  }
  
  // Add property to favorites
  Future<ApiResponse<void>> addToFavorites(String propertyId) async {
    final data = {
      'propertyId': propertyId,
    };
    
    return await _dioService.post<void>(
      '/favorites',
      data: data,
    );
  }
  
  // Remove property from favorites
  Future<ApiResponse<void>> removeFromFavorites(String propertyId) async {
    return await _dioService.delete<void>('/favorites/$propertyId');
  }
  
  // Check if property is in favorites
  Future<ApiResponse<bool>> isFavorite(String propertyId) async {
    final response = await getFavorites();
    
    if (response.isSuccess && response.data != null) {
      final isFav = response.data!.any((property) => property.id == propertyId);
      return ApiResponse.success(isFav);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to check favorite status');
  }
  
  // Toggle favorite status
  Future<ApiResponse<bool>> toggleFavorite(String propertyId) async {
    final favoriteCheck = await isFavorite(propertyId);
    
    if (favoriteCheck.isSuccess) {
      final isFav = favoriteCheck.data ?? false;
      
      if (isFav) {
        final removeResponse = await removeFromFavorites(propertyId);
        if (removeResponse.isSuccess) {
          return ApiResponse.success(false, 'Removed from favorites');
        } else {
          return ApiResponse.error(removeResponse.error ?? 'Failed to remove from favorites');
        }
      } else {
        final addResponse = await addToFavorites(propertyId);
        if (addResponse.isSuccess) {
          return ApiResponse.success(true, 'Added to favorites');
        } else {
          return ApiResponse.error(addResponse.error ?? 'Failed to add to favorites');
        }
      }
    }
    
    return ApiResponse.error(favoriteCheck.error ?? 'Failed to toggle favorite');
  }
  
  // Get favorites count
  Future<ApiResponse<int>> getFavoritesCount() async {
    final response = await getFavorites();
    
    if (response.isSuccess && response.data != null) {
      return ApiResponse.success(response.data!.length);
    }
    
    return ApiResponse.error(response.error ?? 'Failed to get favorites count');
  }
}
