import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:timesheet_project/models/calendar_widget.dart';

import '../../../shared/theme_control.dart';

class CalendarPage extends StatefulWidget {
  const CalendarPage({super.key});

  @override
  State<CalendarPage> createState() => _CalendarPageState();
}

class _CalendarPageState extends State<CalendarPage> {
  int _currentIndex = 4;

  //Logics used in the Dashboard screen here;

  final Map<DateTime, String> attendance = {
    DateTime(2024, 12, 1): 'present',
    DateTime(2024, 12, 2): 'absent',
    DateTime(2024, 12, 3): 'partial',
    DateTime(2024, 12, 4): 'present',
  };

  // UI code block here
  @override
  Widget build(BuildContext context) {
    var screen = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: ThemeCtrl.colors.colorbg,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Calendar Section
                TableCalendar(
                  firstDay: DateTime(2024, 1, 1),
                  lastDay: DateTime(2050, 12, 31),
                  focusedDay: DateTime.now().isAfter(DateTime(2024, 12, 31))
                      ? DateTime(2024, 12, 31)
                      : DateTime.now(), // Ensure focusedDay is valid
                  calendarFormat: CalendarFormat.month,
                  startingDayOfWeek: StartingDayOfWeek.monday,
                  headerStyle: const HeaderStyle(
                    formatButtonVisible: false,
                    titleCentered: true,
                  ),
                  calendarStyle: const CalendarStyle(
                    outsideDaysVisible: false,
                  ),
                  daysOfWeekStyle: const DaysOfWeekStyle(
                    weekendStyle: TextStyle(color: Colors.red),
                  ),
                  availableGestures: AvailableGestures.all,
                  calendarBuilders: CalendarBuilders(
                    defaultBuilder: (context, date, _) {
                      return CalendarAssets.buildDayCell(
                        date: date,
                        attendance: attendance,
                      );
                    },
                    todayBuilder: (context, date, _) {
                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        child: Center(
                          child: Text(
                            date.day.toString(),
                            style: const TextStyle(color: Colors.white),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 16),

                // Legend Section
                const Text(
                  'Key:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 16.0,
                  runSpacing: 8.0,
                  children: [
                    CalendarAssets.buildLegendItem(
                        color: Colors.green, label: 'Present'),
                    CalendarAssets.buildLegendItem(
                        color: Colors.yellow, label: 'Partial Entry'),
                    CalendarAssets.buildLegendItem(
                        color: Colors.red, label: 'Absent'),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
