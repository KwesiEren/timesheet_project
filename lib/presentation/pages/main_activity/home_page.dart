import 'package:flutter/material.dart';
import 'package:timesheet_project/presentation/pages/side_activity/notifications_page.dart';

import '../../../shared/components/curvednavbar/navbar.dart';
import '../../../shared/img_constant.dart';
import '../../../shared/theme_control.dart';
import '../../../shared/components/appbar/appbar1.dart';
import 'activities_page.dart';
import 'announcement_page.dart';
import 'calendar_page.dart';
import 'timecard_page.dart';
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
        width: screen.width * 0.7,
        backgroundColor: ThemeCtrl.colors.colorbg,
        child: Column(
          children: [
            // Drawer Header
            UserAccountsDrawerHeader(
              accountName: const Text(
                'Username',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              accountEmail: const Text('#402914244'),
              currentAccountPicture: const CircleAvatar(
                backgroundImage:
                    AssetImage(ImgAssets.splashBg), // Replace with your asset
              ),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    ThemeCtrl.colors.coloricn,
                    ThemeCtrl.colors.colorbtn1
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),

            // Drawer Items
            ListTile(
              leading: const Icon(Icons.person_outline),
              title: const Text('Profile'),
              onTap: () {
                // Handle Profile navigation
              },
            ),
            SizedBox(height: screen.height * 0.005),
            ListTile(
              leading: const Icon(Icons.notifications_outlined),
              title: const Text('Notifications'),
              onTap: () {
                // Handle Notifications navigation
              },
            ),
            SizedBox(height: screen.height * 0.005),
            ListTile(
              leading: const Icon(Icons.description_outlined),
              title: const Text('Terms and Conditions'),
              onTap: () {
                // Handle Terms and Conditions navigation
              },
            ),
            SizedBox(height: screen.height * 0.005),
            ListTile(
              leading: const Icon(Icons.phone_outlined),
              title: const Text('Contact Us'),
              onTap: () {
                // Handle Contact Us navigation
              },
            ),

            const Spacer(), // Pushes the logout button to the bottom

            // Logout Button
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                onPressed: () {
                  // Handle logout
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: ThemeCtrl.colors.colorbtn1,
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Log Out',
                  style: TextStyle(color: Colors.white, fontSize: 16),
                ),
              ),
            ),
          ],
        ),
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
