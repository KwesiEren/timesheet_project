import 'activity.dart';

class EmployeeDay {
  final DateTime arrivalTime;
  final DateTime departureTime;
  final List<Break>? breaks;
  final int? numberOfActivities;
  final List<Activity>? activities;

  EmployeeDay({
    required this.arrivalTime,
    required this.departureTime,
    this.breaks,
    this.numberOfActivities,
    this.activities,
  });
}

class Break {
  final DateTime startTime;
  final DateTime endTime;

  Break({
    required this.startTime,
    required this.endTime,
  });
}
