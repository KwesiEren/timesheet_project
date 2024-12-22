import 'dart:math';
import 'package:flutter/material.dart';

class NavBar1 extends StatefulWidget {
  final List<IconData> icons;
  final int defaultSelectedIndex;
  final ValueChanged<int> onTap;

  const NavBar1({
    Key? key,
    required this.icons,
    this.defaultSelectedIndex = 0,
    required this.onTap,
  }) : super(key: key);

  @override
  State<NavBar1> createState() => _NavBar1State();
}

class _NavBar1State extends State<NavBar1> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.defaultSelectedIndex;
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final itemWidth = width / widget.icons.length;
        final centerPosition = (_currentIndex + 0.5) * itemWidth;

        return Stack(
          alignment: Alignment.bottomCenter,
          children: [
            // Bottom Navigation Bar
            Container(
              height: 60,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: widget.icons.map((icon) {
                  final index = widget.icons.indexOf(icon);
                  return GestureDetector(
                    onTap: () => _onItemTapped(index),
                    child: Icon(
                      icon,
                      size: 30,
                      color: _currentIndex == index ? Colors.blue : Colors.grey,
                    ),
                  );
                }).toList(),
              ),
            ),

            // Floating Button
            Positioned(
              bottom: 20,
              left: centerPosition - 30,
              child: Transform.translate(
                offset: const Offset(0, -20),
                child: Material(
                  elevation: 10,
                  color: Colors.blue,
                  shape: const CircleBorder(),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Icon(
                      widget.icons[_currentIndex],
                      color: Colors.white,
                      size: 30,
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  void _onItemTapped(int index) {
    if (_currentIndex != index) {
      setState(() {
        _currentIndex = index;
      });
      widget.onTap(index);
    }
  }
}
