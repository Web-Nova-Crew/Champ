import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math';
import '../../utils/app_colors.dart';

class EMICalculatorScreen extends StatefulWidget {
  const EMICalculatorScreen({super.key});

  @override
  State<EMICalculatorScreen> createState() => _EMICalculatorScreenState();
}

class _EMICalculatorScreenState extends State<EMICalculatorScreen> {
  final _formKey = GlobalKey<FormState>();
  final _loanAmountController = TextEditingController(text: '5000000');
  final _interestRateController = TextEditingController(text: '8.5');
  final _tenureController = TextEditingController(text: '20');
  
  double _emi = 0;
  double _totalInterest = 0;
  double _totalPayment = 0;
  double _loanAmount = 5000000;
  double _interestRate = 8.5;
  int _tenure = 20;
  
  @override
  void initState() {
    super.initState();
    _calculateEMI();
  }
  
  @override
  void dispose() {
    _loanAmountController.dispose();
    _interestRateController.dispose();
    _tenureController.dispose();
    super.dispose();
  }
  
  void _calculateEMI() {
    double principal = double.tryParse(_loanAmountController.text.replaceAll(',', '')) ?? 0;
    double rate = double.tryParse(_interestRateController.text) ?? 0;
    int months = (int.tryParse(_tenureController.text) ?? 0) * 12;
    
    if (principal > 0 && rate > 0 && months > 0) {
      double monthlyRate = rate / 12 / 100;
      double emi = principal * monthlyRate * pow(1 + monthlyRate, months) / (pow(1 + monthlyRate, months) - 1);
      
      setState(() {
        _loanAmount = principal;
        _interestRate = rate;
        _tenure = months ~/ 12;
        _emi = emi;
        _totalPayment = emi * months;
        _totalInterest = _totalPayment - principal;
      });
    }
  }
  
  String _formatCurrency(double amount) {
    if (amount >= 10000000) {
      return '₹${(amount / 10000000).toStringAsFixed(2)} Cr';
    } else if (amount >= 100000) {
      return '₹${(amount / 100000).toStringAsFixed(2)} L';
    } else {
      return '₹${amount.toStringAsFixed(0)}';
    }
  }
  
  String _formatNumber(double amount) {
    return amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'EMI Calculator',
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // EMI Result Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: AppColors.primaryGradient,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Text(
                      'Monthly EMI',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '₹${_formatNumber(_emi)}',
                      style: GoogleFonts.poppins(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildResultItem('Principal', _formatCurrency(_loanAmount)),
                        Container(width: 1, height: 40, color: Colors.white30),
                        _buildResultItem('Interest', _formatCurrency(_totalInterest)),
                        Container(width: 1, height: 40, color: Colors.white30),
                        _buildResultItem('Total', _formatCurrency(_totalPayment)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
              
              // Loan Amount
              Text(
                'Loan Amount',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _loanAmountController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  prefixText: '₹ ',
                  hintText: 'Enter loan amount',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
                onChanged: (_) => _calculateEMI(),
              ),
              const SizedBox(height: 8),
              Slider(
                value: _loanAmount.clamp(100000, 100000000),
                min: 100000,
                max: 100000000,
                divisions: 100,
                activeColor: AppColors.primary,
                inactiveColor: AppColors.primary.withOpacity(0.2),
                onChanged: (value) {
                  _loanAmountController.text = value.toInt().toString();
                  _calculateEMI();
                },
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('₹1 L', style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
                  Text('₹10 Cr', style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
              const SizedBox(height: 24),
              
              // Interest Rate
              Text(
                'Interest Rate (% per annum)',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _interestRateController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  suffixText: '%',
                  hintText: 'Enter interest rate',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
                onChanged: (_) => _calculateEMI(),
              ),
              const SizedBox(height: 8),
              Slider(
                value: _interestRate.clamp(5, 20),
                min: 5,
                max: 20,
                divisions: 30,
                activeColor: AppColors.secondary,
                inactiveColor: AppColors.secondary.withOpacity(0.2),
                onChanged: (value) {
                  _interestRateController.text = value.toStringAsFixed(1);
                  _calculateEMI();
                },
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('5%', style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
                  Text('20%', style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
              const SizedBox(height: 24),
              
              // Loan Tenure
              Text(
                'Loan Tenure (Years)',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _tenureController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  suffixText: 'Years',
                  hintText: 'Enter loan tenure',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
                onChanged: (_) => _calculateEMI(),
              ),
              const SizedBox(height: 8),
              Slider(
                value: _tenure.toDouble().clamp(1, 30),
                min: 1,
                max: 30,
                divisions: 29,
                activeColor: AppColors.accent,
                inactiveColor: AppColors.accent.withOpacity(0.2),
                onChanged: (value) {
                  _tenureController.text = value.toInt().toString();
                  _calculateEMI();
                },
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('1 Year', style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
                  Text('30 Years', style: GoogleFonts.poppins(fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
              const SizedBox(height: 30),
              
              // Payment Breakdown
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Payment Breakdown',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildBreakdownRow('Principal Amount', '₹${_formatNumber(_loanAmount)}', AppColors.primary),
                    const SizedBox(height: 12),
                    _buildBreakdownRow('Total Interest', '₹${_formatNumber(_totalInterest)}', AppColors.secondary),
                    const Divider(height: 24),
                    _buildBreakdownRow('Total Payment', '₹${_formatNumber(_totalPayment)}', AppColors.deepBlue, isBold: true),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              
              // Yearly Breakdown
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Quick Facts',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildFactRow(Icons.calendar_month, 'Total Months', '${_tenure * 12} months'),
                    const SizedBox(height: 12),
                    _buildFactRow(Icons.percent, 'Interest Rate', '${_interestRate.toStringAsFixed(1)}% p.a.'),
                    const SizedBox(height: 12),
                    _buildFactRow(Icons.pie_chart, 'Interest %', '${((_totalInterest / _totalPayment) * 100).toStringAsFixed(1)}% of total'),
                  ],
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildResultItem(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 12,
            color: Colors.white70,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ],
    );
  }
  
  Widget _buildBreakdownRow(String label, String value, Color color, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            const SizedBox(width: 12),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 14,
                fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
            color: color,
          ),
        ),
      ],
    );
  }
  
  Widget _buildFactRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(width: 12),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
