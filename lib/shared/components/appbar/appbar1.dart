import 'package:flutter/material.dart';
import 'package:timesheet_project/presentation/pages/main_activity/activities_page.dart';
import 'package:timesheet_project/shared/components/appbar/drawer_button.dart';
import 'package:timesheet_project/shared/components/appbar/leading_button.dart';

import '../../img_constant.dart';
import '../../theme_control.dart';

class CustomAppBar1 extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final double height;
  final Widget navigationDestination;
  final int? notificationCount;

  const CustomAppBar1(
      {Key? key,
      required this.title,
      this.height = 80.0,
      required this.navigationDestination,
      this.notificationCount})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screen = MediaQuery.of(context).size;

    return PreferredSize(
      preferredSize: Size.fromHeight(height),
      child: Container(
        color: ThemeCtrl.colors.colorbg,
        padding: EdgeInsets.symmetric(horizontal: screen.width * 0.04),
        child: SafeArea(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              LeadingButton(
                size: screen.width * 0.14, // 14% of screen width
                icons: Icons.notifications_outlined,
                icnColor: ThemeCtrl.colors.colorw,
                btnColor1: ThemeCtrl.colors.coloricn,
                btnColor2: ThemeCtrl.colors.colorbtn1,
                destination: navigationDestination,
                notificationCount: notificationCount ?? 0,
              ),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TrailingButton(
                imagePath: ImgAssets.splashBg,
                size: screen.width * 0.14,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(height);
}
