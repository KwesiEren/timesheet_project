import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';
import 'package:timesheet_project/shared/components/curvednavbar/navbar.dart';
import 'custom_navbar.dart';
import '../../shared/img_constant.dart';
import '../../shared/theme_control.dart';

import '../../shared/components/button_2.dart';
import '../../shared/components/circlecard1.dart';

import '../../presentation/pages/resetpassword_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final Color iconColor = ThemeCtrl.colors.color2;
  final List<IconData> _navigationItems = [
    Icons.home_outlined,
    Icons.alarm_add_outlined,
    Icons.task_outlined,
    Icons.announcement_outlined,
    Icons.calendar_month_outlined,
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Screen'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(15),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CircleCard1(
                    onPressed: () {},
                    imgPath: ImgAssets.splashBg,
                    size: 50,
                  ),
                  const Text('Dashboard'),
                  CircleButton1(
                    onPressed: () {},
                    size: 50,
                    icon: Icons.notifications_outlined,
                    icnColor: ThemeCtrl.colors.colorw,
                    btnColor1: ThemeCtrl.colors.coloricn,
                    btnColor2: ThemeCtrl.colors.colorbtn1,
                  )
                ],
              )
            ],
          ),
        ),
      ),
      bottomNavigationBar: CustomNavBar(
        items: _navigationItems,
        color: ThemeCtrl.colors.colorw,
        selectedIconColor: ThemeCtrl.colors.colorw,
        unselectedIconColor: ThemeCtrl.colors.color1,
        backgroundColor: const Color.fromARGB(0, 4, 51, 160),
        buttonBackgroundColor: ThemeCtrl.colors.color1,
      ),
    );
  }
}
