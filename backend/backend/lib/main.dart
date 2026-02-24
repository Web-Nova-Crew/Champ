import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'services/estato_api_service.dart';
import 'screens/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/property/add_property_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/dashboard/agent_dashboard_screen.dart';
import 'screens/dashboard/landlord_dashboard_screen.dart';
import 'screens/dashboard/owner_dashboard_screen.dart';
import 'screens/filters/advanced_filters_screen.dart';
import 'screens/chat/chat_list_screen.dart';
import 'screens/booking/bookings_screen.dart';
import 'screens/booking/schedule_visit_screen.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/onboarding/welcome_screen.dart';
import 'screens/auth/otp_verification_screen.dart';
import 'screens/profile/edit_profile_screen.dart';
import 'screens/profile/saved_properties_screen.dart';
import 'screens/legal/terms_screen.dart';
import 'screens/legal/privacy_screen.dart';
import 'screens/legal/help_screen.dart';
import 'screens/property/edit_property_screen.dart';
import 'screens/settings/notification_settings_screen.dart';
import 'screens/tools/emi_calculator_screen.dart';
import 'screens/tools/property_comparison_screen.dart';
import 'screens/profile/recently_viewed_screen.dart';
import 'providers/auth_provider.dart';
import 'providers/property_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/booking_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/recently_viewed_provider.dart';
import 'models/property.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize API service
  await EstatoApiService.instance.initialize();
  
  // Add error handling for crashes
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
  };
  
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) {
            final authProvider = AuthProvider();
            // Initialize authentication state
            authProvider.checkLoginStatus();
            return authProvider;
          },
        ),
        ChangeNotifierProvider(create: (_) => PropertyProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => RecentlyViewedProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            title: 'Estato',
            debugShowCheckedModeBanner: false,
            theme: themeProvider.lightTheme,
            darkTheme: themeProvider.darkTheme,
            themeMode: themeProvider.themeMode,
            home: const SplashScreen(),
            routes: {
              '/login': (context) => const LoginScreen(),
              '/register': (context) => const RegisterScreen(),
              '/onboarding': (context) => const OnboardingScreen(),
              '/welcome': (context) => const WelcomeScreen(),
              '/home': (context) => const HomeScreen(),
              '/add-property': (context) => const AddPropertyScreen(),
              '/profile': (context) => const ProfileScreen(),
              '/edit-profile': (context) => const EditProfileScreen(),
              '/saved-properties': (context) => const SavedPropertiesScreen(),
              '/agent-dashboard': (context) => const AgentDashboardScreen(),
              '/landlord-dashboard': (context) => const LandlordDashboardScreen(),
              '/owner-dashboard': (context) => const OwnerDashboardScreen(),
              '/advanced-filters': (context) => const AdvancedFiltersScreen(),
              '/chats': (context) => const ChatListScreen(),
              '/bookings': (context) => const BookingsScreen(),
              '/terms': (context) => const TermsScreen(),
              '/privacy': (context) => const PrivacyScreen(),
              '/help': (context) => const HelpScreen(),
              '/notification-settings': (context) => const NotificationSettingsScreen(),
              '/emi-calculator': (context) => const EMICalculatorScreen(),
              '/compare-properties': (context) => const PropertyComparisonScreen(),
              '/recently-viewed': (context) => const RecentlyViewedScreen(),
            },
            onGenerateRoute: (settings) {
              if (settings.name == '/schedule-visit') {
                final property = settings.arguments as Property;
                return MaterialPageRoute(
                  builder: (context) => ScheduleVisitScreen(property: property),
                );
              }
              if (settings.name == '/otp-verification') {
                final args = settings.arguments as Map<String, dynamic>;
                return MaterialPageRoute(
                  builder: (context) => OtpVerificationScreen(
                    phoneNumber: args['phoneNumber'],
                    email: args['email'],
                    isPhoneVerification: args['isPhoneVerification'] ?? true,
                  ),
                );
              }
              if (settings.name == '/edit-property') {
                final property = settings.arguments as Property;
                return MaterialPageRoute(
                  builder: (context) => EditPropertyScreen(property: property),
                );
              }
              return null;
            },
          );
        },
      ),
    );
  }
}
