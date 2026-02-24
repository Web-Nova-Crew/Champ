import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/property_provider.dart';
import '../../utils/app_colors.dart';

class AdvancedFiltersScreen extends StatefulWidget {
  const AdvancedFiltersScreen({super.key});

  @override
  State<AdvancedFiltersScreen> createState() => _AdvancedFiltersScreenState();
}

class _AdvancedFiltersScreenState extends State<AdvancedFiltersScreen> {
  late PropertyProvider _propertyProvider;
  late RangeValues _priceRange;
  late RangeValues _sizeRange;
  late int _minBedrooms;
  late int _maxBedrooms;
  late int _minBathrooms;
  late int _maxBathrooms;
  bool? _isFurnished;
  String? _selectedArea;

  // Popular Lucknow Areas
  final List<String> _lucknowAreas = [
    'All Areas',
    'Gomti Nagar',
    'Hazratganj',
    'Aliganj',
    'Indira Nagar',
    'Mahanagar',
    'Aminabad',
    'Chowk',
    'Alambagh',
    'Rajajipuram',
    'Vikas Nagar',
    'Jankipuram',
    'Chinhat',
    'Faizabad Road',
    'Kanpur Road',
    'Sitapur Road',
    'Aashiana',
    'Sushant Golf City',
    'Shaheed Path',
    'Vrindavan Yojana',
    'Gomti Nagar Extension',
    'Raebareli Road',
    'IIM Road',
    'Telibagh',
    'Kursi Road',
  ];

  @override
  void initState() {
    super.initState();
    _propertyProvider = Provider.of<PropertyProvider>(context, listen: false);
    
    // Get max values from properties
    final properties = _propertyProvider.properties;
    double maxPrice = 100000000;
    double maxSize = 10000;
    if (properties.isNotEmpty) {
      maxPrice = properties.map((p) => p.price).reduce((a, b) => a > b ? a : b);
      maxSize = properties.map((p) => p.size).reduce((a, b) => a > b ? a : b);
      // Add some padding
      maxPrice = maxPrice * 1.2;
      maxSize = maxSize * 1.2;
    }

    _priceRange = RangeValues(
      _propertyProvider.minPrice,
      _propertyProvider.maxPrice == double.infinity ? maxPrice : _propertyProvider.maxPrice,
    );
    _sizeRange = RangeValues(
      _propertyProvider.minSize,
      _propertyProvider.maxSize == double.infinity ? maxSize : _propertyProvider.maxSize,
    );
    _minBedrooms = _propertyProvider.minBedrooms;
    _maxBedrooms = _propertyProvider.maxBedrooms;
    _minBathrooms = _propertyProvider.minBathrooms;
    _maxBathrooms = _propertyProvider.maxBathrooms;
    _isFurnished = _propertyProvider.isFurnished;
  }

  String _formatPrice(double price) {
    if (price >= 10000000) {
      return '₹${(price / 10000000).toStringAsFixed(2)} Cr';
    } else if (price >= 100000) {
      return '₹${(price / 100000).toStringAsFixed(2)} Lac';
    } else {
      return '₹${price.toStringAsFixed(0)}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Advanced Filters',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        actions: [
          TextButton(
            onPressed: () {
              _propertyProvider.clearFilters();
              Navigator.pop(context);
            },
            child: Text(
              'Clear All',
              style: GoogleFonts.poppins(
                color: AppColors.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: AppColors.backgroundGradient,
          ),
        ),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Lucknow Areas Section
            _buildSection(
              title: 'Lucknow Areas 📍',
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _lucknowAreas.map((area) {
                  final isSelected = _selectedArea == area || (_selectedArea == null && area == 'All Areas');
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedArea = area == 'All Areas' ? null : area;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                        ),
                        boxShadow: isSelected ? [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ] : null,
                      ),
                      child: Text(
                        area,
                        style: GoogleFonts.poppins(
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 24),

            // Price Range
            _buildSection(
              title: 'Price Range',
              child: Column(
                children: [
                  RangeSlider(
                    values: _priceRange,
                    min: 0,
                    max: 100000000,
                    divisions: 100,
                    labels: RangeLabels(
                      _formatPrice(_priceRange.start),
                      _formatPrice(_priceRange.end),
                    ),
                    onChanged: (values) {
                      setState(() {
                        _priceRange = values;
                      });
                    },
                    activeColor: AppColors.primary,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatPrice(_priceRange.start),
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        _formatPrice(_priceRange.end),
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Size Range
            _buildSection(
              title: 'Size (sq ft)',
              child: Column(
                children: [
                  RangeSlider(
                    values: _sizeRange,
                    min: 0,
                    max: 10000,
                    divisions: 100,
                    labels: RangeLabels(
                      '${_sizeRange.start.toInt()} sq ft',
                      '${_sizeRange.end.toInt()} sq ft',
                    ),
                    onChanged: (values) {
                      setState(() {
                        _sizeRange = values;
                      });
                    },
                    activeColor: AppColors.primary,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${_sizeRange.start.toInt()} sq ft',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        '${_sizeRange.end.toInt()} sq ft',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Bedrooms
            _buildSection(
              title: 'Bedrooms',
              child: Row(
                children: [
                  Expanded(
                    child: _buildNumberSelector(
                      label: 'Min',
                      value: _minBedrooms,
                      max: 10,
                      onChanged: (value) {
                        setState(() {
                          _minBedrooms = value;
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildNumberSelector(
                      label: 'Max',
                      value: _maxBedrooms,
                      max: 10,
                      onChanged: (value) {
                        setState(() {
                          _maxBedrooms = value;
                        });
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Bathrooms
            _buildSection(
              title: 'Bathrooms',
              child: Row(
                children: [
                  Expanded(
                    child: _buildNumberSelector(
                      label: 'Min',
                      value: _minBathrooms,
                      max: 10,
                      onChanged: (value) {
                        setState(() {
                          _minBathrooms = value;
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildNumberSelector(
                      label: 'Max',
                      value: _maxBathrooms,
                      max: 10,
                      onChanged: (value) {
                        setState(() {
                          _maxBathrooms = value;
                        });
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Furnished
            _buildSection(
              title: 'Furnishing',
              child: Row(
                children: [
                  Expanded(
                    child: _buildFurnishedOption('All', null),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildFurnishedOption('Furnished', true),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildFurnishedOption('Unfurnished', false),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 40),

            // Apply Button
            Container(
              height: 56,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  colors: AppColors.primaryGradient,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.4),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    _propertyProvider.filterByPriceRange(
                      _priceRange.start,
                      _priceRange.end,
                    );
                    _propertyProvider.filterByBedrooms(_minBedrooms, _maxBedrooms);
                    _propertyProvider.filterByBathrooms(_minBathrooms, _maxBathrooms);
                    _propertyProvider.filterBySize(_sizeRange.start, _sizeRange.end);
                    _propertyProvider.filterByFurnished(_isFurnished);
                    Navigator.pop(context);
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    alignment: Alignment.center,
                    child: Text(
                      'Apply Filters',
                      style: GoogleFonts.poppins(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({required String title, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildNumberSelector({
    required String label,
    required int value,
    required int max,
    required ValueChanged<int> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.primaryUltraLight,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline),
                onPressed: value > 0 ? () => onChanged(value - 1) : null,
                color: AppColors.primary,
              ),
              Text(
                value.toString(),
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle_outline),
                onPressed: value < max ? () => onChanged(value + 1) : null,
                color: AppColors.primary,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFurnishedOption(String label, bool? value) {
    final isSelected = _isFurnished == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _isFurnished = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }
}

