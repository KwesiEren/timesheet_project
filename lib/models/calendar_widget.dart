import 'package:flutter/material.dart';

class CalendarAssets {
  /// Builds a calendar day cell with the appropriate status color.
  static Widget buildDayCell({
    required DateTime date,
    required Map<DateTime, String> attendance,
  }) {
    final status = attendance[DateTime(date.year, date.month, date.day)];

    Color backgroundColor;
    switch (status) {
      case 'present':
        backgroundColor = Colors.green;
        break;
      case 'partial':
        backgroundColor = Colors.yellow;
        break;
      case 'absent':
        backgroundColor = Colors.red;
        break;
      default:
        backgroundColor = Colors.transparent;
    }

    return Container(
      margin: const EdgeInsets.all(4.0),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Center(
        child: Text(
          date.day.toString(),
          style: TextStyle(
            color: status == null ? Colors.black : Colors.white,
          ),
        ),
      ),
    );
  }

  /// Builds a legend item with a color box and a label.
  static Widget buildLegendItem({required Color color, required String label}) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4.0),
          ),
        ),
        const SizedBox(width: 8),
        Text(label),
      ],
    );
  }
}
