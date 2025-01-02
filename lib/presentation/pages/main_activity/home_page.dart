import 'package:flutter/material.dart';
import 'package:timesheet_project/presentation/pages/side_activity/notifications_page.dart';

import '../../../shared/components/curvednavbar/navbar.dart';
import '../../../shared/theme_control.dart';
import '../../../shared/components/appbar/appbar1.dart';
import 'activities_page.dart';
import 'announcement_page.dart';
import 'calendar_page.dart';
import 'checkin_page.dart';
import 'dashboard_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  List<dynamic> _gottenData = [];

  final List<Widget> _pages = [
    const DashboardPage(),
    const PunchInPage(),
    const ActivitiesPage(),
    const AnnouncementPage(),
    const CalendarPage()
  ];

  final List<String> _titles = [
    'Dashboard',
    'TimeCard',
    'Activities',
    'Announcements',
    'Calendar',
  ];

  final List<IconData> _navigationItems = [
    Icons.home_outlined,
    Icons.alarm_add_outlined,
    Icons.task_outlined,
    Icons.campaign_outlined,
    Icons.calendar_month_outlined,
  ];

  void _onNavBarTap(int index) {
    setState(() {
      _currentIndex = index;
    });
    _pageController
        .jumpToPage(index); // Optionally use animateToPage for animations
  }

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      appBar: CustomAppBar1(
        notificationCount: _gottenData.length,
        height: 85,
        navigationDestination: const NotificationsPage(),
        title: _titles[_currentIndex],
      ),
      backgroundColor: ThemeCtrl.colors.colorbg,
      endDrawer: Drawer(
        width: screen.width * 0.6,
        backgroundColor: Colors.blueAccent,
      ),
      body: PageView(
        physics: const NeverScrollableScrollPhysics(),
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        children: _pages,
      ),
      bottomNavigationBar: CustomNavBar(
        items: _navigationItems,
        height: 60,
        color: ThemeCtrl.colors.coloricn,
        selectedIconColor: ThemeCtrl.colors.coloricn,
        unselectedIconColor: ThemeCtrl.colors.colorw,
        backgroundColor: const Color.fromARGB(0, 4, 51, 160),
        buttonBackgroundColor: ThemeCtrl.colors.color3,
        animationDuration: const Duration(milliseconds: 300),
        index: _currentIndex,
        onTap: _onNavBarTap,
      ),
    );
  }
}
