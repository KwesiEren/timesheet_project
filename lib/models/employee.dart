import 'dart:convert';
import 'activity.dart';

List<EmployeeDay> employeeDayFromJson(String str) => List<EmployeeDay>.from(
    json.decode(str).map((x) => EmployeeDay.fromJson(x)));

String employeeDayToJson(List<EmployeeDay> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class EmployeeDay {
  final DateTime arrivalTime;
  final DateTime departureTime;
  final List<Break>? breaks;
  final int? numberOfActivities;
  final List<ActivityData>? activities;

  EmployeeDay({
    required this.arrivalTime,
    required this.departureTime,
    this.breaks,
    this.numberOfActivities,
    this.activities,
  });

  factory EmployeeDay.fromJson(Map<String, dynamic> json) {
    return EmployeeDay(
      arrivalTime: DateTime.parse(json['arrivalTime']),
      departureTime: DateTime.parse(json['departureTime']),
      breaks: json['breaks'] != null
          ? List<Break>.from(json['breaks'].map((x) => Break.fromJson(x)))
          : null,
      numberOfActivities: json['numberOfActivities'] as int?,
      activities: json['activities'] != null
          ? List<ActivityData>.from(
              json['activities'].map((x) => ActivityData.fromJson(x)))
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'arrivalTime': arrivalTime.toIso8601String(),
      'departureTime': departureTime.toIso8601String(),
      'breaks': breaks != null
          ? List<dynamic>.from(breaks!.map((x) => x.toJson()))
          : null,
      'numberOfActivities': numberOfActivities,
      'activities': activities != null
          ? List<dynamic>.from(activities!.map((x) => x.toJson()))
          : null,
    };
  }
}

class Break {
  final DateTime startTime;
  final DateTime endTime;

  Break({
    required this.startTime,
    required this.endTime,
  });

  factory Break.fromJson(Map<String, dynamic> json) {
    return Break(
      startTime: DateTime.parse(json['startTime']),
      endTime: DateTime.parse(json['endTime']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
    };
  }
}
