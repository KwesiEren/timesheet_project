import 'package:flutter/material.dart';
import 'package:timesheet_project/presentation/pages/main_activity/activities_page.dart';
import 'package:timesheet_project/presentation/pages/main_activity/announcement_page.dart';
import 'package:timesheet_project/presentation/pages/main_activity/calendar_page.dart';
import 'package:timesheet_project/presentation/pages/main_activity/timecard_page.dart';
import 'package:timesheet_project/shared/components/appbar/appbar1.dart';
import '../../../shared/components/curvednavbar/navbar.dart';

import '../../../shared/img_constant.dart';
import '../../../shared/theme_control.dart';

import '../../../shared/components/button_2.dart';
import '../../../shared/components/circlecard1.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int _currentIndex = 0;

  //Logics used in the Dashboard screen here;

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      //

      backgroundColor: ThemeCtrl.colors.colorbg,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              children: [
                SizedBox(height: screen.height * 0.14), // 14% of screen height

                Center(
                  child: Container(
                    width: screen.width * 0.97, // 97% of screen width

                    height: screen.height * 0.45, // 45% of screen height
                    decoration: BoxDecoration(
                        color: ThemeCtrl.colors.colorw,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: const [
                          BoxShadow(
                              color: Color(0x73140606),
                              offset: Offset(2, 3),
                              blurRadius: 8)
                        ]),
                    child: Column(
                      children: [
                        //Todays checkin time;
                        Container(
                          padding: const EdgeInsets.all(10),
                          width: screen.width * 0.97, // 97% of screen width

                          height: screen.height * 0.14, // 14% of screen height
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '9 : 23 AM',
                                    style: TextStyle(
                                      fontSize: screen.width *
                                          0.08, // 8% of screen width
                                      color: ThemeCtrl.colors.color2,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Comfortaa',
                                    ),
                                  ),
                                  Text(
                                    'Today\'s in time',
                                    style: TextStyle(
                                      fontSize: screen.width *
                                          0.05, // 5% of screen width                                      color: ThemeCtrl.colors.color5,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Comfortaa',
                                    ),
                                  )
                                ],
                              ),
                              CircleButton1(
                                icon: Icons.work_outline,
                                btnColor1: ThemeCtrl.colors.color3,
                                btnColor2: ThemeCtrl.colors.color3,
                                icnColor: ThemeCtrl.colors.color2,
                                size: 40,
                              )
                            ],
                          ),
                        ),
                        Divider(
                          indent: screen.width * 0.03, // 3% of screen width
                          endIndent: screen.width * 0.03,
                          height: screen.height * 0.01, // 1% of screen height

                          color: const Color(0x6D000000),
                        ),

                        //Activities status;
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            //Completed ;
                            Container(
                              padding: const EdgeInsets.all(10),
                              width: screen.width * 0.4, // 40% of screen width
                              height:
                                  screen.height * 0.14, // 14% of screen height
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '13',
                                        style: TextStyle(
                                          fontSize: screen.width *
                                              0.08, // 8% of screen width
                                          color: ThemeCtrl.colors.color2,
                                          fontWeight: FontWeight.bold,
                                          fontFamily: 'Comfortaa',
                                        ),
                                      ),
                                      Text(
                                        'Activites\nCompleted',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: ThemeCtrl.colors.color5,
                                          fontWeight: FontWeight.bold,
                                          fontFamily: 'Comfortaa',
                                        ),
                                      )
                                    ],
                                  ),
                                  CircleButton1(
                                    icon: Icons.task_alt_sharp,
                                    btnColor1: ThemeCtrl.colors.color3,
                                    btnColor2: ThemeCtrl.colors.color3,
                                    icnColor: ThemeCtrl.colors.color2,
                                    size: 40,
                                  )
                                ],
                              ),
                            ),
                            Container(
                              width: 1.2,
                              height: 80,
                              color: const Color(0x6D000000),
                            ),

                            //Uncompleted;
                            Container(
                              padding: const EdgeInsets.all(10),
                              width: screen.width * 0.4, // 40% of screen width
                              height:
                                  screen.height * 0.14, // 14% of screen height
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '7',
                                        style: TextStyle(
                                          fontSize: screen.width *
                                              0.08, // 8% of screen width
                                          color: ThemeCtrl.colors.color2,
                                          fontWeight: FontWeight.bold,
                                          fontFamily: 'Comfortaa',
                                        ),
                                      ),
                                      Text(
                                        'Activities\nLeft',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: ThemeCtrl.colors.color5,
                                          fontWeight: FontWeight.bold,
                                          fontFamily: 'Comfortaa',
                                        ),
                                      )
                                    ],
                                  ),
                                  CircleButton1(
                                    icon: Icons.notes_outlined,
                                    btnColor1: ThemeCtrl.colors.color3,
                                    btnColor2: ThemeCtrl.colors.color3,
                                    icnColor: ThemeCtrl.colors.color2,
                                    size: 40,
                                  )
                                ],
                              ),
                            ),
                          ],
                        ),
                        Divider(
                          indent: screen.width * 0.03, // 3% of screen width
                          endIndent: screen.width * 0.03,
                          height: screen.height * 0.01, // 1% of screen height

                          color: const Color(0x6D000000),
                        ),

                        //Work hours
                        Container(
                          padding: const EdgeInsets.all(10),
                          width: screen.width * 0.97, // 97% of screen width

                          height: screen.height * 0.14, // 14% of screen height
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '7 : 20 : 5 HRS',
                                    style: TextStyle(
                                      fontSize: screen.width *
                                          0.08, // 8% of screen width
                                      color: ThemeCtrl.colors.color2,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Comfortaa',
                                    ),
                                  ),
                                  Text(
                                    'Work Hours',
                                    style: TextStyle(
                                      fontSize: screen.width *
                                          0.05, // 5% of screen width                                      color: ThemeCtrl.colors.color5,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Comfortaa',
                                    ),
                                  )
                                ],
                              ),
                              CircleButton1(
                                icon: Icons.work_history_outlined,
                                btnColor1: ThemeCtrl.colors.color3,
                                btnColor2: ThemeCtrl.colors.color3,
                                icnColor: ThemeCtrl.colors.color2,
                                size: 40,
                              )
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      // bottomNavigationBar: CustomNavBar(
      //   onTap: (index) {
      //     if (index == 0) {
      //     } else if (index == 1) {
      //     } else if (index == 2) {
      //     } else if (index == 3) {
      //     } else if (index == 4) {
      //     } else if (index == 5) {
      //     } else {
      //       debugPrint('Unknown Button pushed!');
      //     }
      //   },
      //   items: _navigationItems,
      //   height: screen.height * 0.08, // 8% of screen height
      //   color: ThemeCtrl.colors.coloricn,
      //   selectedIconColor: ThemeCtrl.colors.coloricn,
      //   unselectedIconColor: ThemeCtrl.colors.colorw,
      //   backgroundColor: const Color.fromARGB(0, 4, 51, 160),
      //   buttonBackgroundColor: ThemeCtrl.colors.color3,
      //   animationDuration: const Duration(milliseconds: 300),
      // ),

      // bottomNavigationBar: NavBar1(
      //   icons: _navigationItems,
      //   onTap: (value) {},
      // ),
    );
  }
}
