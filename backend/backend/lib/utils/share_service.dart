import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/property.dart';

/// Share Service for sharing properties via different platforms
class ShareService {
  /// Share property via WhatsApp
  static Future<void> shareViaWhatsApp(Property property) async {
    final message = _buildShareMessage(property);
    final uri = Uri.parse(
      'https://wa.me/?text=${Uri.encodeComponent(message)}',
    );
    
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      throw Exception('Could not launch WhatsApp');
    }
  }

  /// Share property via Email
  static Future<void> shareViaEmail(Property property) async {
    final subject = 'Check out this property: ${property.title}';
    final body = _buildShareMessage(property);
    final uri = Uri(
      scheme: 'mailto',
      queryParameters: {
        'subject': subject,
        'body': body,
      },
    );
    
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      throw Exception('Could not launch email');
    }
  }

  /// Share property via SMS
  static Future<void> shareViaSMS(Property property) async {
    final message = _buildShareMessage(property);
    final uri = Uri(
      scheme: 'sms',
      queryParameters: {
        'body': message,
      },
    );
    
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      throw Exception('Could not launch SMS');
    }
  }

  /// Copy property link to clipboard
  static Future<void> copyToClipboard(Property property) async {
    final message = _buildShareMessage(property);
    await Clipboard.setData(ClipboardData(text: message));
  }

  /// Share property via system share sheet
  static Future<void> shareViaSystem(Property property) async {
    final message = _buildShareMessage(property);
    await Clipboard.setData(ClipboardData(text: message));
    // Note: For system share, you would use share_plus package
    // Example: await Share.share(message);
  }

  /// Build share message for property
  static String _buildShareMessage(Property property) {
    final price = _formatPrice(property.price);
    return '''
🏠 ${property.title}

📍 Location: ${property.location}
💰 Price: $price
🏘️ Type: ${property.propertyType}
📐 Size: ${property.size.toInt()} sq ft

Check out this amazing property on Estato!

Download Estato app to view more details.
''';
  }

  static String _formatPrice(double price) {
    if (price >= 10000000) {
      return '₹${(price / 10000000).toStringAsFixed(2)} Cr';
    } else if (price >= 100000) {
      return '₹${(price / 100000).toStringAsFixed(2)} Lac';
    } else {
      return '₹${price.toStringAsFixed(0)}';
    }
  }
}

