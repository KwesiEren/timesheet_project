import '../theme_control.dart';
import 'package:flutter/material.dart';
import 'package:timesheet_project/shared/validation.dart';

class InputField1 extends StatelessWidget {
  InputField1({
    required this.hint,
    required this.icon,
    this.controller,
    this.hideText,
    this.suffixIcon,
    super.key,
    this.callback,
  });

  final String hint;
  final IconData icon;
  final TextEditingController? controller;
  final bool? hideText;
  final IconData? suffixIcon;
  final VoidCallback? callback;

  final valid = ValidationClass();

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: hideText ?? false,
      decoration: InputDecoration(
        errorBorder: OutlineInputBorder(
            borderSide: const BorderSide(color: Color(0xFFF44336)),
            borderRadius: BorderRadius.circular(20)),
        focusedBorder:
            OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
        focusColor: ThemeCtrl.colors.color1,
        prefixIcon: Icon(
          icon,
          color: ThemeCtrl.colors.coloricn,
        ),
        hintText: hint,
        hintStyle: TextStyle(
          fontFamily: 'Comfortaa',
          color: ThemeCtrl.colors.color5,
        ),
        suffixIcon: suffixIcon != null
            ? GestureDetector(
                onTap: callback, child: Icon(suffixIcon, color: Colors.grey))
            : null,
        filled: true,
        fillColor: ThemeCtrl.colors.color3,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
      validator: (value) {
        // This block below checks the type of input before validation;
        if (hideText == true) {
          // Validate password if hideText is true
          return valid.validatePassword(value);
        } else {
          // Validate email if hideText is false
          return valid.validateEmail(value);
        }
        // Ends here
      },
    );
  }
}
