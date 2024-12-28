import 'package:flutter/material.dart';

class AddActivityButton extends StatelessWidget {
  final VoidCallback onPressed;

  const AddActivityButton({super.key, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Circular background with a '+' symbol overlay
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.blue.withOpacity(0.1),
            ),
            child: const Icon(
              Icons.add,
              size: 30,
              color: Colors.blue,
            ),
          ),
          // Positioned text overlay
          Positioned(
            bottom: -20,
            child: Text(
              'Add Activity',
              style: TextStyle(
                fontSize: 14,
                color: Colors.blue[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
