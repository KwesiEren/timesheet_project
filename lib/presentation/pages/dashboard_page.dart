// import 'package:flutter/material.dart';
// import 'package:get/route_manager.dart';
// import '../../shared/components/custom_navbar.dart';
// import '../../shared/img_constant.dart';
// import '../../shared/theme_control.dart';

// import '../../shared/components/button_2.dart';
// import '../../shared/components/circlecard1.dart';

// import '../../presentation/pages/resetpassword_page.dart';

// class DashboardPage extends StatefulWidget {
//   const DashboardPage({super.key});

//   @override
//   State<DashboardPage> createState() => _DashboardPageState();
// }

// class _DashboardPageState extends State<DashboardPage> {
//   final Color iconColor = ThemeCtrl.colors.color2;
//   final List<Widget> _navigationItems = [
//     Icon(
//       Icons.home_outlined,
//       color: ThemeCtrl.colors.colorw,
//     ),
//     Icon(
//       Icons.alarm_add_outlined,
//       color: ThemeCtrl.colors.colorw,
//     ),
//     Icon(
//       Icons.task_outlined,
//       color: ThemeCtrl.colors.colorw,
//     ),
//     Icon(
//       Icons.announcement_outlined,
//       color: ThemeCtrl.colors.colorw,
//     ),
//     Icon(
//       Icons.calendar_month_outlined,
//       color: ThemeCtrl.colors.colorw,
//     ),
//   ];

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Dashboard Screen'),
//         centerTitle: true,
//       ),
//       body: SafeArea(
//         child: Padding(
//           padding: const EdgeInsets.all(15),
//           child: Column(
//             children: [
//               Row(
//                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                 children: [
//                   CircleCard1(
//                     onPressed: () {},
//                     imgPath: ImgAssets.splashBg,
//                     size: 50,
//                   ),
//                   const Text('Dashboard'),
//                   CircleButton1(
//                     onPressed: () {},
//                     size: 50,
//                     icon: Icons.notifications_outlined,
//                     icnColor: ThemeCtrl.colors.colorw,
//                     btnColor1: ThemeCtrl.colors.coloricn,
//                     btnColor2: ThemeCtrl.colors.colorbtn1,
//                   )
//                 ],
//               )
//             ],
//           ),
//         ),
//       ),
//       // bottomNavigationBar: CurvedNavigationBar(
//       //   onTap: (index) {
//       //     if (index == 1) {
//       //       Get.to(const ResetPasswordPage());
//       //     }
//       //   },
//       //   items: _navigationItems,
//       //   buttonBackgroundColor: ThemeCtrl.colors.color1,
//       //   backgroundColor: ThemeCtrl.colors.nocolor,
//       // ),

//       bottomNavigationBar: NavBar1(
//         // navBarColor: Colors.red,
//         icons: [
//           Icons.home_outlined,
//           Icons.alarm_add_outlined,
//           Icons.task_outlined,
//           Icons.announcement_outlined,
//           Icons.calendar_month_outlined,
//         ],
//         onTap: (int index) {
//           setState(() {});
//         },
//       ),
//     );
//   }
// }
