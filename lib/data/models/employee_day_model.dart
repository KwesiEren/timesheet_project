import 'timesheet_entry_model.dart';

class EmployeeDayModel {
  final String id;
  final String date;
  final String status;
  final String? approvedBy;
  final DateTime? approvedAt;
  final String? arrivalTime;
  final String? departureTime;
  final int numberOfActivities;
  final List<TimesheetEntryModel> activities;

  EmployeeDayModel({
    required this.id,
    required this.date,
    required this.status,
    this.approvedBy,
    this.approvedAt,
    this.arrivalTime,
    this.departureTime,
    required this.numberOfActivities,
    required this.activities,
  });

  factory EmployeeDayModel.fromJson(Map<String, dynamic> json) {
    return EmployeeDayModel(
      id: json['id'] as String,
      date: json['date'] as String,
      status: json['status'] as String,
      approvedBy: json['approvedBy'] as String?,
      approvedAt: json['approvedAt'] != null 
          ? DateTime.parse(json['approvedAt'] as String) 
          : null,
      arrivalTime: json['arrivalTime'] as String?,
      departureTime: json['departureTime'] as String?,
      numberOfActivities: json['numberOfActivities'] as int,
      activities: (json['activities'] as List? ?? [])
          .map((a) => TimesheetEntryModel.fromJson(a as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date,
      'status': status,
      'approvedBy': approvedBy,
      'approvedAt': approvedAt?.toIso8601String(),
      'arrivalTime': arrivalTime,
      'departureTime': departureTime,
      'numberOfActivities': numberOfActivities,
      'activities': activities.map((a) => a.toJson()).toList(),
    };
  }
}
