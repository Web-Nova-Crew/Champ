import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/property_provider.dart';
import '../../utils/app_colors.dart';

class SearchHistoryScreen extends StatefulWidget {
  const SearchHistoryScreen({super.key});

  @override
  State<SearchHistoryScreen> createState() => _SearchHistoryScreenState();
}

class _SearchHistoryScreenState extends State<SearchHistoryScreen> {
  List<SearchHistoryItem> _searchHistory = [];

  @override
  void initState() {
    super.initState();
    _loadSearchHistory();
  }

  void _loadSearchHistory() {
    // TODO: Load from SharedPreferences or API
    setState(() {
      _searchHistory = [
        SearchHistoryItem(
          query: '3 BHK Apartment in Gomti Nagar',
          timestamp: DateTime.now().subtract(const Duration(hours: 2)),
          filters: {
            'propertyType': 'Apartment',
            'bedrooms': '3',
            'location': 'Gomti Nagar',
            'transactionType': 'Buy',
          },
        ),
        SearchHistoryItem(
          query: 'Villa under 50 Lac',
          timestamp: DateTime.now().subtract(const Duration(days: 1)),
          filters: {
            'propertyType': 'Villa',
            'maxPrice': '5000000',
            'transactionType': 'Buy',
          },
        ),
        SearchHistoryItem(
          query: 'Rental properties in Hazratganj',
          timestamp: DateTime.now().subtract(const Duration(days: 3)),
          filters: {
            'location': 'Hazratganj',
            'transactionType': 'Rent',
          },
        ),
        SearchHistoryItem(
          query: '2 BHK Furnished',
          timestamp: DateTime.now().subtract(const Duration(days: 5)),
          filters: {
            'bedrooms': '2',
            'furnished': 'true',
            'transactionType': 'Rent',
          },
        ),
        SearchHistoryItem(
          query: 'Commercial space in Alambagh',
          timestamp: DateTime.now().subtract(const Duration(days: 7)),
          filters: {
            'propertyType': 'Commercial',
            'location': 'Alambagh',
            'transactionType': 'Buy',
          },
        ),
      ];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Search History',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        actions: [
          if (_searchHistory.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear_all),
              onPressed: _showClearAllDialog,
            ),
        ],
      ),
      body: _searchHistory.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _searchHistory.length,
              itemBuilder: (context, index) {
                final item = _searchHistory[index];
                return _buildSearchHistoryItem(item, index);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.history,
            size: 80,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 16),
          Text(
            'No search history yet',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your property searches will appear here',
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pushNamed(context, '/home');
            },
            icon: const Icon(Icons.search),
            label: const Text('Start Searching'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchHistoryItem(SearchHistoryItem item, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            Icons.history,
            color: AppColors.primary,
            size: 20,
          ),
        ),
        title: Text(
          item.query,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              _formatTimestamp(item.timestamp),
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: item.filters.entries.map((entry) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${_formatFilterKey(entry.key)}: ${entry.value}',
                    style: GoogleFonts.poppins(
                      fontSize: 10,
                      color: AppColors.secondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'search_again') {
              _searchAgain(item);
            } else if (value == 'delete') {
              _deleteSearchItem(index);
            }
          },
          itemBuilder: (context) => [
            PopupMenuItem(
              value: 'search_again',
              child: Row(
                children: [
                  const Icon(Icons.search, size: 18, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    'Search Again',
                    style: GoogleFonts.poppins(fontSize: 14),
                  ),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  const Icon(Icons.delete, size: 18, color: Colors.red),
                  const SizedBox(width: 8),
                  Text(
                    'Delete',
                    style: GoogleFonts.poppins(fontSize: 14),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 60) {
      return '${difference.inMinutes} minutes ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hours ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    }
  }

  String _formatFilterKey(String key) {
    switch (key) {
      case 'propertyType':
        return 'Type';
      case 'transactionType':
        return 'For';
      case 'bedrooms':
        return 'BHK';
      case 'maxPrice':
        return 'Max Price';
      case 'minPrice':
        return 'Min Price';
      case 'location':
        return 'Location';
      case 'furnished':
        return 'Furnished';
      default:
        return key;
    }
  }

  void _searchAgain(SearchHistoryItem item) {
    final propertyProvider = Provider.of<PropertyProvider>(context, listen: false);
    
    // Apply filters from search history
    item.filters.forEach((key, value) {
      switch (key) {
        case 'propertyType':
          propertyProvider.filterByPropertyType(value);
          break;
        case 'transactionType':
          propertyProvider.filterByTransactionType(value);
          break;
        case 'location':
          propertyProvider.searchProperties(value);
          break;
      }
    });

    Navigator.pushNamed(context, '/home');
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Applied filters from: ${item.query}',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.success,
      ),
    );
  }

  void _deleteSearchItem(int index) {
    setState(() {
      _searchHistory.removeAt(index);
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Search history item deleted',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.success,
        action: SnackBarAction(
          label: 'Undo',
          onPressed: () {
            // TODO: Implement undo functionality
          },
        ),
      ),
    );
  }

  void _showClearAllDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Clear All History',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        content: Text(
          'Are you sure you want to clear all search history? This action cannot be undone.',
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
              _clearAllHistory();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
  }

  void _clearAllHistory() {
    setState(() {
      _searchHistory.clear();
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'All search history cleared',
          style: GoogleFonts.poppins(),
        ),
        backgroundColor: AppColors.success,
      ),
    );
  }
}

class SearchHistoryItem {
  final String query;
  final DateTime timestamp;
  final Map<String, String> filters;

  SearchHistoryItem({
    required this.query,
    required this.timestamp,
    required this.filters,
  });
}
