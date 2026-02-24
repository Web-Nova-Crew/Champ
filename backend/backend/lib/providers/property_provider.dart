import 'package:flutter/foundation.dart';
import '../models/property.dart';
import '../services/api_client.dart';

class PropertyProvider with ChangeNotifier {
  List<Property> _properties = [];
  List<Property> _filteredProperties = [];
  List<Property> _favoriteProperties = [];
  List<String> _favoriteIds = [];
  String _searchQuery = '';
  String _selectedPropertyType = 'All';
  String _selectedTransactionType = 'All';
  String _selectedArea = 'All';
  double _minPrice = 0;
  double _maxPrice = double.infinity;
  int _minBedrooms = 0;
  int _maxBedrooms = 10;
  int _minBathrooms = 0;
  int _maxBathrooms = 10;
  double _minSize = 0;
  double _maxSize = double.infinity;
  bool? _isFurnished;
  bool _isLoading = false;
  String? _errorMessage;

  List<Property> get properties => _filteredProperties.isEmpty && _searchQuery.isEmpty 
      ? _properties 
      : _filteredProperties;
  
  List<Property> get featuredProperties => 
      _properties.where((p) => p.isFeatured).toList();
  
  List<Property> get favoriteProperties => _favoriteProperties;
  List<String> get favoriteIds => _favoriteIds;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  PropertyProvider() {
    loadProperties();
  }

