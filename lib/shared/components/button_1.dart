import 'package:flutter/material.dart';

class ActionButton1 extends StatelessWidget {
  ActionButton1({
    required this.text,
    this.txtcolor,
    required this.size,
    this.btnHeight,
    this.btnWidth,
    required this.btnColor,
    required this.borderRadius,
    super.key,
    this.onPressed,
  });

  String text;
  final VoidCallback? onPressed;
  Color? txtcolor;
  double size;
  double? btnHeight;
  double? btnWidth;
  Color btnColor;
  double borderRadius;

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        margin: const EdgeInsets.all(8),
        height: btnHeight ?? 40,
        width: btnWidth ?? screen.width * 0.4,
        decoration: BoxDecoration(
          border: Border.all(color: const Color.fromARGB(120, 39, 39, 39)),
          color: btnColor,
          borderRadius: BorderRadius.circular(borderRadius),
          boxShadow: const [
            BoxShadow(
              color: Colors.black26,
              offset: Offset(-3, 3),
              blurRadius: 4,
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              text,
              style: TextStyle(
                fontSize: size,
                color: txtcolor ?? Colors.white,
                fontWeight: FontWeight.bold,
              ),
            )
          ],
        ),
      ),
    );
  }
}
