import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/app_colors.dart';

class PrivacySettingsScreen extends StatefulWidget {
  const PrivacySettingsScreen({super.key});

  @override
  State<PrivacySettingsScreen> createState() => _PrivacySettingsScreenState();
}

class _PrivacySettingsScreenState extends State<PrivacySettingsScreen> {
  bool _profileVisibility = true;
  bool _showPhoneNumber = false;
  bool _showEmail = false;
  bool _allowMessages = true;
  bool _showOnlineStatus = true;
  bool _dataCollection = true;
  bool _personalizedAds = false;
  bool _analyticsTracking = true;
  String _profileVisibilityLevel = 'Public';

  final List<String> _visibilityLevels = ['Public', 'Registered Users Only', 'Private'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Privacy Settings',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Profile Privacy Section
          _buildSection(
            'Profile Privacy',
            [
              _buildDropdownTile(
                'Profile Visibility',
                'Control who can see your profile',
                Icons.visibility,
                _profileVisibilityLevel,
                _visibilityLevels,
                (value) {
                  setState(() {
                    _profileVisibilityLevel = value!;
                  });
                },
              ),
              _buildSwitchTile(
                'Show Phone Number',
                'Display your phone number on your profile',
                Icons.phone,
                _showPhoneNumber,
                (value) {
                  setState(() {
                    _showPhoneNumber = value;
                  });
                },
              ),
              _buildSwitchTile(
                'Show Email Address',
                'Display your email address on your profile',
                Icons.email,
                _showEmail,
                (value) {
                  setState(() {
                    _showEmail = value;
                  });
                },
              ),
              _buildSwitchTile(
                'Show Online Status',
                'Let others see when you\'re online',
                Icons.circle,
                _showOnlineStatus,
                (value) {
                  setState(() {
                    _showOnlineStatus = value;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Communication Privacy Section
          _buildSection(
            'Communication Privacy',
            [
              _buildSwitchTile(
                'Allow Messages',
                'Allow other users to send you messages',
                Icons.message,
                _allowMessages,
                (value) {
                  setState(() {
                    _allowMessages = value;
                  });
                },
              ),
              _buildActionTile(
                'Blocked Users',
                'Manage users you\'ve blocked',
                Icons.block,
                () => _showBlockedUsers(),
              ),
              _buildActionTile(
                'Message Requests',
                'Control who can message you directly',
                Icons.mail_outline,
                () => _showMessageRequestSettings(),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Data Privacy Section
          _buildSection(
            'Data Privacy',
            [
              _buildSwitchTile(
                'Data Collection',
                'Allow collection of usage data to improve services',
                Icons.data_usage,
                _dataCollection,
                (value) {
                  setState(() {
                    _dataCollection = value;
                  });
                },
              ),
              _buildSwitchTile(
                'Personalized Ads',
                'Show ads based on your interests and activity',
                Icons.ads_click,
                _personalizedAds,
                (value) {
                  setState(() {
                    _personalizedAds = value;
                  });
                },
              ),
              _buildSwitchTile(
                'Analytics Tracking',
                'Help improve the app with anonymous usage analytics',
                Icons.analytics,
                _analyticsTracking,
                (value) {
                  setState(() {
                    _analyticsTracking = value;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Data Management Section
          _buildSection(
            'Data Management',
            [
              _buildActionTile(
                'Download My Data',
                'Get a copy of all your data',
                Icons.download,
                () => _downloadData(),
              ),
              _buildActionTile(
                'Data Retention',
                'Control how long your data is stored',
                Icons.schedule,
                () => _showDataRetentionSettings(),
              ),
              _buildActionTile(
                'Clear Search History',
                'Delete all your search history',
                Icons.clear_all,
                () => _clearSearchHistory(),
              ),
              _buildActionTile(
                'Clear Chat History',
                'Delete all your chat messages',
                Icons.chat_bubble_outline,
                () => _clearChatHistory(),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Legal Section
          _buildSection(
            'Legal',
            [
              _buildActionTile(
                'Privacy Policy',
                'Read our privacy policy',
                Icons.policy,
                () => Navigator.pushNamed(context, '/privacy'),
              ),
              _buildActionTile(
                'Terms of Service',
                'Read our terms of service',
                Icons.description,
                () => Navigator.pushNamed(context, '/terms'),
              ),
              _buildActionTile(
                'Cookie Policy',
                'Learn about our cookie usage',
                Icons.cookie,
                () => _showCookiePolicy(),
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
        subtitle,
        style: GoogleFonts.poppins(
          fontSize: 12,
          color: AppColors.textSecondary,
        ),
      ),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
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

  void _showBlockedUsers() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Blocked Users',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.block,
                      size: 64,
                      color: Colors.grey[300],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No blocked users',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
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
    );
  }

  void _showMessageRequestSettings() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Message Request Settings',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String>(
              title: const Text('Everyone'),
              value: 'everyone',
              groupValue: 'everyone',
              onChanged: (value) {},
            ),
            RadioListTile<String>(
              title: const Text('Registered Users Only'),
              value: 'registered',
              groupValue: 'everyone',
              onChanged: (value) {},
            ),
            RadioListTile<String>(
              title: const Text('No One'),
              value: 'none',
              groupValue: 'everyone',
              onChanged: (value) {},
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _downloadData() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Download Data',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Text(
          'We\'ll prepare a copy of your data and send it to your email address. This may take up to 24 hours.',
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
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Data download request submitted',
                    style: GoogleFonts.poppins(),
                  ),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            child: const Text('Request Download'),
          ),
        ],
      ),
    );
  }

  void _showDataRetentionSettings() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Data Retention',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Choose how long to keep your data:',
              style: GoogleFonts.poppins(),
            ),
            const SizedBox(height: 16),
            RadioListTile<String>(
              title: const Text('1 Year'),
              value: '1year',
              groupValue: '1year',
              onChanged: (value) {},
            ),
            RadioListTile<String>(
              title: const Text('2 Years'),
              value: '2years',
              groupValue: '1year',
              onChanged: (value) {},
            ),
            RadioListTile<String>(
              title: const Text('5 Years'),
              value: '5years',
              groupValue: '1year',
              onChanged: (value) {},
            ),
            RadioListTile<String>(
              title: const Text('Keep Forever'),
              value: 'forever',
              groupValue: '1year',
              onChanged: (value) {},
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _clearSearchHistory() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Clear Search History',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Text(
          'Are you sure you want to clear all your search history? This action cannot be undone.',
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
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Search history cleared',
                    style: GoogleFonts.poppins(),
                  ),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  void _clearChatHistory() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Clear Chat History',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Text(
          'Are you sure you want to clear all your chat messages? This action cannot be undone.',
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
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Chat history cleared',
                    style: GoogleFonts.poppins(),
                  ),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  void _showCookiePolicy() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Cookie Policy',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: SingleChildScrollView(
          child: Text(
            'We use cookies to improve your experience on our app. Cookies help us understand how you use our services and allow us to provide personalized content and advertisements.\n\nYou can control cookie settings in your device\'s browser settings.',
            style: GoogleFonts.poppins(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