  /// Load properties from API
  Future<void> loadProperties({
    String? propertyType,
    String? transactionType,
    double? minPrice,
    double? maxPrice,
    String? area,
    String? search,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiClient.getProperties(
        propertyType: propertyType != 'All' ? propertyType : null,
        transactionType: transactionType != 'All' ? transactionType : null,
        minPrice: minPrice,
        maxPrice: maxPrice,
        area: area != 'All' ? area : null,
        search: search,
      );

      if (response['success'] == true) {
        final List<dynamic> data = response['data'] ?? [];
        _properties = data.map((json) => Property.fromJson(json)).toList();
        _filteredProperties = List.from(_properties);
      } else {
        _errorMessage = response['error'] ?? 'Failed to load properties';
        // Load sample data as fallback
        _loadSampleProperties();
      }
    } catch (e) {
      _errorMessage = 'Network error. Showing cached data.';
      _loadSampleProperties();
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Load favorites from API
  Future<void> loadFavorites() async {
    try {
      final response = await ApiClient.getFavorites();
      if (response['success'] == true) {
        final List<dynamic> data = response['data'] ?? [];
        // New API returns properties directly with favoriteId field
        _favoriteProperties = data.map((item) => Property.fromJson(item)).toList();
        _favoriteIds = _favoriteProperties.map((p) => p.id).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading favorites: $e');
    }
  }

  /// Load just favorite IDs for quick checks
  Future<void> loadFavoriteIds() async {
    try {
      final response = await ApiClient.getFavoriteIds();
      if (response['success'] == true) {
        final List<dynamic> data = response['data'] ?? [];
        _favoriteIds = data.map((id) => id.toString()).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading favorite IDs: $e');
    }
  }

  /// Add property to favorites via API
  Future<bool> addToFavorites(String propertyId) async {
    try {
      // Optimistic update
      if (!_favoriteIds.contains(propertyId)) {
        _favoriteIds.add(propertyId);
        final property = getPropertyById(propertyId);
        if (property != null && !_favoriteProperties.any((p) => p.id == propertyId)) {
          _favoriteProperties.add(property);
        }
        notifyListeners();
      }

      final response = await ApiClient.addFavorite(propertyId);
      if (response['success'] == true) {
        return true;
      } else {
        // Revert on failure
        _favoriteIds.remove(propertyId);
        _favoriteProperties.removeWhere((p) => p.id == propertyId);
        notifyListeners();
        debugPrint('Add favorite failed: ${response['error']}');
      }
    } catch (e) {
      // Revert on error
      _favoriteIds.remove(propertyId);
      _favoriteProperties.removeWhere((p) => p.id == propertyId);
      notifyListeners();
      debugPrint('Add favorite error: $e');
    }
    return false;
  }

  /// Remove property from favorites via API
  Future<bool> removeFromFavorites(String propertyId) async {
    // Store for potential revert
    final wasInFavorites = _favoriteIds.contains(propertyId);
    final removedProperty = _favoriteProperties.where((p) => p.id == propertyId).toList();
    
    try {
      // Optimistic update
      _favoriteIds.remove(propertyId);
      _favoriteProperties.removeWhere((p) => p.id == propertyId);
      notifyListeners();

      final response = await ApiClient.removeFavorite(propertyId);
      if (response['success'] == true) {
        return true;
      } else {
        // Revert on failure
        if (wasInFavorites) {
          _favoriteIds.add(propertyId);
          _favoriteProperties.addAll(removedProperty);
          notifyListeners();
        }
        debugPrint('Remove favorite failed: ${response['error']}');
      }
    } catch (e) {
      // Revert on error
      if (wasInFavorites) {
        _favoriteIds.add(propertyId);
        _favoriteProperties.addAll(removedProperty);
        notifyListeners();
      }
      debugPrint('Remove favorite error: $e');
    }
    return false;
  }

  /// Toggle favorite status using the toggle API
  Future<bool> toggleFavorite(String propertyId) async {
    final wasInFavorites = _favoriteIds.contains(propertyId);
    final property = getPropertyById(propertyId);
    
    try {
      // Optimistic update
      if (wasInFavorites) {
        _favoriteIds.remove(propertyId);
        _favoriteProperties.removeWhere((p) => p.id == propertyId);
      } else {
        _favoriteIds.add(propertyId);
        if (property != null && !_favoriteProperties.any((p) => p.id == propertyId)) {
          _favoriteProperties.add(property);
        }
      }
      notifyListeners();

      final response = await ApiClient.toggleFavorite(propertyId);
      if (response['success'] == true) {
        return true;
      } else {
        // Revert on failure
        if (wasInFavorites) {
          _favoriteIds.add(propertyId);
          if (property != null) _favoriteProperties.add(property);
        } else {
          _favoriteIds.remove(propertyId);
          _favoriteProperties.removeWhere((p) => p.id == propertyId);
        }
        notifyListeners();
        debugPrint('Toggle favorite failed: ${response['error']}');
      }
    } catch (e) {
      // Revert on error
      if (wasInFavorites) {
        _favoriteIds.add(propertyId);
        if (property != null) _favoriteProperties.add(property);
      } else {
        _favoriteIds.remove(propertyId);
        _favoriteProperties.removeWhere((p) => p.id == propertyId);
      }
      notifyListeners();
      debugPrint('Toggle favorite error: $e');
    }
    return false;
  }

  /// Check if property is favorite
  bool isFavorite(String propertyId) {
    return _favoriteIds.contains(propertyId);
  }

  /// Create property via API
  Future<bool> createProperty(Property property) async {
    try {
      final response = await ApiClient.createProperty(property.toJson());
      if (response['success'] == true) {
        final newProperty = Property.fromJson(response['data']);
        _properties.insert(0, newProperty);
        _applyFilters();
        return true;
      }
    } catch (e) {
      // Handle error silently
    }
    return false;
  }

  /// Update property via API
  Future<bool> updateProperty(String id, Map<String, dynamic> updates) async {
    try {
      final response = await ApiClient.updateProperty(id, updates);
      if (response['success'] == true) {
        final index = _properties.indexWhere((p) => p.id == id);
        if (index != -1) {
          _properties[index] = Property.fromJson(response['data']);
          _applyFilters();
        }
        return true;
      }
    } catch (e) {
      // Handle error silently
    }
    return false;
  }

  /// Delete property via API
  Future<bool> deleteProperty(String id) async {
    try {
      final response = await ApiClient.deleteProperty(id);
      if (response['success'] == true) {
        _properties.removeWhere((p) => p.id == id);
        _applyFilters();
        return true;
      }
    } catch (e) {
      // Handle error silently
    }
    return false;
  }

  /// Fallback sample properties when API fails
  void _loadSampleProperties() {
    _properties = [
      Property(
        id: '1',
        title: '3 BHK Luxury Apartment in Gomti Nagar',
        description: 'Spacious 3 BHK apartment with modern amenities in the heart of Gomti Nagar.',
        price: 8500000,
        propertyType: 'Apartment',
        transactionType: 'Buy',
        location: 'Gomti Nagar, Lucknow',
        area: 'Gomti Nagar',
        size: 1850,
        bedrooms: 3,
        bathrooms: 3,
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
        ownerId: '1',
        ownerName: 'Rajesh Kumar',
        ownerPhone: '+91 9876543210',
        amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security'],
        isFurnished: true,
        yearBuilt: 2020,
        listedDate: DateTime.now().subtract(const Duration(days: 5)),
        isFeatured: true,
      ),
      Property(
        id: '2',
        title: '2 BHK Flat for Rent in Hazratganj',
        description: 'Well-maintained 2 BHK flat in prime Hazratganj area.',
        price: 25000,
        propertyType: 'Apartment',
        transactionType: 'Rent',
        location: 'Hazratganj, Lucknow',
        area: 'Hazratganj',
        size: 1200,
        bedrooms: 2,
        bathrooms: 2,
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        ownerId: '2',
        ownerName: 'Priya Sharma',
        ownerPhone: '+91 9876543211',
        amenities: ['Parking', 'Security', 'Power Backup'],
        isFurnished: false,
        yearBuilt: 2018,
        listedDate: DateTime.now().subtract(const Duration(days: 2)),
        isFeatured: true,
      ),
      Property(
        id: '3',
        title: 'Independent House in Aliganj',
        description: 'Beautiful 4 BHK independent house with garden and parking.',
        price: 12000000,
        propertyType: 'House',
        transactionType: 'Buy',
        location: 'Aliganj, Lucknow',
        area: 'Aliganj',
        size: 2500,
        bedrooms: 4,
        bathrooms: 4,
        images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
        ownerId: '3',
        ownerName: 'Amit Singh',
        ownerPhone: '+91 9876543212',
        amenities: ['Garden', 'Parking', 'Security'],
        isFurnished: true,
        yearBuilt: 2019,
        listedDate: DateTime.now().subtract(const Duration(days: 10)),
        isFeatured: false,
      ),
    ];
    _filteredProperties = List.from(_properties);
  }

  void searchProperties(String query) {
    _searchQuery = query;
    _applyFilters();
  }

  void filterByPropertyType(String type) {
    _selectedPropertyType = type;
    _applyFilters();
  }

  void filterByTransactionType(String type) {
    _selectedTransactionType = type;
    _applyFilters();
  }

  void filterByArea(String area) {
    _selectedArea = area;
    _applyFilters();
  }

  void filterByPriceRange(double min, double max) {
    _minPrice = min;
    _maxPrice = max;
    _applyFilters();
  }

  void filterByBedrooms(int min, int max) {
    _minBedrooms = min;
    _maxBedrooms = max;
    _applyFilters();
  }

  void filterByBathrooms(int min, int max) {
    _minBathrooms = min;
    _maxBathrooms = max;
    _applyFilters();
  }

  void filterBySize(double min, double max) {
    _minSize = min;
    _maxSize = max;
    _applyFilters();
  }

  void filterByFurnished(bool? isFurnished) {
    _isFurnished = isFurnished;
    _applyFilters();
  }

  void _applyFilters() {
    _filteredProperties = _properties.where((property) {
      bool matchesSearch = _searchQuery.isEmpty ||
          property.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          property.description.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          property.location.toLowerCase().contains(_searchQuery.toLowerCase());

      bool matchesPropertyType = _selectedPropertyType == 'All' ||
          property.propertyType == _selectedPropertyType;

      bool matchesTransactionType = _selectedTransactionType == 'All' ||
          property.transactionType == _selectedTransactionType;

      bool matchesArea = _selectedArea == 'All' ||
          property.area == _selectedArea;

      bool matchesPrice = property.price >= _minPrice && 
          property.price <= _maxPrice;

      bool matchesBedrooms = property.bedrooms >= _minBedrooms &&
          property.bedrooms <= _maxBedrooms;

      bool matchesBathrooms = property.bathrooms >= _minBathrooms &&
          property.bathrooms <= _maxBathrooms;

      bool matchesSize = property.size >= _minSize &&
          property.size <= _maxSize;

      bool matchesFurnished = _isFurnished == null ||
          property.isFurnished == _isFurnished;

      return matchesSearch && 
             matchesPropertyType && 
             matchesTransactionType && 
             matchesArea && 
             matchesPrice &&
             matchesBedrooms &&
             matchesBathrooms &&
             matchesSize &&
             matchesFurnished;
    }).toList();

    notifyListeners();
  }

  void clearFilters() {
    _searchQuery = '';
    _selectedPropertyType = 'All';
    _selectedTransactionType = 'All';
    _selectedArea = 'All';
    _minPrice = 0;
    _maxPrice = double.infinity;
    _minBedrooms = 0;
    _maxBedrooms = 10;
    _minBathrooms = 0;
    _maxBathrooms = 10;
    _minSize = 0;
    _maxSize = double.infinity;
    _isFurnished = null;
    _filteredProperties = List.from(_properties);
    notifyListeners();
  }

  // Getters for current filter values
  double get minPrice => _minPrice;
  double get maxPrice => _maxPrice;
  int get minBedrooms => _minBedrooms;
  int get maxBedrooms => _maxBedrooms;
  int get minBathrooms => _minBathrooms;
  int get maxBathrooms => _maxBathrooms;
  double get minSize => _minSize;
  double get maxSize => _maxSize;
  bool? get isFurnished => _isFurnished;

  Property? getPropertyById(String id) {
    try {
      return _properties.firstWhere((p) => p.id == id);
    } catch (e) {
      return null;
    }
  }

  void addProperty(Property property) {
    _properties.insert(0, property);
    _applyFilters();
  }

  void removeProperty(String id) {
    _properties.removeWhere((p) => p.id == id);
    _applyFilters();
  }
}

