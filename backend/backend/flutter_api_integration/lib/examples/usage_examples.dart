import 'dart:io';
import 'package:flutter/material.dart';
import '../services/api_service_manager.dart';
import '../models/property_model.dart';
import '../models/user_model.dart';
import '../models/booking_model.dart';

/// Complete usage examples for all API services
class ApiUsageExamples {
  final ApiServiceManager _api = ApiServiceManager.instance;
  
  /// 1. Authentication Examples
  Future<void> authenticationExamples() async {
    // Register new user
    final registerResponse = await _api.auth.register(
      email: 'user@example.com',
      password: 'password123',
      name: 'John Doe',
      phone: '+919876543210',
      userType: 'buyer', // buyer, seller, agent
    );
    
    if (registerResponse.isSuccess) {
      print('Registration successful: ${registerResponse.data?.user.name}');
    } else {
      print('Registration failed: ${registerResponse.error}');
    }
    
    // Login user
    final loginResponse = await _api.auth.login(
      email: 'user@example.com',
      password: 'password123',
    );
    
    if (loginResponse.isSuccess) {
      print('Login successful: ${loginResponse.data?.user.name}');
      // Token is automatically set in all services
    }
    
    // Get current user
    final userResponse = await _api.auth.getCurrentUser();
    if (userResponse.isSuccess) {
      print('Current user: ${userResponse.data?.name}');
    }
    
    // Logout
    await _api.auth.logout();
  }
  
  /// 2. Property Management Examples
  Future<void> propertyExamples() async {
    // Get all properties with filters
    final propertiesResponse = await _api.property.getProperties(
      propertyType: 'Apartment',
      transactionType: 'Rent',
      minPrice: 10000,
      maxPrice: 50000,
      location: 'Mumbai',
      bedrooms: 2,
      page: 1,
      limit: 20,
    );
    
    if (propertiesResponse.isSuccess) {
      final properties = propertiesResponse.data ?? [];
      print('Found ${properties.length} properties');
      
      for (final property in properties) {
        print('Property: ${property.title} - ${property.formattedPrice}');
      }
    }
    
    // Get property by ID
    final propertyResponse = await _api.property.getPropertyById('property-id');
    if (propertyResponse.isSuccess) {
      final property = propertyResponse.data!;
      print('Property details: ${property.title}');
      print('Location: ${property.location}');
      print('Price: ${property.formattedPrice}');
      print('Bedrooms: ${property.bedrooms}');
      print('Bathrooms: ${property.bathrooms}');
    }
    
    // Create new property (for sellers/agents)
    final createResponse = await _api.property.createProperty(
      title: 'Beautiful 2BHK Apartment',
      description: 'Spacious apartment with modern amenities',
      price: 25000,
      propertyType: 'Apartment',
      transactionType: 'Rent',
      location: 'Mumbai',
      area: 'Bandra',
      size: 1200,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['Parking', 'Gym', 'Swimming Pool'],
      isFurnished: true,
      // images: [File('path/to/image1.jpg'), File('path/to/image2.jpg')],
    );
    
    if (createResponse.isSuccess) {
      print('Property created: ${createResponse.data?.id}');
    }
    
    // Search properties
    final searchResponse = await _api.property.searchProperties(
      query: 'apartment mumbai',
      propertyType: 'Apartment',
      minPrice: 20000,
      maxPrice: 40000,
    );
    
    if (searchResponse.isSuccess) {
      print('Search results: ${searchResponse.data?.length} properties');
    }
  }
  
  /// 3. User Profile Examples
  Future<void> userProfileExamples() async {
    // Get user profile
    final profileResponse = await _api.user.getUserProfile();
    if (profileResponse.isSuccess) {
      final user = profileResponse.data!;
      print('User: ${user.name} (${user.userType})');
      print('Email: ${user.email}');
      print('Phone: ${user.phone}');
      print('Verified: ${user.verified}');
    }
    
    // Update user profile
    final updateResponse = await _api.user.updateUserProfile(
      name: 'Updated Name',
      phone: '+919876543211',
      bio: 'Updated bio information',
    );
    
    if (updateResponse.isSuccess) {
      print('Profile updated successfully');
    }
    
    // Upload avatar
    // final avatarFile = File('path/to/avatar.jpg');
    // final avatarResponse = await _api.user.uploadAvatar(avatarFile);
    // if (avatarResponse.isSuccess) {
    //   print('Avatar uploaded: ${avatarResponse.data}');
    // }
    
    // Change password
    final passwordResponse = await _api.user.changePassword(
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123',
    );
    
    if (passwordResponse.isSuccess) {
      print('Password changed successfully');
    }
  }
  
