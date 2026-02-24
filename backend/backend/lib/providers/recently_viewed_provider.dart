import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class RecentlyViewedProvider with ChangeNotifier {
  List<String> _recentlyViewedIds = [];
  static const int maxItems = 20;
  static const String _storageKey = 'recently_viewed_properties';
  
  List<String> get recentlyViewedIds => _recentlyViewedIds;
  
  RecentlyViewedProvider() {
    _loadRecentlyViewed();
  }
  
  Future<void> _loadRecentlyViewed() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final data = prefs.getString(_storageKey);
      if (data != null) {
        _recentlyViewedIds = List<String>.from(json.decode(data));
        notifyListeners();
      }
    } catch (e) {
      // Handle error silently
    }
  }
  
  Future<void> addProperty(String propertyId) async {
    // Remove if already exists (to move to front)
    _recentlyViewedIds.remove(propertyId);
    
    // Add to front
    _recentlyViewedIds.insert(0, propertyId);
    
    // Keep only maxItems
    if (_recentlyViewedIds.length > maxItems) {
      _recentlyViewedIds = _recentlyViewedIds.sublist(0, maxItems);
    }
    
    await _saveRecentlyViewed();
    notifyListeners();
  }
  
  Future<void> removeProperty(String propertyId) async {
    _recentlyViewedIds.remove(propertyId);
    await _saveRecentlyViewed();
    notifyListeners();
  }
  
  Future<void> clearAll() async {
    _recentlyViewedIds.clear();
    await _saveRecentlyViewed();
    notifyListeners();
  }
  
  Future<void> _saveRecentlyViewed() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_storageKey, json.encode(_recentlyViewedIds));
    } catch (e) {
      // Handle error silently
    }
  }
  
  bool isRecentlyViewed(String propertyId) {
    return _recentlyViewedIds.contains(propertyId);
  }
}
