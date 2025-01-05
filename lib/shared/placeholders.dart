import 'package:flutter/material.dart';

class MyPlaceholders {
  static Widget StatColumn1({
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Text(label, style: TextStyle(color: color)),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(color: color, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