  /// 4. Favorites Examples
  Future<void> favoritesExamples() async {
    // Get user favorites
    final favoritesResponse = await _api.favorites.getFavorites();
    if (favoritesResponse.isSuccess) {
      final favorites = favoritesResponse.data ?? [];
      print('User has ${favorites.length} favorite properties');
    }
    
    // Add to favorites
    final addResponse = await _api.favorites.addToFavorites('property-id');
    if (addResponse.isSuccess) {
      print('Added to favorites');
    }
    
    // Remove from favorites
    final removeResponse = await _api.favorites.removeFromFavorites('property-id');
    if (removeResponse.isSuccess) {
      print('Removed from favorites');
    }
    
    // Toggle favorite (smart add/remove)
    final toggleResponse = await _api.favorites.toggleFavorite('property-id');
    if (toggleResponse.isSuccess) {
      final isFavorite = toggleResponse.data ?? false;
      print('Property is ${isFavorite ? 'now' : 'no longer'} a favorite');
    }
    
    // Check if property is favorite
    final checkResponse = await _api.favorites.isFavorite('property-id');
    if (checkResponse.isSuccess) {
      final isFavorite = checkResponse.data ?? false;
      print('Property is ${isFavorite ? 'a' : 'not a'} favorite');
    }
  }
  
  /// 5. Booking Examples
  Future<void> bookingExamples() async {
    // Get user bookings
    final bookingsResponse = await _api.booking.getUserBookings(
      status: 'pending',
      page: 1,
      limit: 10,
    );
    
    if (bookingsResponse.isSuccess) {
      final bookings = bookingsResponse.data ?? [];
      print('User has ${bookings.length} bookings');
      
      for (final booking in bookings) {
        print('Booking: ${booking.id}');
        print('Property: ${booking.property?.title}');
        print('Date: ${booking.formattedScheduledDate}');
        print('Time: ${booking.formattedScheduledTime}');
        print('Status: ${booking.status}');
      }
    }
    
    // Create new booking
    final createResponse = await _api.booking.createBooking(
      propertyId: 'property-id',
      scheduledDate: '2024-12-25',
      scheduledTime: '14:30',
      notes: 'Interested in viewing this property',
    );
    
    if (createResponse.isSuccess) {
      print('Booking created: ${createResponse.data?.id}');
    }
    
    // Update booking status (for property owners)
    final updateResponse = await _api.booking.confirmBooking('booking-id');
    if (updateResponse.isSuccess) {
      print('Booking confirmed');
    }
    
    // Cancel booking
    final cancelResponse = await _api.booking.cancelBooking('booking-id');
    if (cancelResponse.isSuccess) {
      print('Booking cancelled');
    }
  }
  
  /// 6. Chat Examples
  Future<void> chatExamples() async {
    // Get user chats
    final chatsResponse = await _api.chat.getChats();
    if (chatsResponse.isSuccess) {
      final chats = chatsResponse.data ?? [];
      print('User has ${chats.length} chats');
      
      for (final chat in chats) {
        print('Chat: ${chat.id}');
        print('Last message: ${chat.lastMessage}');
        print('Unread count: ${chat.unreadCount}');
      }
    }
    
    // Create new chat
    final createResponse = await _api.chat.createChat(
      participant2Id: 'other-user-id',
      propertyId: 'property-id', // Optional
    );
    
    if (createResponse.isSuccess) {
      print('Chat created: ${createResponse.data?.id}');
    }
    
    // Get chat messages
    final messagesResponse = await _api.chat.getChatMessages(
      chatId: 'chat-id',
      page: 1,
      limit: 50,
    );
    
    if (messagesResponse.isSuccess) {
      final messages = messagesResponse.data ?? [];
      print('Chat has ${messages.length} messages');
      
      for (final message in messages) {
        print('${message.sender?.name}: ${message.content}');
        print('Time: ${message.formattedTime}');
      }
    }
    
    // Send message
    final sendResponse = await _api.chat.sendMessage(
      chatId: 'chat-id',
      content: 'Hello! I am interested in your property.',
      messageType: 'text',
    );
    
    if (sendResponse.isSuccess) {
      print('Message sent: ${sendResponse.data?.id}');
    }
    
    // Mark messages as read
    final readResponse = await _api.chat.markMessagesAsRead('chat-id');
    if (readResponse.isSuccess) {
      print('Messages marked as read');
    }
  }
  
