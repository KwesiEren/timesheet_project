import 'package:flutter/material.dart';

class TrailingButton extends StatelessWidget {
  final double size;

  final String imagePath;

  const TrailingButton({
    Key? key,
    required this.size,
    required this.imagePath,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return GestureDetector(
      onTap: () {
        Scaffold.of(context).openEndDrawer(); // Activates the drawer
      },
      child: Container(
        width:
            size ?? screen.width * 0.1, //40, // Adjust the size of the circle
        height: size ?? screen.height * 0.041, //40,
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage(
              imagePath, // Replace with your image URL
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
