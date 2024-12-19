import 'package:flutter/material.dart';
import 'package:timesheet_project/shared/validation.dart';

class InputField1 extends StatelessWidget {
  InputField1({
    required this.hint,
    required this.icon,
    this.collector,
    this.hideText,
    this.suffixIcon,
    super.key,
  });

  String hint;
  String? collector;
  IconData icon;
  bool? hideText;
  IconData? suffixIcon;

  final valid = ValidationClass();

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return TextFormField(
      obscureText: hideText ?? false,
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: const Color(0xFF03296E)),
        hintText: hint,
        hintStyle: const TextStyle(
          color: Color(0xFF4A4A4A),
        ),
        suffixIcon:
            suffixIcon != null ? Icon(suffixIcon, color: Colors.grey) : null,
        filled: true,
        fillColor: Colors.blue.shade50,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
      validator: (value) {
        // This block below checks the type of input before validation;
        if (hideText == true) {
          // Validate password if hideText is true
          return valid.validatePassword(value ?? '');
        } else {
          // Validate email if hideText is false
          return valid.validateEmail(value ?? '');
        }
        // Ends here
      },
      onSaved: (value) {
        collector = value;
      },
    );
  }
}
