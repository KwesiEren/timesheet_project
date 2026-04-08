import '../theme_control.dart';
import 'package:flutter/material.dart';

class CircleCard1 extends StatelessWidget {
  CircleCard1({required this.imgPath, this.size, super.key, this.onPressed});

  final String imgPath;
  final double? size;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width:
            size ?? screen.width * 0.1, //40, // Adjust the size of the circle
        height: size ?? screen.height * 0.041, //40,
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage(
              imgPath, // Replace with your image URL
            ),
            fit: BoxFit.cover, // Ensures the image fits the circle
          ),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 10,
              offset: Offset(2, 4), // Shadow position
            ),
          ],
        ),
      ),
    );
  }
}
