import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../models/property.dart';
import '../../providers/property_provider.dart';
import '../../utils/app_colors.dart';

class PropertyComparisonScreen extends StatefulWidget {
  const PropertyComparisonScreen({super.key});

  @override
  State<PropertyComparisonScreen> createState() => _PropertyComparisonScreenState();
}

class _PropertyComparisonScreenState extends State<PropertyComparisonScreen> {
  List<Property> _selectedProperties = [];
  
  @override
  Widget build(BuildContext context) {
    final propertyProvider = Provider.of<PropertyProvider>(context);
    final allProperties = propertyProvider.properties;
    
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Compare Properties',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        actions: [
          if (_selectedProperties.isNotEmpty)
            TextButton(
              onPressed: () {
                setState(() {
                  _selectedProperties.clear();
                });
              },
              child: Text(
                'Clear',
                style: GoogleFonts.poppins(color: AppColors.secondary),
              ),
            ),
        ],
      ),
      body: _selectedProperties.length < 2
          ? _buildPropertySelector(allProperties)
          : _buildComparisonView(),
      bottomNavigationBar: _selectedProperties.isNotEmpty && _selectedProperties.length < 3
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      '${_selectedProperties.length}/3 properties selected',
                      style: GoogleFonts.poppins(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  if (_selectedProperties.length >= 2)
                    ElevatedButton(
                      onPressed: () {
                        setState(() {});
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                      ),
                      child: Text(
                        'Compare Now',
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                    ),
                ],
              ),
            )
          : null,
    );
  }
  
  Widget _buildPropertySelector(List<Property> properties) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            'Select 2-3 properties to compare',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: properties.length,
            itemBuilder: (context, index) {
              final property = properties[index];
              final isSelected = _selectedProperties.contains(property);
              
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.border,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(12),
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      property.images.isNotEmpty 
                          ? property.images.first 
                          : 'https://via.placeholder.com/80',
                      width: 60,
                      height: 60,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 60,
                        height: 60,
                        color: AppColors.backgroundDark,
                        child: Icon(Icons.home, color: AppColors.primary),
                      ),
                    ),
                  ),
                  title: Text(
                    property.title,
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(
                    '₹${_formatPrice(property.price)} • ${property.area}',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  trailing: Checkbox(
                    value: isSelected,
                    activeColor: AppColors.primary,
                    onChanged: _selectedProperties.length >= 3 && !isSelected
                        ? null
                        : (value) {
                            setState(() {
                              if (value == true) {
                                _selectedProperties.add(property);
                              } else {
                                _selectedProperties.remove(property);
                              }
                            });
                          },
                  ),
                  onTap: () {
                    if (_selectedProperties.length < 3 || _selectedProperties.contains(property)) {
                      setState(() {
                        if (_selectedProperties.contains(property)) {
                          _selectedProperties.remove(property);
                        } else {
                          _selectedProperties.add(property);
                        }
                      });
                    }
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }
  
  Widget _buildComparisonView() {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Property Images Row
          Container(
            height: 200,
            child: Row(
              children: _selectedProperties.map((property) {
                return Expanded(
                  child: Container(
                    margin: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      image: DecorationImage(
                        image: NetworkImage(
                          property.images.isNotEmpty 
                              ? property.images.first 
                              : 'https://via.placeholder.com/200',
                        ),
                        fit: BoxFit.cover,
                      ),
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.7),
                          ],
                        ),
                      ),
                      padding: const EdgeInsets.all(12),
                      alignment: Alignment.bottomLeft,
                      child: Text(
                        property.title,
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          
          // Comparison Table
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildComparisonRow('Price', _selectedProperties.map((p) => '₹${_formatPrice(p.price)}').toList(), isHighlight: true),
                _buildComparisonRow('Type', _selectedProperties.map((p) => p.propertyType).toList()),
                _buildComparisonRow('Transaction', _selectedProperties.map((p) => p.transactionType).toList()),
                _buildComparisonRow('Area', _selectedProperties.map((p) => p.area).toList()),
                _buildComparisonRow('Size', _selectedProperties.map((p) => '${p.size} sq.ft').toList()),
                _buildComparisonRow('Bedrooms', _selectedProperties.map((p) => '${p.bedrooms} BHK').toList()),
                _buildComparisonRow('Bathrooms', _selectedProperties.map((p) => '${p.bathrooms}').toList()),
                _buildComparisonRow('Furnished', _selectedProperties.map((p) => p.isFurnished ? 'Yes' : 'No').toList()),
                _buildComparisonRow('Year Built', _selectedProperties.map((p) => '${p.yearBuilt}').toList()),
                _buildComparisonRow('Price/sq.ft', _selectedProperties.map((p) => '₹${(p.price / p.size).toStringAsFixed(0)}').toList(), isHighlight: true),
              ],
            ),
          ),
          
          // Amenities Comparison
          Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Amenities',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._getAllAmenities().map((amenity) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: Text(
                              amenity,
                              style: GoogleFonts.poppins(fontSize: 13),
                            ),
                          ),
                          ..._selectedProperties.map((property) {
                            final hasAmenity = property.amenities.contains(amenity);
                            return Expanded(
                              child: Icon(
                                hasAmenity ? Icons.check_circle : Icons.cancel,
                                color: hasAmenity ? AppColors.success : Colors.grey[300],
                                size: 20,
                              ),
                            );
                          }).toList(),
                        ],
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),
          ),
          
          // Back to Selection Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: OutlinedButton.icon(
              onPressed: () {
                setState(() {
                  _selectedProperties.clear();
                });
              },
              icon: const Icon(Icons.arrow_back),
              label: Text(
                'Select Different Properties',
                style: GoogleFonts.poppins(),
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                side: BorderSide(color: AppColors.primary),
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
  
  Widget _buildComparisonRow(String label, List<String> values, {bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isHighlight ? AppColors.primaryUltraLight : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          ...values.map((value) {
            return Expanded(
              child: Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: isHighlight ? FontWeight.w600 : FontWeight.normal,
                  color: isHighlight ? AppColors.primary : AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
  
  List<String> _getAllAmenities() {
    final Set<String> allAmenities = {};
    for (var property in _selectedProperties) {
      allAmenities.addAll(property.amenities);
    }
    return allAmenities.toList()..sort();
  }
  
  String _formatPrice(double price) {
    if (price >= 10000000) {
      return '${(price / 10000000).toStringAsFixed(2)} Cr';
    } else if (price >= 100000) {
      return '${(price / 100000).toStringAsFixed(2)} L';
    }
    return price.toStringAsFixed(0);
  }
}
