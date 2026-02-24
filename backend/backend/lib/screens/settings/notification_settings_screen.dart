import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../utils/app_colors.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  bool _pushNotifications = true;
  bool _emailNotifications = true;
  bool _smsNotifications = false;
  bool _newPropertyAlerts = true;
  bool _priceDropAlerts = true;
  bool _bookingReminders = true;
  bool _messageNotifications = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Notification Settings',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20.0),
        children: [
          // Push Notifications
          _buildSection(
            'Push Notifications',
            [
              _buildSwitchTile(
                'Enable Push Notifications',
                'Receive notifications on your device',
                _pushNotifications,
                (value) {
                  setState(() {
                    _pushNotifications = value;
                  });
                  // TODO: Save to backend
                },
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Email Notifications
          _buildSection(
            'Email Notifications',
            [
              _buildSwitchTile(
                'Enable Email Notifications',
                'Receive notifications via email',
                _emailNotifications,
                (value) {
                  setState(() {
                    _emailNotifications = value;
                  });
                  // TODO: Save to backend
                },
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // SMS Notifications
          _buildSection(
            'SMS Notifications',
            [
              _buildSwitchTile(
                'Enable SMS Notifications',
                'Receive notifications via SMS',
                _smsNotifications,
                (value) {
                  setState(() {
                    _smsNotifications = value;
                  });
                  // TODO: Save to backend
                },
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Alert Preferences
          _buildSection(
            'Alert Preferences',
            [
              _buildSwitchTile(
                'New Property Alerts',
                'Get notified when new properties matching your criteria are added',
                _newPropertyAlerts,
                (value) {
                  setState(() {
                    _newPropertyAlerts = value;
                  });
                },
              ),
              _buildSwitchTile(
                'Price Drop Alerts',
                'Get notified when prices drop on saved properties',
                _priceDropAlerts,
                (value) {
                  setState(() {
                    _priceDropAlerts = value;
                  });
                },
              ),
              _buildSwitchTile(
                'Booking Reminders',
                'Get reminders for scheduled property visits',
                _bookingReminders,
                (value) {
                  setState(() {
                    _bookingReminders = value;
                  });
                },
              ),
              _buildSwitchTile(
                'Message Notifications',
                'Get notified when you receive new messages',
                _messageNotifications,
                (value) {
                  setState(() {
                    _messageNotifications = value;
                  });
                },
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
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _buildSwitchTile(String title, String subtitle, bool value, ValueChanged<bool> onChanged) {
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
      value: value,
      onChanged: onChanged,
      activeColor: AppColors.primary,
    );
  }
}

