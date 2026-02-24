import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../../providers/property_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/property_card.dart';
import '../../models/user.dart';
import '../property/add_property_screen.dart';
import '../profile/profile_screen.dart';
import '../profile/saved_properties_screen.dart';
import '../dashboard/agent_dashboard_screen.dart';
import '../dashboard/landlord_dashboard_screen.dart';
import '../dashboard/owner_dashboard_screen.dart';
import '../../utils/app_colors.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  int _selectedIndex = 0;
  String _selectedTransactionType = 'All';
  String _selectedPropertyType = 'All';

  final List<String> _transactionTypes = [
    'All',
    'Buy',
    'Rent',
    'Lease',
    'Room Rent',
    'PG',
    'Co-living',
    'Short-term Rent',
    'Lease-to-Own',
  ];
  final List<String> _propertyTypes = [
    'All',
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

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.currentUser;
    
    // Route to role-specific dashboards
    if (_selectedIndex == 0 && user != null) {
      if (user.userType == UserType.agent) {
        return const AgentDashboardScreen();
      } else if (user.userType == UserType.landlord) {
        return const LandlordDashboardScreen();
      } else if (user.userType == UserType.owner) {
        return const OwnerDashboardScreen();
      }
    }
    
    return Scaffold(
      body: _selectedIndex == 0 ? _buildHomeContent() : _buildOtherContent(),
      bottomNavigationBar: _buildBottomNavigationBar(),
      floatingActionButton: _buildFloatingActionButton(),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  Widget _buildHomeContent() {
    final propertyProvider = Provider.of<PropertyProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);

    return SafeArea(
      child: CustomScrollView(
        slivers: [
          // App Bar
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: AppColors.primaryGradient,
                ),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Hello, ${(authProvider.currentUser?.name.isNotEmpty == true) ? authProvider.currentUser!.name : "User"}!',
                              style: GoogleFonts.poppins(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on, size: 16, color: AppColors.accent),
                                const SizedBox(width: 4),
                                Text(
                                  'लखनऊ, उत्तर प्रदेश 🏠',
                                  style: GoogleFonts.poppins(
                                    fontSize: 14,
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      CircleAvatar(
                        radius: 25,
                        backgroundColor: AppColors.secondary,
                        child: Text(
                          (authProvider.currentUser?.name.isNotEmpty == true) ? authProvider.currentUser!.name[0].toUpperCase() : 'U',
                          style: GoogleFonts.poppins(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  
                  // Search Bar
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (value) {
                        propertyProvider.searchProperties(value);
                      },
                      decoration: InputDecoration(
                        hintText: 'Search properties, locations...',
                        hintStyle: GoogleFonts.poppins(
                          color: Colors.grey[400],
                          fontSize: 14,
                        ),
                        prefixIcon: const Icon(Icons.search, color: AppColors.primary),
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.tune, color: AppColors.primary),
                          onPressed: () {
                            Navigator.pushNamed(context, '/advanced-filters');
                          },
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Transaction Type Filter
          SliverToBoxAdapter(
            child: Container(
              height: 50,
              margin: const EdgeInsets.symmetric(vertical: 16),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _transactionTypes.length,
                itemBuilder: (context, index) {
                  final type = _transactionTypes[index];
                  final isSelected = _selectedTransactionType == type;
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedTransactionType = type;
                      });
                      propertyProvider.filterByTransactionType(
                        type == 'All' ? 'All' : type,
                      );
                    },
                    child: Container(
                      margin: const EdgeInsets.only(right: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : Colors.grey[200],
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Center(
                        child: Text(
                          type,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isSelected ? Colors.white : Colors.grey[700],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          
          // Quick Tools Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: _buildQuickToolCard(
                      icon: Icons.calculate_outlined,
                      title: 'EMI Calculator',
                      color: AppColors.primary,
                      onTap: () => Navigator.pushNamed(context, '/emi-calculator'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildQuickToolCard(
                      icon: Icons.compare_arrows,
                      title: 'Compare',
                      color: AppColors.secondary,
                      onTap: () => Navigator.pushNamed(context, '/compare-properties'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildQuickToolCard(
                      icon: Icons.history,
                      title: 'Recent',
                      color: AppColors.accent,
                      onTap: () => Navigator.pushNamed(context, '/recently-viewed'),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Popular Lucknow Areas Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'Popular Areas ',
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                      Text(
                        '📍',
                        style: TextStyle(fontSize: 18),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Lucknow ke mashhoor mohalle',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 40,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        _buildAreaChip('Gomti Nagar', '🏢'),
                        _buildAreaChip('Hazratganj', '🛍️'),
                        _buildAreaChip('Aliganj', '🏠'),
                        _buildAreaChip('Indira Nagar', '🌳'),
                        _buildAreaChip('Mahanagar', '🏘️'),
                        _buildAreaChip('Sushant Golf City', '⛳'),
                        _buildAreaChip('Jankipuram', '🏡'),
                        _buildAreaChip('Chinhat', '🌿'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Featured Properties
          if (propertyProvider.featuredProperties.isNotEmpty)
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Featured Properties',
                          style: GoogleFonts.poppins(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                        TextButton(
                          onPressed: () {},
                          child: Text(
                            'View All',
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              color: AppColors.secondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  CarouselSlider(
                    options: CarouselOptions(
                      height: 180,
                      autoPlay: true,
                      enlargeCenterPage: true,
                      viewportFraction: 0.85,
                    ),
                    items: propertyProvider.featuredProperties.take(5).map((property) {
                      return Builder(
                        builder: (BuildContext context) {
                          return GestureDetector(
                            onTap: () {
                              // Navigate to property detail
                            },
                            child: Container(
                              width: MediaQuery.of(context).size.width,
                              margin: const EdgeInsets.symmetric(horizontal: 5),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(15),
                                image: DecorationImage(
                                  image: NetworkImage(property.images.isNotEmpty 
                                      ? property.images[0] 
                                      : 'https://via.placeholder.com/400x200'),
                                  fit: BoxFit.cover,
                                ),
                              ),
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(15),
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.transparent,
                                      Colors.black.withOpacity(0.7),
                                    ],
                                  ),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        property.title,
                                        style: GoogleFonts.poppins(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        property.location,
                                        style: GoogleFonts.poppins(
                                          fontSize: 12,
                                          color: Colors.white70,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          
          // All Properties Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Text(
                'All Properties',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
          
          // Property List
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: propertyProvider.properties.isEmpty
                ? SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.home_work_outlined, size: 80, color: Colors.grey[300]),
                          const SizedBox(height: 16),
                          Text(
                            'No properties found',
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        return PropertyCard(property: propertyProvider.properties[index]);
                      },
                      childCount: propertyProvider.properties.length,
                    ),
                  ),
          ),
          
          const SliverToBoxAdapter(
            child: SizedBox(height: 80),
          ),
        ],
      ),
    );
  }

  Widget _buildOtherContent() {
    if (_selectedIndex == 1) {
      return const SavedPropertiesScreen();
    } else if (_selectedIndex == 4) {
      return const ProfileScreen();
    }
    return const SizedBox();
  }

  Widget _buildBottomNavigationBar() {
    return BottomNavigationBar(
      currentIndex: _selectedIndex,
      onTap: (index) {
        if (index == 2) {
          // FAB space - do nothing
          return;
        } else if (index == 3) {
          // Chat button
          Navigator.pushNamed(context, '/chats');
        } else {
          setState(() {
            _selectedIndex = index;
          });
        }
      },
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: Colors.grey,
      selectedLabelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12),
      unselectedLabelStyle: GoogleFonts.poppins(fontSize: 12),
      items: [
        const BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Home',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.favorite),
          label: 'Favorites',
        ),
        const BottomNavigationBarItem(
          icon: SizedBox(width: 40),
          label: '',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.chat),
          label: 'Chats',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Profile',
        ),
      ],
    );
  }

  Widget _buildFloatingActionButton() {
    return FloatingActionButton(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const AddPropertyScreen()),
        );
      },
      backgroundColor: AppColors.secondary,
      child: const Icon(Icons.add, size: 32, color: Colors.white),
    );
  }

  Widget _buildQuickToolCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              title,
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAreaChip(String area, String emoji) {
    return GestureDetector(
      onTap: () {
        Provider.of<PropertyProvider>(context, listen: false).searchProperties(area);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$area mein properties dhundh rahe hain...'),
            duration: const Duration(seconds: 1),
            backgroundColor: AppColors.primary,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.primary.withOpacity(0.1), AppColors.secondary.withOpacity(0.1)],
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.primary.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 6),
            Text(
              area,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Filter Properties',
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  Text(
                    'Property Type',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _propertyTypes.map((type) {
                      final isSelected = _selectedPropertyType == type;
                      return FilterChip(
                        label: Text(
                          type,
                          style: GoogleFonts.poppins(),
                        ),
                        selected: isSelected,
                        onSelected: (selected) {
                          setModalState(() {
                            _selectedPropertyType = type;
                          });
                          Provider.of<PropertyProvider>(context, listen: false)
                              .filterByPropertyType(type);
                        },
                        backgroundColor: Colors.grey[200],
                        selectedColor: AppColors.primary,
                        labelStyle: GoogleFonts.poppins(
                          color: isSelected ? Colors.white : Colors.grey[700],
                          fontWeight: FontWeight.w600,
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),
                  
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      child: const Text('Apply Filters'),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: TextButton(
                      onPressed: () {
                        setModalState(() {
                          _selectedPropertyType = 'All';
                          _selectedTransactionType = 'All';
                        });
                        Provider.of<PropertyProvider>(context, listen: false).clearFilters();
                        Navigator.pop(context);
                      },
                      child: const Text('Clear Filters'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