  /// 7. OTP Examples
  Future<void> otpExamples() async {
    // Send OTP to phone
    final sendResponse = await _api.otp.sendOtp(
      phone: '+919876543210',
      type: 'verification',
    );
    
    if (sendResponse.isSuccess) {
      final otpData = sendResponse.data!;
      print('OTP sent successfully');
      print('Expires in: ${otpData['expiresIn']} minutes');
      // In development, OTP might be returned in response
      if (otpData.containsKey('otp')) {
        print('Development OTP: ${otpData['otp']}');
      }
    }
    
    // Send OTP to email
    final emailOtpResponse = await _api.otp.sendEmailOtp(
      email: 'user@example.com',
      type: 'verification',
    );
    
    if (emailOtpResponse.isSuccess) {
      print('Email OTP sent successfully');
    }
    
    // Verify OTP
    final verifyResponse = await _api.otp.verifyOtp(
      phone: '+919876543210',
      otp: '123456',
    );
    
    if (verifyResponse.isSuccess) {
      print('OTP verified successfully');
    } else {
      print('OTP verification failed: ${verifyResponse.error}');
    }
    
    // Resend OTP
    final resendResponse = await _api.otp.resendOtp(
      phone: '+919876543210',
      type: 'verification',
    );
    
    if (resendResponse.isSuccess) {
      print('OTP resent successfully');
    }
  }
  
  /// 8. Complete User Flow Example
  Future<void> completeUserFlowExample() async {
    print('=== Complete User Flow Example ===');
    
    // 1. Register new user
    print('1. Registering user...');
    final registerResponse = await _api.auth.register(
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      phone: '+919876543210',
      userType: 'buyer',
    );
    
    if (!registerResponse.isSuccess) {
      print('Registration failed: ${registerResponse.error}');
      return;
    }
    
    print('✅ User registered successfully');
    
    // 2. Login user
    print('2. Logging in...');
    final loginResponse = await _api.auth.login(
      email: 'newuser@example.com',
      password: 'password123',
    );
    
    if (!loginResponse.isSuccess) {
      print('Login failed: ${loginResponse.error}');
      return;
    }
    
    print('✅ User logged in successfully');
    
    // 3. Get user profile
    print('3. Getting user profile...');
    final profileResponse = await _api.user.getUserProfile();
    if (profileResponse.isSuccess) {
      final user = profileResponse.data!;
      print('✅ User profile: ${user.name} (${user.userType})');
    }
    
    // 4. Browse properties
    print('4. Browsing properties...');
    final propertiesResponse = await _api.property.getProperties(limit: 5);
    if (propertiesResponse.isSuccess) {
      final properties = propertiesResponse.data ?? [];
      print('✅ Found ${properties.length} properties');
      
      if (properties.isNotEmpty) {
        final firstProperty = properties.first;
        
        // 5. Add to favorites
        print('5. Adding property to favorites...');
        final favoriteResponse = await _api.favorites.addToFavorites(firstProperty.id);
        if (favoriteResponse.isSuccess) {
          print('✅ Added to favorites');
        }
        
        // 6. Create booking
        print('6. Creating booking...');
        final bookingResponse = await _api.booking.createBooking(
          propertyId: firstProperty.id,
          scheduledDate: '2024-12-25',
          scheduledTime: '15:00',
          notes: 'Interested in this property',
        );
        
        if (bookingResponse.isSuccess) {
          print('✅ Booking created: ${bookingResponse.data?.id}');
        }
        
        // 7. Start chat with property owner
        print('7. Starting chat with property owner...');
        final chatResponse = await _api.chat.createChat(
          participant2Id: firstProperty.ownerId,
          propertyId: firstProperty.id,
        );
        
        if (chatResponse.isSuccess) {
          print('✅ Chat created: ${chatResponse.data?.id}');
          
          // Send a message
          final messageResponse = await _api.chat.sendMessage(
            chatId: chatResponse.data!.id,
            content: 'Hi! I am interested in your property and have booked a visit.',
          );
          
          if (messageResponse.isSuccess) {
            print('✅ Message sent');
          }
        }
      }
    }
    
    // 8. Logout
    print('8. Logging out...');
    await _api.auth.logout();
    print('✅ User logged out successfully');
    
    print('=== User flow completed successfully! ===');
  }
}

