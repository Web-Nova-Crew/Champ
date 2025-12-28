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
import 'screens/chat/ai_chat_screen.dart';
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
import 'providers/search_history_provider.dart';
import 'providers/settings_provider.dart';
import 'screens/settings/account_settings_screen_new.dart';
import 'screens/settings/privacy_settings_screen_new.dart';
import 'screens/profile/search_history_screen_new.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/profile/my_properties_screen.dart';
import 'models/property.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize API service
  await EstatoApiService.instance.initialize();
  
  // Add error handling for crashes
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
  };
  
  // Set system UI overlay style for premium look
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
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
        ChangeNotifierProvider(create: (_) => SearchHistoryProvider()),
        ChangeNotifierProvider(create: (_) => SettingsProvider()),
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
            onGenerateRoute: _generateRoute,
          );
        },
      ),
    );
  }

  static Route<dynamic>? _generateRoute(RouteSettings settings) {
    Widget? page;
    
    switch (settings.name) {
      case '/login':
        page = const LoginScreen();
        break;
      case '/register':
        page = const RegisterScreen();
        break;
      case '/onboarding':
        page = const OnboardingScreen();
        break;
      case '/welcome':
        page = const WelcomeScreen();
        break;
      case '/home':
        page = const HomeScreen();
        break;
      case '/add-property':
        page = const AddPropertyScreen();
        break;
      case '/profile':
        page = const ProfileScreen();
        break;
      case '/edit-profile':
        page = const EditProfileScreen();
        break;
      case '/saved-properties':
      case '/wishlist':
        page = const SavedPropertiesScreen();
        break;
      case '/agent-dashboard':
        page = const AgentDashboardScreen();
        break;
      case '/landlord-dashboard':
        page = const LandlordDashboardScreen();
        break;
      case '/owner-dashboard':
        page = const OwnerDashboardScreen();
        break;
      case '/advanced-filters':
        page = const AdvancedFiltersScreen();
        break;
      case '/chats':
        page = const ChatListScreen();
        break;
      case '/bookings':
        page = const BookingsScreen();
        break;
      case '/terms':
        page = const TermsScreen();
        break;
      case '/privacy':
        page = const PrivacyScreen();
        break;
      case '/help':
        page = const HelpScreen();
        break;
      case '/notification-settings':
        page = const NotificationSettingsScreen();
        break;
      case '/emi-calculator':
        page = const EMICalculatorScreen();
        break;
      case '/compare-properties':
        page = const PropertyComparisonScreen();
        break;
      case '/recently-viewed':
        page = const RecentlyViewedScreen();
        break;
      case '/ai-chat':
        page = const AIChatScreen();
        break;
      case '/notifications':
        page = const NotificationsScreen();
        break;
      case '/my-properties':
        page = const MyPropertiesScreen();
        break;
      case '/account-settings':
        page = const AccountSettingsScreen();
        break;
      case '/privacy-settings':
        page = const PrivacySettingsScreen();
        break;
      case '/search-history':
        page = const SearchHistoryScreen();
        break;
      case '/schedule-visit':
        final property = settings.arguments as Property;
        page = ScheduleVisitScreen(property: property);
        break;
      case '/otp-verification':
        final args = settings.arguments as Map<String, dynamic>;
        page = OtpVerificationScreen(
          phoneNumber: args['phoneNumber'],
          email: args['email'],
          isPhoneVerification: args['isPhoneVerification'] ?? true,
        );
        break;
      case '/edit-property':
        final property = settings.arguments as Property;
        page = EditPropertyScreen(property: property);
        break;
    }
    
    if (page != null) {
      return _SmoothPageRoute(page: page, settings: settings);
    }
    return null;
  }
}

class _SmoothPageRoute extends PageRouteBuilder {
  final Widget page;

  _SmoothPageRoute({required this.page, RouteSettings? settings})
      : super(
          settings: settings,
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionDuration: const Duration(milliseconds: 350),
          reverseTransitionDuration: const Duration(milliseconds: 300),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            const begin = Offset(0.05, 0.0);
            const end = Offset.zero;
            
            final tween = Tween(begin: begin, end: end).chain(
              CurveTween(curve: Curves.easeOutCubic),
            );
            
            final fadeTween = Tween<double>(begin: 0.0, end: 1.0).chain(
              CurveTween(curve: const Interval(0.0, 0.65, curve: Curves.easeOut)),
            );
            
            final secondaryTween = Tween(
              begin: Offset.zero,
              end: const Offset(-0.05, 0.0),
            ).chain(CurveTween(curve: Curves.easeInCubic));
            
            final secondaryFadeTween = Tween<double>(begin: 1.0, end: 0.9).chain(
              CurveTween(curve: Curves.easeIn),
            );

            return SlideTransition(
              position: secondaryAnimation.drive(secondaryTween),
              child: FadeTransition(
                opacity: secondaryAnimation.drive(secondaryFadeTween),
                child: SlideTransition(
                  position: animation.drive(tween),
                  child: FadeTransition(
                    opacity: animation.drive(fadeTween),
                    child: child,
                  ),
                ),
              ),
            );
          },
        );
}
