import 'package:flutter/material.dart';
import '../../../../shared/img_constant.dart';
import '../../../../shared/components/curve_design.dart';

class LoginHeaderWidget extends StatelessWidget {
  const LoginHeaderWidget({super.key});

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Stack(
      children: [
        ClipPath(
          clipper: TopCurveClipper(),
          child: Container(
            height: screen.height * 0.35,
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage(ImgAssets.splashBg),
                fit: BoxFit.cover,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
