import 'package:flutter/foundation.dart';
import '../models/property.dart';
import '../services/api_client.dart';

class PropertyProvider with ChangeNotifier {
  List<Property> _properties = [];
  List<Property> _filteredProperties = [];
  List<Property> _favoriteProperties = [];
  List<Property> _userProperties = [];
  Property? _selectedProperty;
  bool _isLoading = false;
  String? _errorMessage;
  String _currentFilter = 'All';
  String _currentPropertyTypeFilter = 'All';
  String _searchQuery = '';

  // Advanced filters state
  int _minBedrooms = 0;
  int _maxBedrooms = 10;
  int _minBathrooms = 0;
  int _maxBathrooms = 10;
  bool? _isFurnished;
  double _minPrice = 0;
  double _maxPrice = 100000000;
  double _minSize = 0;
  double _maxSize = double.infinity;

  List<Property> get properties => _filteredProperties.isEmpty && _searchQuery.isEmpty 
      ? _properties 
      : _filteredProperties;
  List<Property> get allProperties => _properties;
  List<Property> get favoriteProperties => _favoriteProperties;
  List<Property> get userProperties => _userProperties;
  Property? get selectedProperty => _selectedProperty;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get currentFilter => _currentFilter;
  
  // Getters for advanced filters
  int get minBedrooms => _minBedrooms;
  int get maxBedrooms => _maxBedrooms;
  int get minBathrooms => _minBathrooms;
  int get maxBathrooms => _maxBathrooms;
  bool? get isFurnished => _isFurnished;
  double get minPrice => _minPrice;
  double get maxPrice => _maxPrice;
  double get minSize => _minSize;
  double get maxSize => _maxSize;

  PropertyProvider() {
    loadProperties();
  }

  Future<void> loadProperties() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiClient.getProperties();

