import '../theme_control.dart';
import 'package:flutter/material.dart';

class CircleButton1 extends StatelessWidget {
  CircleButton1({
    required this.icon,
    this.bgcolor,
    this.size,
    required this.btnColor1,
    required this.btnColor2,
    required this.icnColor,
    this.onPressed,
    super.key,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  Color? bgcolor;
  double? size;
  Color btnColor1;
  Color btnColor2;
  Color icnColor;

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
          gradient: LinearGradient(
            colors: [btnColor1, btnColor2],
            begin: Alignment.topLeft,
            end: Alignment.bottomCenter,
          ),
          shape: BoxShape.circle,
          // boxShadow: [
          //   BoxShadow(
          //     color: Colors.black26,
          //     blurRadius: 10,
          //     offset: Offset(2, 4), // Shadow position
          //   ),
          // ],
        ),
        child: Center(
          child: Icon(icon, color: icnColor
              // size: 30, // Adjust the size of the icon
              ),
        ),
      ),
    );
  }
}
