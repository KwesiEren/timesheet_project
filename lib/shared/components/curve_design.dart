import 'package:flutter/material.dart';
// Custom Clipper for Top Curve

class TopCurveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Path path = Path();
    path.lineTo(0, size.height * 0.95); // Start at 65% of height on the left

    path.quadraticBezierTo(
      size.width / 1.8,
      size.height * 0.92, // Control Point: slightly below center
      size.width,
      size.height * 0.50, // End Point: 65% height on the right
    );

    path.lineTo(size.width, 0); // Straight to the top-right corner
    path.close();

    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) {
    return false;
  }
}
