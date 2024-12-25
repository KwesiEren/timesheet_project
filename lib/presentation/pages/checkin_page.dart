import 'package:flutter/material.dart';
import 'package:timesheet_project/shared/components/button_1.dart';
import 'package:timesheet_project/shared/theme_control.dart';

class PunchInPage extends StatefulWidget {
  const PunchInPage({super.key});

  @override
  State<PunchInPage> createState() => _PunchInPageState();
}

class _PunchInPageState extends State<PunchInPage> {
  int _currentIndex = 1;
  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      body: Center(
        child: Column(
          // crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: screen.height * 0.1,
            ),
            Container(
              width: screen.width * 0.8,
              height: screen.height * 0.4,
              decoration: BoxDecoration(
                color: Colors.amber,
              ),
              child: Column(
                children: [
                  Text('History'),
                  Divider(
                    indent: screen.width * 0.06, // 3% of screen width
                    endIndent: screen.width * 0.06,
                    height: screen.height * 0.01, // 1% of screen height

                    color: const Color(0x6D000000),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: screen.height * 0.1,
            ),
            ActionButton1(
                onPressed: () {},
                text: 'Check In',
                txtcolor: ThemeCtrl.colors.colorbtn1,
                btnWidth: screen.width * 0.7,
                btnHeight: 80,
                size: 30,
                btnColor: ThemeCtrl.colors.color3,
                borderRadius: 5)
          ],
        ),
      ),
    );
  }
}
