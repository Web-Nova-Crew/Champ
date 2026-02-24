// ignore_for_file: dangling_library_doc_comments

/// App Color Theme Constants - Estato
/// 
/// लखनऊ का अपना Real Estate App
/// Centralized color definitions for the Estato app
/// Based on Logo: Magenta → Purple → Deep Blue gradient with Cyan accent
/// 
/// Theme inspired by Lucknow's rich heritage:
/// - Purple: Nawabi elegance and royalty
/// - Magenta: Vibrant culture and Chikan embroidery
/// - Cyan: Modern development and Gomti river
/// - Deep Blue: Trust and reliability

import 'package:flutter/material.dart';

class AppColors {
  // Primary Color - Deep Purple (from logo center)
  static const Color primary = Color(0xFF7B2D8E); // Deep Purple
  static const Color primaryDark = Color(0xFF5E1F6D); // Darker Purple
  static const Color primaryLight = Color(0xFF9B4DB0); // Lighter Purple
  static const Color primaryUltraLight = Color(0xFFF3E5F5); // Ultra light purple bg
  
  // Secondary Color - Magenta/Pink (from logo top)
  static const Color secondary = Color(0xFFE91E8C); // Vibrant Magenta
  static const Color secondaryDark = Color(0xFFC2185B); // Darker Magenta
  static const Color secondaryLight = Color(0xFFF48FB1); // Light Pink
  
  // Accent Colors - Cyan/Teal (from logo handshake)
  static const Color accent = Color(0xFF00BCD4); // Cyan
  static const Color accentLight = Color(0xFF4DD0E1); // Light Cyan
  static const Color accentDark = Color(0xFF0097A7); // Dark Cyan
  
  // Deep Blue (from logo bottom)
  static const Color deepBlue = Color(0xFF1E3A8A); // Deep Blue
  static const Color deepBlueLight = Color(0xFF3B5998); // Lighter Blue
  
  // Background Colors
  static const Color background = Color(0xFFFAF5FF); // Soft white with purple tint
  static const Color backgroundLight = Color(0xFFFFFFFF); // Pure white
  static const Color backgroundDark = Color(0xFFF3E8F8); // Light purple gray
  
  // Text Colors
  static const Color textPrimary = Color(0xFF1A1A2E); // Dark purple-black
  static const Color textSecondary = Color(0xFF4A4A6A); // Medium purple-gray
  static const Color textLight = Color(0xFF9E9EBE); // Light purple-gray
  
  // Status Colors
  static const Color success = Color(0xFF00B894); // Teal green
  static const Color error = Color(0xFFE91E63); // Pink (matches logo)
  static const Color warning = Color(0xFFFFB300); // Amber
  static const Color info = Color(0xFF00BCD4); // Cyan (matches accent)
  
  // UI Element Colors
  static const Color cardBackground = Colors.white;
  static const Color divider = Color(0xFFE8E0F0);
  static const Color border = Color(0xFFD8D0E8);
  
  // Gradient Colors - Logo-inspired gradients
  static const List<Color> primaryGradient = [
    Color(0xFFE91E8C), // Magenta (top)
    Color(0xFF7B2D8E), // Purple (middle)
    Color(0xFF1E3A8A), // Deep Blue (bottom)
  ];
  
  static const List<Color> secondaryGradient = [
    Color(0xFFE91E8C), // Magenta
    Color(0xFF9B4DB0), // Light Purple
  ];
  
  static const List<Color> accentGradient = [
    Color(0xFF00BCD4), // Cyan
    Color(0xFF1E3A8A), // Deep Blue
  ];
  
  static const List<Color> backgroundGradient = [
    Color(0xFFFAF5FF), // Soft white
    Color(0xFFF3E8F8), // Light purple
    Color(0xFFEDE7F6), // Lighter purple
  ];
  
  static const List<Color> cardGradient = [
    Colors.white,
    Color(0xFFFAF5FF),
  ];
  
  // Header gradient (matches logo flow)
  static const List<Color> headerGradient = [
    Color(0xFF7B2D8E), // Purple
    Color(0xFFE91E8C), // Magenta
  ];
  
  // Glass morphism effect
  static const Color glassBackground = Color(0x80FFFFFF);
  static const Color glassBorder = Color(0x33FFFFFF);
  
  // Location pin color (from logo)
  static const Color locationPin = Color(0xFFE91E8C); // Magenta
}