/// Widget example showing how to use API services in Flutter widgets
class PropertyListWidget extends StatefulWidget {
  @override
  _PropertyListWidgetState createState() => _PropertyListWidgetState();
}

class _PropertyListWidgetState extends State<PropertyListWidget> {
  final ApiServiceManager _api = ApiServiceManager.instance;
  List<PropertyModel> properties = [];
  bool isLoading = false;
  String? error;
  
  @override
  void initState() {
    super.initState();
    _loadProperties();
  }
  
  Future<void> _loadProperties() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    
    final response = await _api.property.getProperties(limit: 20);
    
    setState(() {
      isLoading = false;
      if (response.isSuccess) {
        properties = response.data ?? [];
      } else {
        error = response.error;
      }
    });
  }
  
  Future<void> _toggleFavorite(String propertyId) async {
    final response = await _api.favorites.toggleFavorite(propertyId);
    if (response.isSuccess) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.message ?? 'Favorite updated'),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.error ?? 'Failed to update favorite'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    if (error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $error'),
            ElevatedButton(
              onPressed: _loadProperties,
              child: Text('Retry'),
            ),
          ],
        ),
      );
    }
    
    return ListView.builder(
      itemCount: properties.length,
      itemBuilder: (context, index) {
        final property = properties[index];
        return Card(
          margin: EdgeInsets.all(8),
          child: ListTile(
            title: Text(property.title),
            subtitle: Text('${property.location} - ${property.formattedPrice}'),
            trailing: IconButton(
              icon: Icon(Icons.favorite_border),
              onPressed: () => _toggleFavorite(property.id),
            ),
            onTap: () {
              // Navigate to property details
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => PropertyDetailsWidget(property: property),
                ),
              );
            },
          ),
        );
      },
    );
  }
}

class PropertyDetailsWidget extends StatelessWidget {
  final PropertyModel property;
  
  const PropertyDetailsWidget({Key? key, required this.property}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(property.title)),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(property.title, style: Theme.of(context).textTheme.headlineSmall),
            SizedBox(height: 8),
            Text('Price: ${property.formattedPrice}'),
            Text('Location: ${property.location}'),
            Text('Bedrooms: ${property.bedrooms}'),
            Text('Bathrooms: ${property.bathrooms}'),
            SizedBox(height: 16),
            Text(property.description),
            Spacer(),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _bookVisit(context),
                    child: Text('Book Visit'),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _contactOwner(context),
                    child: Text('Contact Owner'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  void _bookVisit(BuildContext context) async {
    final api = ApiServiceManager.instance;
    
    // Show date/time picker and create booking
    final response = await api.booking.createBooking(
      propertyId: property.id,
      scheduledDate: '2024-12-25', // Use date picker
      scheduledTime: '15:00', // Use time picker
      notes: 'Booking from app',
    );
    
    if (response.isSuccess) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Visit booked successfully!')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.error ?? 'Failed to book visit'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
  
  void _contactOwner(BuildContext context) async {
    final api = ApiServiceManager.instance;
    
    // Create chat with property owner
    final response = await api.chat.createChat(
      participant2Id: property.ownerId,
      propertyId: property.id,
    );
    
    if (response.isSuccess) {
      // Navigate to chat screen
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ChatWidget(chatId: response.data!.id),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.error ?? 'Failed to start chat'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}

class ChatWidget extends StatelessWidget {
  final String chatId;
  
  const ChatWidget({Key? key, required this.chatId}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Chat')),
      body: Center(
        child: Text('Chat implementation with chatId: $chatId'),
      ),
    );
  }
}