      if (response['success'] == true) {
        final List<dynamic> data = response['data'] ?? [];
        _properties = data.map((json) => Property.fromJson(json)).toList();
        _filteredProperties = [];
      } else {
        _errorMessage = response['error'] ?? 'Failed to load properties';
        _loadSampleProperties();
      }
    } catch (error) {
      _errorMessage = 'Network error. Showing sample properties.';
      _loadSampleProperties();
    }

    _isLoading = false;
    notifyListeners();
  }

  void _loadSampleProperties() {
    _properties = [
      Property(
        id: '1',
        title: 'Luxury Villa in Gomti Nagar',
        description: 'Beautiful 4BHK villa with modern amenities, garden, and parking.',
        price: 25000000,
        location: 'Gomti Nagar, Lucknow',
        latitude: 26.8500,
        longitude: 80.9500,
        propertyType: 'Villa',
        transactionType: 'Buy',
        bedrooms: 4,
        bathrooms: 4,
        size: 3500,
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
        amenities: ['Garden', 'Parking', 'Swimming Pool', 'Gym'],
        isFeatured: true,
        ownerName: 'Rahul Sharma',
        ownerPhone: '+91-9876543210',
        listedDate: DateTime.now(),
        area: 'Gomti Nagar',
        ownerId: 'owner1',
        yearBuilt: 2020,
        isFurnished: true,
      ),
      Property(
        id: '2',
        title: 'Modern Apartment in Hazratganj',
        description: 'Spacious 3BHK apartment in the heart of Lucknow.',
        price: 8500000,
        location: 'Hazratganj, Lucknow',
        latitude: 26.8467,
        longitude: 80.9462,
        propertyType: 'Apartment',
        transactionType: 'Buy',
        bedrooms: 3,
        bathrooms: 2,
        size: 1800,
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
        amenities: ['Lift', 'Security', 'Power Backup', 'Parking'],
        isFeatured: true,
        ownerName: 'Priya Singh',
        ownerPhone: '+91-9876543211',
        listedDate: DateTime.now(),
        area: 'Hazratganj',
        ownerId: 'owner2',
        yearBuilt: 2021,
        isFurnished: false,
      ),
      Property(
        id: '3',
        title: 'Cozy 2BHK for Rent in Aliganj',
        description: 'Well-maintained 2BHK flat available for rent.',
        price: 18000,
        location: 'Aliganj, Lucknow',
        latitude: 26.8900,
        longitude: 80.9300,
        propertyType: 'Apartment',
        transactionType: 'Rent',
        bedrooms: 2,
        bathrooms: 2,
        size: 1200,
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        amenities: ['Parking', 'Water Supply', 'Near Market'],
        isFeatured: false,
        ownerName: 'Amit Kumar',
        ownerPhone: '+91-9876543212',
        listedDate: DateTime.now(),
        area: 'Aliganj',
        ownerId: 'owner3',
        yearBuilt: 2018,
        isFurnished: true,
      ),
      Property(
        id: '4',
        title: 'Commercial Shop in Aminabad',
        description: 'Prime location shop for business.',
        price: 50000,
        location: 'Aminabad, Lucknow',
        latitude: 26.8400,
        longitude: 80.9200,
        propertyType: 'Shop',
        transactionType: 'Rent',
        bedrooms: 0,
        bathrooms: 1,
        size: 500,
        images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
        amenities: ['Power Backup', 'Security', 'Parking'],
        isFeatured: false,
        ownerName: 'Vikram Verma',
        ownerPhone: '+91-9876543213',
        listedDate: DateTime.now(),
        area: 'Aminabad',
        ownerId: 'owner4',
        yearBuilt: 2015,
        isFurnished: false,
      ),
      Property(
        id: '5',
        title: 'PG Accommodation in Indira Nagar',
        description: 'Fully furnished PG with all amenities for students and professionals.',
        price: 8000,
        location: 'Indira Nagar, Lucknow',
        latitude: 26.8700,
        longitude: 80.9600,
        propertyType: 'PG',
        transactionType: 'PG',
        bedrooms: 1,
        bathrooms: 1,
        size: 200,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
        amenities: ['WiFi', 'Meals', 'Laundry', 'AC'],
        isFeatured: false,
        ownerName: 'Sunita Devi',
        ownerPhone: '+91-9876543214',
        listedDate: DateTime.now(),
        area: 'Indira Nagar',
        ownerId: 'owner5',
        yearBuilt: 2022,
        isFurnished: true,
      ),
    ];
    _filteredProperties = [];
  }

  void searchProperties(String query) {
    _searchQuery = query.toLowerCase();
    if (query.isEmpty) {
      _filteredProperties = [];
    } else {
      _filteredProperties = _properties.where((property) {
        return property.title.toLowerCase().contains(_searchQuery) ||
            property.location.toLowerCase().contains(_searchQuery) ||
            property.propertyType.toLowerCase().contains(_searchQuery) ||
            property.description.toLowerCase().contains(_searchQuery);
      }).toList();
    }
    notifyListeners();
  }

  void filterByTransactionType(String type) {
    _currentFilter = type;
    if (type == 'All') {
      _filteredProperties = [];
    } else {
      _filteredProperties = _properties.where((property) {
        return property.transactionType.toLowerCase() == type.toLowerCase();
      }).toList();
    }
    notifyListeners();
  }

  void filterByPropertyType(String type) {
    _currentPropertyTypeFilter = type;
    if (type == 'All') {
      if (_currentFilter == 'All') {
        _filteredProperties = [];
      } else {
        filterByTransactionType(_currentFilter);
      }
    } else {
      var filtered = _properties.where((property) {
        return property.propertyType.toLowerCase() == type.toLowerCase();
      }).toList();
      
      if (_currentFilter != 'All') {
        filtered = filtered.where((property) {
          return property.transactionType.toLowerCase() == _currentFilter.toLowerCase();
        }).toList();
      }
      
      _filteredProperties = filtered;
    }
    notifyListeners();
  }

  void filterByBedrooms(int min, int max) {
    _minBedrooms = min;
    _maxBedrooms = max;
    _filteredProperties = _properties.where((property) {
      return property.bedrooms >= min && property.bedrooms <= max;
    }).toList();
    notifyListeners();
  }

  void filterByBathrooms(int min, int max) {
    _minBathrooms = min;
    _maxBathrooms = max;
    _filteredProperties = _properties.where((property) {
      return property.bathrooms >= min && property.bathrooms <= max;
    }).toList();
    notifyListeners();
  }

  void filterBySize(double min, double max) {
    _minSize = min;
    _maxSize = max;
    _filteredProperties = _properties.where((property) {
      return property.size >= min && property.size <= max;
    }).toList();
    notifyListeners();
  }

  void filterByFurnished(bool? isFurnished) {
    _isFurnished = isFurnished;
    if (isFurnished == null) {
      // Show all properties regardless of furnished status
      notifyListeners();
      return;
    }
    _filteredProperties = _properties.where((property) {
      return property.isFurnished == isFurnished;
    }).toList();
    notifyListeners();
  }

  void filterByPriceRange(double min, double max) {
    _minPrice = min;
    _maxPrice = max;
    _filteredProperties = _properties.where((property) {
      return property.price >= min && property.price <= max;
    }).toList();
    notifyListeners();
  }

  void clearFilters() {
    _currentFilter = 'All';
    _currentPropertyTypeFilter = 'All';
    _searchQuery = '';
    _filteredProperties = [];
    _minBedrooms = 0;
    _maxBedrooms = 10;
    _minBathrooms = 0;
    _maxBathrooms = 10;
    _isFurnished = null;
    _minPrice = 0;
    _maxPrice = 100000000;
    _minSize = 0;
    _maxSize = double.infinity;
    notifyListeners();
  }

  List<Property> get featuredProperties {
    return _properties.where((p) => p.isFeatured).toList();
  }

  void setSelectedProperty(Property property) {
    _selectedProperty = property;
    notifyListeners();
  }

  Future<void> loadFavorites() async {
    try {
      final response = await ApiClient.getFavorites();
      if (response['success'] == true) {
        final List<dynamic> data = response['data'] ?? [];
        _favoriteProperties = data.map((json) => Property.fromJson(json)).toList();
        notifyListeners();
      }
    } catch (error) {
      // Handle error silently
    }
  }

  Future<bool> toggleFavorite(String propertyId) async {
    try {
      final isFavorite = _favoriteProperties.any((p) => p.id == propertyId);
      
      final response = isFavorite
          ? await ApiClient.removeFavorite(propertyId)
          : await ApiClient.addFavorite(propertyId);

      if (response['success'] == true) {
        if (isFavorite) {
          _favoriteProperties.removeWhere((p) => p.id == propertyId);
        } else {
          final property = _properties.firstWhere(
            (p) => p.id == propertyId,
            orElse: () => _favoriteProperties.first,
          );
          _favoriteProperties.add(property);
        }
        notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  bool isFavorite(String propertyId) {
    return _favoriteProperties.any((p) => p.id == propertyId);
  }

  Future<void> loadUserProperties() async {
    try {
      final response = await ApiClient.getUserProperties();
      if (response['success'] == true) {
        final List<dynamic> data = response['data'] ?? [];
        _userProperties = data.map((json) => Property.fromJson(json)).toList();
        notifyListeners();
      }
    } catch (error) {
      // Handle error silently
    }
  }

  Future<bool> addProperty(Property property) async {
    try {
      final response = await ApiClient.createProperty(property.toJson());
      if (response['success'] == true) {
        // Reload all properties to include the new one
        await loadProperties();
        // Also reload user properties to update pending list
        await loadUserProperties();
        return true;
      }
      _errorMessage = response['error'] ?? 'Failed to add property';
      notifyListeners();
      return false;
    } catch (error) {
      _errorMessage = 'Network error. Please try again.';
      notifyListeners();
      return false;
    }
  }

  Future<bool> removeProperty(String id) async {
    try {
      final response = await ApiClient.deleteProperty(id);
      if (response['success'] == true) {
        _properties.removeWhere((p) => p.id == id);
        _userProperties.removeWhere((p) => p.id == id);
        notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  Future<bool> updateProperty(Property property) async {
    try {
      final response = await ApiClient.updateProperty(property.id, property.toJson());
      if (response['success'] == true) {
        await loadProperties();
        return true;
      }
      _errorMessage = response['error'] ?? 'Failed to update property';
      notifyListeners();
      return false;
    } catch (error) {
      _errorMessage = 'Network error. Please try again.';
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteProperty(String propertyId) async {
    try {
      final response = await ApiClient.deleteProperty(propertyId);
      if (response['success'] == true) {
        _properties.removeWhere((p) => p.id == propertyId);
        _userProperties.removeWhere((p) => p.id == propertyId);
        notifyListeners();
        return true;
      }
      _errorMessage = response['error'] ?? 'Failed to delete property';
      notifyListeners();
      return false;
    } catch (error) {
      _errorMessage = 'Network error. Please try again.';
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
