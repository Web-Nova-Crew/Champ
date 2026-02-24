import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/app_colors.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Terms & Conditions',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Terms and Conditions',
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
              '1. Acceptance of Terms',
              'By accessing and using the Estato app, you accept and agree to be bound by the terms and provision of this agreement.',
            ),
            _buildSection(
              '2. Use License',
              'Permission is granted to temporarily use Estato for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.',
            ),
            _buildSection(
              '3. User Accounts',
              'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.',
            ),
            _buildSection(
              '4. Property Listings',
              'All property listings are provided for informational purposes only. Estato does not guarantee the accuracy, completeness, or reliability of any property information.',
            ),
            _buildSection(
              '5. User Conduct',
              'You agree not to use the app for any unlawful purpose or in any way that could damage, disable, or impair the app or interfere with any other party\'s use of the app.',
            ),
            _buildSection(
              '6. Privacy Policy',
              'Your use of Estato is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.',
            ),
            _buildSection(
              '7. Limitation of Liability',
              'In no event shall Estato be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the app.',
            ),
            _buildSection(
              '8. Changes to Terms',
              'Estato reserves the right to modify these terms at any time. Your continued use of the app after any such changes constitutes your acceptance of the new terms.',
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
              'If you have any questions about these Terms & Conditions, please contact us at:',
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

