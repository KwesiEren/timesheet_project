import 'package:flutter/material.dart';

class LeadingButton extends StatelessWidget {
  final double size;
  final IconData icons;
  final Color icnColor;
  final Color btnColor1;
  final Color btnColor2;
  final Widget destination;

  const LeadingButton({
    Key? key,
    required this.size,
    required this.icons,
    required this.icnColor,
    required this.btnColor1,
    required this.btnColor2,
    required this.destination,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
              builder: (context) => destination), // Navigate to a new screen
        );
      },
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
        ),
        child: Center(
          child: Icon(icons, color: icnColor
              // size: 30, // Adjust the size of the icon
              ),
        ),
      ),
    );
  }
}
