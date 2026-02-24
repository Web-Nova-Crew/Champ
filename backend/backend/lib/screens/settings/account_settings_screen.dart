import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_colors.dart';

class AccountSettingsScreen extends StatefulWidget {
  const AccountSettingsScreen({super.key});

  @override
  State<AccountSettingsScreen> createState() => _AccountSettingsScreenState();
}

class _AccountSettingsScreenState extends State<AccountSettingsScreen> {
  bool _twoFactorEnabled = false;
  bool _emailVerified = true;
  bool _phoneVerified = false;
  String _selectedLanguage = 'English';
  String _selectedCurrency = 'INR (₹)';

  final List<String> _languages = ['English', 'Hindi', 'Urdu'];
  final List<String> _currencies = ['INR (₹)', 'USD (\$)', 'EUR (€)'];

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.currentUser;

    // Handle null user
    if (user == null) {
      return Scaffold(
        appBar: AppBar(
          title: Text(
            'Account Settings',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.settings_outlined, size: 80, color: AppColors.textSecondary),
              const SizedBox(height: 16),
              Text(
                'Please login to access settings',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                ),
                child: Text('Login', style: GoogleFonts.poppins(color: Colors.white)),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Account Settings',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Account Security Section
          _buildSection(
            'Account Security',
            [
              _buildSwitchTile(
                'Two-Factor Authentication',
                'Add an extra layer of security to your account',
                Icons.security,
                _twoFactorEnabled,
                (value) {
                  setState(() {
                    _twoFactorEnabled = value;
                  });
                  _showTwoFactorDialog(value);
                },
              ),
              _buildActionTile(
                'Change Password',
                'Update your account password',
                Icons.lock_outline,
                () => _showChangePasswordDialog(),
              ),
              _buildActionTile(
                'Login Activity',
                'View recent login sessions',
                Icons.history,
                () => _showLoginActivity(),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Verification Section
          _buildSection(
            'Account Verification',
            [
              _buildVerificationTile(
                'Email Verification',
                user?.email ?? 'Not provided',
                Icons.email_outlined,
                _emailVerified,
                () => _verifyEmail(),
              ),
              _buildVerificationTile(
                'Phone Verification',
                user?.phone ?? 'Not provided',
                Icons.phone_outlined,
                _phoneVerified,
                () => _verifyPhone(),
              ),
              _buildActionTile(
                'Identity Verification',
                'Verify your identity for premium features',
                Icons.verified_user_outlined,
                () => _showIdentityVerification(),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Preferences Section
          _buildSection(
            'Preferences',
            [
              _buildDropdownTile(
                'Language',
                'Choose your preferred language',
                Icons.language,
                _selectedLanguage,
                _languages,
                (value) {
                  setState(() {
                    _selectedLanguage = value!;
                  });
                },
              ),
              _buildDropdownTile(
                'Currency',
                'Select currency for price display',
                Icons.currency_rupee,
                _selectedCurrency,
                _currencies,
                (value) {
                  setState(() {
                    _selectedCurrency = value!;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Data & Privacy Section
          _buildSection(
            'Data & Privacy',
            [
              _buildActionTile(
                'Download My Data',
                'Get a copy of your account data',
                Icons.download,
                () => _downloadData(),
              ),
              _buildActionTile(
                'Privacy Settings',
                'Control who can see your information',
                Icons.privacy_tip_outlined,
                () => _showPrivacySettings(),
              ),
              _buildActionTile(
                'Delete Account',
                'Permanently delete your account',
                Icons.delete_forever,
                () => _showDeleteAccountDialog(),
                isDestructive: true,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _buildSwitchTile(
    String title,
    String subtitle,
    IconData icon,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return SwitchListTile(
      title: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.poppins(
          fontSize: 12,
          color: AppColors.textSecondary,
        ),
      ),
      secondary: Icon(icon, color: AppColors.primary),
      value: value,
      onChanged: onChanged,
      activeColor: AppColors.primary,
    );
  }

  Widget _buildActionTile(
    String title,
    String subtitle,
    IconData icon,
    VoidCallback onTap, {
    bool isDestructive = false,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: isDestructive ? Colors.red : AppColors.primary,
      ),
      title: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: isDestructive ? Colors.red : AppColors.textPrimary,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.poppins(
          fontSize: 12,
          color: AppColors.textSecondary,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: isDestructive ? Colors.red : Colors.grey,
      ),
      onTap: onTap,
    );
  }

  Widget _buildVerificationTile(
    String title,
    String value,
    IconData icon,
    bool isVerified,
    VoidCallback onTap,
  ) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
      subtitle: Text(
        value,
        style: GoogleFonts.poppins(
          fontSize: 12,
          color: AppColors.textSecondary,
        ),
      ),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isVerified ? AppColors.success : Colors.orange,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          isVerified ? 'Verified' : 'Verify',
          style: GoogleFonts.poppins(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
      onTap: isVerified ? null : onTap,
    );
  }

  Widget _buildDropdownTile(
    String title,
    String subtitle,
    IconData icon,
    String value,
    List<String> options,
    ValueChanged<String?> onChanged,
  ) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(
        title,
        style: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: GoogleFonts.poppins(
          fontSize: 12,
          color: AppColors.textSecondary,
        ),
      ),
      trailing: DropdownButton<String>(
        value: value,
        underline: const SizedBox(),
        items: options.map((option) {
          return DropdownMenuItem(
            value: option,
            child: Text(
              option,
              style: GoogleFonts.poppins(fontSize: 14),
            ),
          );
        }).toList(),
        onChanged: onChanged,
      ),
    );
  }

  void _showTwoFactorDialog(bool enable) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          enable ? 'Enable 2FA' : 'Disable 2FA',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Text(
          enable
              ? 'Two-factor authentication adds an extra layer of security to your account. You\'ll need to enter a code from your phone each time you log in.'
              : 'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
          style: GoogleFonts.poppins(),
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _twoFactorEnabled = !enable;
              });
              Navigator.pop(context);
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              if (enable) {
                _setupTwoFactor();
              }
            },
            child: Text(enable ? 'Setup' : 'Disable'),
          ),
        ],
      ),
    );
  }

  void _setupTwoFactor() {
    // TODO: Implement 2FA setup
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Two-factor authentication setup will be implemented',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.info,
      ),
    );
  }

  void _showChangePasswordDialog() {
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Change Password',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: currentPasswordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Current Password',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: newPasswordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'New Password',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: confirmPasswordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Confirm New Password',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _changePassword(
                currentPasswordController.text,
                newPasswordController.text,
                confirmPasswordController.text,
              );
            },
            child: const Text('Change'),
          ),
        ],
      ),
    );
  }

  void _changePassword(String current, String newPass, String confirm) {
    if (newPass != confirm) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'New passwords do not match',
            style: GoogleFonts.poppins(),
          ),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // TODO: Implement password change
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Password changed successfully',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.success,
      ),
    );
  }

  void _showLoginActivity() {
    // TODO: Implement login activity screen
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Login activity feature will be implemented',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.info,
      ),
    );
  }

  void _verifyEmail() {
    // TODO: Implement email verification
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Verification email sent',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.success,
      ),
    );
  }

  void _verifyPhone() {
    // TODO: Implement phone verification
    Navigator.pushNamed(
      context,
      '/otp-verification',
      arguments: {
        'phoneNumber': Provider.of<AuthProvider>(context, listen: false).currentUser?.phone,
        'isPhoneVerification': true,
      },
    );
  }

  void _showIdentityVerification() {
    // TODO: Implement identity verification
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Identity verification feature will be implemented',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.info,
      ),
    );
  }

  void _downloadData() {
    // TODO: Implement data download
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Data download will be available soon',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.info,
      ),
    );
  }

  void _showPrivacySettings() {
    // TODO: Implement privacy settings
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Privacy settings feature will be implemented',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.info,
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Delete Account',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
            color: Colors.red,
          ),
        ),
        content: Text(
          'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
          style: GoogleFonts.poppins(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement account deletion
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete Account'),
          ),
        ],
      ),
    );
  }
}
