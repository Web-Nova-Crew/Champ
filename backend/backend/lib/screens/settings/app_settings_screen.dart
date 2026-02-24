import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/theme_provider.dart';
import '../../utils/app_colors.dart';

class AppSettingsScreen extends StatefulWidget {
  const AppSettingsScreen({super.key});

  @override
  State<AppSettingsScreen> createState() => _AppSettingsScreenState();
}

class _AppSettingsScreenState extends State<AppSettingsScreen> {
  bool _autoPlayVideos = true;
  bool _highQualityImages = true;
  bool _crashReporting = true;
  String _currencyFormat = 'Indian Rupee (₹)';
  double _cacheSize = 150.0; // MB

  final List<String> _currencyFormats = [
    'Indian Rupee (₹)',
    'US Dollar (\$)',
    'Euro (€)',
    'British Pound (£)',
  ];

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'App Settings',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Display Settings
          _buildSection(
            'Display',
            [
              _buildSwitchTile(
                'Dark Mode',
                'Use dark theme throughout the app',
                Icons.dark_mode,
                themeProvider.isDarkMode,
                (value) {
                  themeProvider.setDarkMode(value);
                },
              ),
              _buildSwitchTile(
                'High Quality Images',
                'Load images in higher resolution',
                Icons.high_quality,
                _highQualityImages,
                (value) {
                  setState(() {
                    _highQualityImages = value;
                  });
                },
              ),
              _buildSwitchTile(
                'Auto-play Videos',
                'Automatically play property videos',
                Icons.play_circle,
                _autoPlayVideos,
                (value) {
                  setState(() {
                    _autoPlayVideos = value;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Data & Storage Settings
          _buildSection(
            'Data & Storage',
            [
              _buildSwitchTile(
                'Offline Mode',
                'Save data for offline viewing',
                Icons.offline_bolt,
                themeProvider.isOfflineMode,
                (value) {
                  themeProvider.setOfflineMode(value);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        value ? 'Offline mode enabled. Data will be cached.' : 'Offline mode disabled.',
                        style: GoogleFonts.poppins(),
                      ),
                      backgroundColor: AppColors.success,
                    ),
                  );
                },
              ),
              _buildActionTile(
                'Clear Cache',
                'Free up ${_cacheSize.toInt()} MB of storage space',
                Icons.cleaning_services,
                () => _showClearCacheDialog(),
              ),
              _buildActionTile(
                'Manage Downloads',
                'View and manage downloaded content',
                Icons.download,
                () => _showComingSoonSnackBar('Download management'),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Regional Settings
          _buildSection(
            'Regional',
            [
              _buildDropdownTile(
                'Currency Format',
                'How prices are displayed',
                Icons.currency_rupee,
                _currencyFormat,
                _currencyFormats,
                (value) {
                  setState(() {
                    _currencyFormat = value!;
                  });
                },
              ),
              _buildActionTile(
                'Date & Time Format',
                'Customize date and time display',
                Icons.access_time,
                () => _showDateTimeFormatDialog(),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Performance Settings
          _buildSection(
            'Performance',
            [
              _buildSwitchTile(
                'Crash Reporting',
                'Help improve the app by sending crash reports',
                Icons.bug_report,
                _crashReporting,
                (value) {
                  setState(() {
                    _crashReporting = value;
                  });
                },
              ),
              _buildActionTile(
                'Performance Monitoring',
                'Monitor app performance and usage',
                Icons.speed,
                () => _showPerformanceDialog(),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Advanced Settings
          _buildSection(
            'Advanced',
            [
              _buildActionTile(
                'Developer Options',
                'Advanced settings for developers',
                Icons.developer_mode,
                () => _showDeveloperOptions(),
              ),
              _buildActionTile(
                'Reset Settings',
                'Reset all settings to default',
                Icons.restore,
                () => _showResetSettingsDialog(),
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

  void _showComingSoonSnackBar(String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '$feature will be available in a future update',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.info,
      ),
    );
  }

  void _showClearCacheDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Clear Cache',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Text(
          'This will clear ${_cacheSize.toInt()} MB of cached data including images and temporary files. The app may take longer to load content initially.',
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
              _clearCache();
            },
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  void _clearCache() {
    // Simulate cache clearing
    setState(() {
      _cacheSize = 0.0;
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Cache cleared successfully',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.success,
      ),
    );

    // Simulate cache building up again
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _cacheSize = 25.0;
        });
      }
    });
  }

  void _showDateTimeFormatDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Date & Time Format',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String>(
              title: const Text('DD/MM/YYYY'),
              value: 'dd/mm/yyyy',
              groupValue: 'dd/mm/yyyy',
              onChanged: (value) {},
            ),
            RadioListTile<String>(
              title: const Text('MM/DD/YYYY'),
              value: 'mm/dd/yyyy',
              groupValue: 'dd/mm/yyyy',
              onChanged: (value) {},
            ),
            RadioListTile<String>(
              title: const Text('YYYY-MM-DD'),
              value: 'yyyy-mm-dd',
              groupValue: 'dd/mm/yyyy',
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

  void _showPerformanceDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Performance Monitoring',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'App Performance Stats:',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            _buildPerformanceStat('Average Load Time', '1.2s'),
            _buildPerformanceStat('Memory Usage', '45 MB'),
            _buildPerformanceStat('Battery Usage', 'Low'),
            _buildPerformanceStat('Network Usage', '2.1 MB today'),
          ],
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

  Widget _buildPerformanceStat(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.poppins(fontSize: 14),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }

  void _showDeveloperOptions() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Developer Options',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Enable Debug Mode'),
              trailing: Switch(
                value: false,
                onChanged: (value) {},
              ),
            ),
            ListTile(
              title: const Text('Show Performance Overlay'),
              trailing: Switch(
                value: false,
                onChanged: (value) {},
              ),
            ),
            ListTile(
              title: const Text('Enable Logging'),
              trailing: Switch(
                value: true,
                onChanged: (value) {},
              ),
            ),
          ],
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

  void _showResetSettingsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Reset Settings',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Text(
          'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
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
              _resetSettings();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
  }

  void _resetSettings() {
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    
    // Reset theme settings
    themeProvider.setDarkMode(false);
    themeProvider.setOfflineMode(false);
    
    // Reset local settings
    setState(() {
      _autoPlayVideos = true;
      _highQualityImages = true;
      _crashReporting = true;
      _currencyFormat = 'Indian Rupee (₹)';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Settings reset to default values',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.success,
      ),
    );
  }
}
