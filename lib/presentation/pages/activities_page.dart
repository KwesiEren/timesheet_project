import 'package:flutter/material.dart';
import 'package:timesheet_project/presentation/sketchs/testpage.dart';

import '../../models/activity.dart';
import '../../shared/theme_control.dart';

class ActivitiesPage extends StatefulWidget {
  const ActivitiesPage({super.key});

  @override
  State<ActivitiesPage> createState() => _ActivitiesPageState();
}

class _ActivitiesPageState extends State<ActivitiesPage> {
  int _currentIndex = 2;

  List<Activity> activities = [
    Activity(
      title: 'Task 1',
      details: 'Details for task 1',
      notes: 'Notes for task 1',
      startTime: DateTime.now().subtract(Duration(hours: 2)),
      endTime: DateTime.now().subtract(Duration(hours: 1)),
      isCompleted: true,
    ),
    Activity(
      title: 'Task 2',
      details: 'Details for task 2',
      notes: 'Notes for task 2',
      startTime: DateTime.now().subtract(Duration(hours: 1)),
      endTime: DateTime.now(),
      isCompleted: false,
    ),
  ];
  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;
    return Scaffold(
        backgroundColor: ThemeCtrl.colors.colorbg,
        body: SafeArea(
          child: Center(
            child: Column(
              children: [
                SizedBox(
                  height: screen.height * 0.05,
                ),
                Container(
                  padding: EdgeInsets.all(8),
                  width: screen.width * 0.95,
                  height: screen.height * 0.75,
                  // decoration: BoxDecoration(color: Colors.amber),
                  child: ListView.builder(
                    itemCount: activities.length,
                    itemBuilder: (context, index) {
                      final activity = activities[index];
                      return Column(
                        children: [
                          ListTile(
                            leading: activity.isCompleted
                                ? const Icon(Icons.task_alt, // Tick icon
                                    color: Colors.green)
                                : const Icon(
                                    Icons.hourglass_bottom_rounded, // Tick icon
                                    color: Colors.grey),
                            title: Text(
                              activity.title,
                              style: TextStyle(
                                  fontSize: 20, fontWeight: FontWeight.w500),
                            ),
                            subtitle: Text(
                              '${activity.startTime.hour}:${activity.startTime.minute} - ${activity.endTime.hour}:${activity.endTime.minute}',
                              style: TextStyle(fontSize: 15),
                            ),
                          ),
                          Divider(
                            color: ThemeCtrl.colors.color2,
                            indent: screen.width * 0.05, // 3% of screen width
                            endIndent: screen.width * 0.05,
                            height: screen.height * 0.01, // 1% of screen height
                          )
                        ],
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
        floatingActionButton: FloatingActionButton(
          foregroundColor: ThemeCtrl.colors.color1,
          backgroundColor: ThemeCtrl.colors.color3,
          shape: const CircleBorder(),
          onPressed: () {},
          child: const Icon(
            Icons.add,
            size: 30,
          ),
        ));
  }
}
