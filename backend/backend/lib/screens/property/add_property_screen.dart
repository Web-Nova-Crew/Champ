import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/property.dart';
import '../../providers/property_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_colors.dart';

class AddPropertyScreen extends StatefulWidget {
  final Property? property;
  final bool isEditing;

  const AddPropertyScreen({
    super.key,
    this.property,
    this.isEditing = false,
  });

  @override
  State<AddPropertyScreen> createState() => _AddPropertyScreenState();
}

class _AddPropertyScreenState extends State<AddPropertyScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _sizeController = TextEditingController();
  final _yearBuiltController = TextEditingController();
  final _phoneController = TextEditingController();

  String _selectedPropertyType = 'Apartment';
  String _selectedTransactionType = 'Buy';
  String _selectedArea = 'Gomti Nagar';
  int _bedrooms = 1;
  int _bathrooms = 1;
  bool _isFurnished = false;
  final List<String> _selectedAmenities = [];
  final List<String> _imageUrls = [];

  final List<String> _propertyTypes = [
    'Apartment',
    'House',
    'Villa',
    'Room',
    'PG',
    'Commercial',
    'Shop',
    'Warehouse',
    'Plot',
    'Farmhouse',
    'Studio',
    'Penthouse',
    'Office Space',
  ];
  final List<String> _transactionTypes = [
    'Buy',
    'Rent',
    'Lease',
    'Room Rent',
    'PG',
    'Co-living',
    'Short-term Rent',
    'Lease-to-Own',
  ];
  final List<String> _lucknowAreas = [
    'Gomti Nagar',
    'Hazratganj',
    'Aliganj',
    'Indira Nagar',
    'Jankipuram',
    'Aminabad',
    'Alambagh',
    'Rajajipuram',
    'Mahanagar',
    'Chowk',
  ];
  final List<String> _availableAmenities = [
    'Swimming Pool',
    'Gym',
    'Parking',
    'Security',
    'Power Backup',
    'Lift',
    'Garden',
    'Club House',
    'Play Area',
    'Wi-Fi',
    'AC',
    'Furnished',
    'Modular Kitchen',
    'Balcony',
    'Power Backup',
    'Water Supply',
    'Near Metro',
    'Near School',
    'Near Hospital',
    'Near Market',
    '24/7 Security',
    'CCTV',
    'Maintenance Staff',
    'Housekeeping',
    'Laundry',
    'Mess Facility',
    'Study Room',
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _sizeController.dispose();
    _yearBuiltController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      // Store the actual file path for multipart upload
      setState(() {
        _imageUrls.add(image.path);
      });
    }
  }

  Future<void> _handleSubmit() async {
    if (_formKey.currentState!.validate()) {
      if (_imageUrls.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Please add at least one image',
              style: GoogleFonts.poppins(),
            ),
          ),
        );
        return;
      }

      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.currentUser!;

      final property = Property(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: _titleController.text,
        description: _descriptionController.text,
        price: double.parse(_priceController.text),
        propertyType: _selectedPropertyType,
        transactionType: _selectedTransactionType,
        location: '$_selectedArea, Lucknow',
        area: _selectedArea,
        size: double.parse(_sizeController.text),
        bedrooms: _bedrooms,
        bathrooms: _bathrooms,
        images: _imageUrls,
        ownerId: user.id,
        ownerName: user.name,
        ownerPhone: _phoneController.text.isNotEmpty ? _phoneController.text : user.phone,
        amenities: _selectedAmenities,
        isFurnished: _isFurnished,
        yearBuilt: int.parse(_yearBuiltController.text),
        listedDate: DateTime.now(),
      );

      // Create property via API
      final success = await Provider.of<PropertyProvider>(context, listen: false).createProperty(property);

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Property listed successfully!',
              style: GoogleFonts.poppins(),
            ),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Failed to list property. Please try again.',
              style: GoogleFonts.poppins(),
            ),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Add Property',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Images Section
            Text(
              'Property Images',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 120,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  ..._imageUrls.map((url) => Container(
                        width: 120,
                        margin: const EdgeInsets.only(right: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          image: DecorationImage(
                            image: url.startsWith('http')
                                ? NetworkImage(url)
                                : FileImage(File(url)) as ImageProvider,
                            fit: BoxFit.cover,
                          ),
                        ),
                        child: Stack(
                          children: [
                            Positioned(
                              top: 4,
                              right: 4,
                              child: IconButton(
                                icon: const Icon(Icons.close, color: Colors.white),
                                onPressed: () {
                                  setState(() {
                                    _imageUrls.remove(url);
                                  });
                                },
                                style: IconButton.styleFrom(
                                  backgroundColor: Colors.red,
                                  padding: const EdgeInsets.all(4),
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),
                  GestureDetector(
                    onTap: _pickImage,
                    child: Container(
                      width: 120,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[300]!, width: 2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_photo_alternate, size: 40, color: Colors.grey[400]),
                          const SizedBox(height: 8),
                          Text(
                            'Add Photo',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Title
            TextFormField(
              controller: _titleController,
              decoration: InputDecoration(
                labelText: 'Property Title *',
                hintText: 'e.g., 3 BHK Luxury Apartment',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            ),
            const SizedBox(height: 16),

            // Description
            TextFormField(
              controller: _descriptionController,
              decoration: InputDecoration(
                labelText: 'Description *',
                hintText: 'Describe your property...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              maxLines: 4,
              validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            ),
            const SizedBox(height: 16),

            // Property Type
            DropdownButtonFormField<String>(
              value: _selectedPropertyType,
              decoration: InputDecoration(
                labelText: 'Property Type *',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              isExpanded: true,
              items: _propertyTypes.map((type) {
                return DropdownMenuItem(
                  value: type,
                  child: Text(
                    type,
                    style: GoogleFonts.poppins(fontSize: 14),
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedPropertyType = value!;
                });
              },
            ),
            const SizedBox(height: 16),

            // Transaction Type
            DropdownButtonFormField<String>(
              value: _selectedTransactionType,
              decoration: InputDecoration(
                labelText: 'Transaction Type *',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              isExpanded: true,
              items: _transactionTypes.map((type) {
                return DropdownMenuItem(
                  value: type,
                  child: Text(
                    type,
                    style: GoogleFonts.poppins(fontSize: 14),
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedTransactionType = value!;
                });
              },
            ),
            const SizedBox(height: 16),

            // Area in Lucknow
            DropdownButtonFormField<String>(
              value: _selectedArea,
              decoration: InputDecoration(
                labelText: 'Area in Lucknow *',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              items: _lucknowAreas.map((area) {
                return DropdownMenuItem(
                  value: area,
                  child: Text(
                    area,
                    style: GoogleFonts.poppins(),
                  ),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedArea = value!;
                });
              },
            ),
            const SizedBox(height: 16),

            // Price and Size
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _priceController,
                    decoration: InputDecoration(
                      labelText: 'Price (₹) *',
                      hintText: '5000000',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _sizeController,
                    decoration: InputDecoration(
                      labelText: 'Size (sq ft) *',
                      hintText: '1200',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Bedrooms and Bathrooms
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Bedrooms',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline),
                            onPressed: () {
                              if (_bedrooms > 0) {
                                setState(() => _bedrooms--);
                              }
                            },
                          ),
                          Text(
                            '$_bedrooms',
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline),
                            onPressed: () {
                              setState(() => _bedrooms++);
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Bathrooms',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline),
                            onPressed: () {
                              if (_bathrooms > 0) {
                                setState(() => _bathrooms--);
                              }
                            },
                          ),
                          Text(
                            '$_bathrooms',
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline),
                            onPressed: () {
                              setState(() => _bathrooms++);
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Year Built
            TextFormField(
              controller: _yearBuiltController,
              decoration: InputDecoration(
                labelText: 'Year Built *',
                hintText: '2020',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              keyboardType: TextInputType.number,
              validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            ),
            const SizedBox(height: 16),

            // Furnished
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[400]!),
                borderRadius: BorderRadius.circular(12),
              ),
              child: SwitchListTile(
                title: Text(
                  'Furnished',
                  style: GoogleFonts.poppins(fontSize: 14),
                ),
                subtitle: Text(
                  'Is the property furnished?',
                  style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600]),
                ),
                value: _isFurnished,
                onChanged: (value) {
                  setState(() {
                    _isFurnished = value;
                  });
                },
                activeColor: AppColors.primary,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12),
              ),
            ),
            const SizedBox(height: 16),

            // Contact Phone
            TextFormField(
              controller: _phoneController,
              decoration: InputDecoration(
                labelText: 'Contact Phone',
                hintText: '+91 9876543210',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 24),

            // Amenities
            Text(
              'Amenities',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _availableAmenities.map((amenity) {
                final isSelected = _selectedAmenities.contains(amenity);
                return FilterChip(
                  label: Text(amenity),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedAmenities.add(amenity);
                      } else {
                        _selectedAmenities.remove(amenity);
                      }
                    });
                  },
                  backgroundColor: Colors.grey[200],
                  selectedColor: AppColors.primary,
                  labelStyle: GoogleFonts.poppins(
                    color: isSelected ? Colors.white : Colors.grey[700],
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 32),

            // Submit Button
            SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: _handleSubmit,
                child: Text(
                  'List Property',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
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
}

