import 'package:flutter/material.dart';
import 'package:timesheet_project/shared/components/button_1.dart';
import 'package:timesheet_project/shared/theme_control.dart';

import '../../models/employee.dart';

class PunchInPage extends StatefulWidget {
  const PunchInPage({super.key});

  @override
  State<PunchInPage> createState() => _PunchInPageState();
}

class _PunchInPageState extends State<PunchInPage> {
  int _currentIndex = 1;

  // Sample data for EmployeeDay
  final List<EmployeeDay> employeeDays = [
    EmployeeDay(
      arrivalTime: DateTime(2024, 12, 27, 9, 0),
      departureTime: DateTime(2024, 12, 27, 17, 0),
      breaks: [
        Break(
            startTime: DateTime(2024, 12, 27, 12, 0),
            endTime: DateTime(2024, 12, 27, 12, 30))
      ],
      numberOfActivities: 2,
      activities: [],
    ),
    EmployeeDay(
      arrivalTime: DateTime(2024, 12, 27, 9, 0),
      departureTime: DateTime(2024, 12, 27, 17, 0),
      breaks: [
        Break(
            startTime: DateTime(2024, 12, 27, 12, 0),
            endTime: DateTime(2024, 12, 27, 12, 30))
      ],
      numberOfActivities: 2,
      activities: [],
    ),
    EmployeeDay(
      arrivalTime: DateTime(2024, 12, 27, 9, 0),
      departureTime: DateTime(2024, 12, 27, 17, 0),
      breaks: [
        Break(
            startTime: DateTime(2024, 12, 27, 12, 0),
            endTime: DateTime(2024, 12, 27, 12, 30))
      ],
      numberOfActivities: 2,
      activities: [],
    ),
    EmployeeDay(
      arrivalTime: DateTime(2024, 12, 27, 9, 0),
      departureTime: DateTime(2024, 12, 27, 17, 0),
      breaks: [
        Break(
            startTime: DateTime(2024, 12, 27, 12, 0),
            endTime: DateTime(2024, 12, 27, 12, 30))
      ],
      numberOfActivities: 2,
      activities: [],
    ),
    EmployeeDay(
      arrivalTime: DateTime(2024, 12, 28, 9, 15),
      departureTime: DateTime(2024, 12, 28, 16, 45),
      breaks: [
        Break(
            startTime: DateTime(2024, 12, 28, 12, 15),
            endTime: DateTime(2024, 12, 28, 12, 45))
      ],
      numberOfActivities: 3,
      activities: [],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
      backgroundColor: ThemeCtrl.colors.colorbg,
      body: Center(
        child: Column(
          // crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              height: screen.height * 0.05,
            ),
            Container(
              padding: EdgeInsets.all(5),
              width: screen.width * 0.8,
              height: screen.height * 0.45,
              decoration: BoxDecoration(
                color: ThemeCtrl.colors.colorw,
                borderRadius: BorderRadius.circular(10),
                // boxShadow: const [
                //   BoxShadow(
                //       color: Color(0x73140606),
                //       offset: Offset(2, 3),
                //       blurRadius: 8)
                // ]
              ),
              child: Column(
                children: [
                  const Text(
                    'History',
                    style: TextStyle(fontSize: 25),
                  ),
                  Divider(
                    indent: screen.width * 0.06, // 3% of screen width
                    endIndent: screen.width * 0.06,
                    height: screen.height * 0.01, // 1% of screen height

                    color: const Color(0x6D000000),
                  ),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Text(
                        'Date',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w300),
                      ),
                      Text(
                        'Check-in',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w300),
                      ),
                      Text(
                        'Check-out',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w300),
                      ),
                    ],
                  ),
                  Container(
                    width: screen.width * 0.75,
                    height: screen.height * 0.345,
                    color: const Color(0x002195F3),
                    child: ListView.builder(
                      itemCount: employeeDays.length,
                      itemBuilder: (context, index) {
                        final employeeDay = employeeDays[index];
                        return SizedBox(
                          child: Column(
                            children: [
                              ListTile(
                                leading: Text('${index + 1}'),
                                title: Text(
                                  'Date: ${employeeDay.arrivalTime.toLocal().toString().split(' ')[0]}',
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                        'Check-in: ${employeeDay.arrivalTime.hour}:${employeeDay.arrivalTime.minute}'),
                                    Text(
                                        'Check-out: ${employeeDay.departureTime.hour}:${employeeDay.departureTime.minute}'),
                                  ],
                                ),
                              ),
                              Divider(
                                indent:
                                    screen.width * 0.05, // 3% of screen width
                                endIndent: screen.width * 0.05,
                                height:
                                    screen.height * 0.01, // 1% of screen height
                              )
                            ],
                          ),
                        );
                      },
                    ),
                  )
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
