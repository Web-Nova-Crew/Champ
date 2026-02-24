import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/app_colors.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Privacy Policy',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Privacy Policy',
              style: GoogleFonts.poppins(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Last Updated: November 30, 2025',
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            _buildSection(
              '1. Information We Collect',
              'We collect information that you provide directly to us, including your name, email address, phone number, and property preferences when you create an account or use our services.',
            ),
            _buildSection(
              '2. How We Use Your Information',
              'We use the information we collect to provide, maintain, and improve our services, process transactions, send you notifications, and communicate with you about your account.',
            ),
            _buildSection(
              '3. Information Sharing',
              'We do not sell, trade, or rent your personal information to third parties. We may share your information with property agents and service providers who assist us in operating our app.',
            ),
            _buildSection(
              '4. Data Security',
              'We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.',
            ),
            _buildSection(
              '5. Your Rights',
              'You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting us directly.',
            ),
            _buildSection(
              '6. Cookies and Tracking',
              'We use cookies and similar tracking technologies to track activity on our app and hold certain information. You can instruct your browser to refuse all cookies.',
            ),
            _buildSection(
              '7. Third-Party Links',
              'Our app may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.',
            ),
            _buildSection(
              '8. Children\'s Privacy',
              'Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children.',
            ),
            _buildSection(
              '9. Changes to Privacy Policy',
              'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.',
            ),
            const SizedBox(height: 32),
            Text(
              'Contact Us',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'If you have any questions about this Privacy Policy, please contact us at:',
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Email: support@estatoprop.com\nPhone: +91 9872364476',
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
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
          const SizedBox(height: 8),
          Text(
            content,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}

