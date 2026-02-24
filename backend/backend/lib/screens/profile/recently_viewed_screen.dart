import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/property_provider.dart';
import '../../providers/recently_viewed_provider.dart';
import '../../utils/app_colors.dart';
import '../../widgets/property_card.dart';

class RecentlyViewedScreen extends StatelessWidget {
  const RecentlyViewedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final recentlyViewedProvider = Provider.of<RecentlyViewedProvider>(context);
    final propertyProvider = Provider.of<PropertyProvider>(context);
    
    final recentlyViewedProperties = propertyProvider.properties
        .where((p) => recentlyViewedProvider.recentlyViewedIds.contains(p.id))
        .toList();
    
    // Sort by recently viewed order
    recentlyViewedProperties.sort((a, b) {
      final indexA = recentlyViewedProvider.recentlyViewedIds.indexOf(a.id);
      final indexB = recentlyViewedProvider.recentlyViewedIds.indexOf(b.id);
      return indexA.compareTo(indexB);
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Recently Viewed',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        actions: [
          if (recentlyViewedProperties.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: Text(
                      'Clear History',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                    ),
                    content: Text(
                      'Are you sure you want to clear your viewing history?',
                      style: GoogleFonts.poppins(),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          recentlyViewedProvider.clearAll();
                          Navigator.pop(context);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                        ),
                        child: const Text('Clear'),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
      body: recentlyViewedProperties.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.history,
                    size: 80,
                    color: AppColors.textSecondary.withOpacity(0.5),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No recently viewed properties',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Properties you view will appear here',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: AppColors.textLight,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: recentlyViewedProperties.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: PropertyCard(property: recentlyViewedProperties[index]),
                );
              },
            ),
    );
  }
}
