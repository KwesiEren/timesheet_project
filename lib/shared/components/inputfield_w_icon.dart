import 'package:flutter/material.dart';
// Custom TextField Widget

// Widget _buildTextField({
//     required String hint,
//     required IconData icon,
//     bool obscureText = false,
//     IconData? suffixIcon,
//   }) {
//     return TextField(
//       obscureText: obscureText,
//       decoration: InputDecoration(
//         prefixIcon: Icon(icon, color: const Color(0xFF03296E)),
//         hintText: hint,
//         hintStyle: const TextStyle(
//           color: Color(0xFF4A4A4A),
//         ),
//         suffixIcon:
//             suffixIcon != null ? Icon(suffixIcon, color: Colors.grey) : null,
//         filled: true,
//         fillColor: Colors.blue.shade50,
//         border: OutlineInputBorder(
//           borderRadius: BorderRadius.circular(12),
//           borderSide: BorderSide.none,
//         ),
//       ),
//     );
//   }

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
                                if (value == null || value.isEmpty) {
                                  return 'Password will remain unchanged if empty';
                                }
                                if (value.length < 8) {
                                  return 'Password must be at least 8 characters long.';
                                }
                                if (value != _password) {
                                  return 'Password does not match!';
                                }
                                return null;
                              },
                              onSaved: (value) {
                                collector = value;
                              },
    );
  }
}
