import 'dart:convert';

List<ActivityData> activityDataFromJson(String str) => List<ActivityData>.from(
    json.decode(str).map((x) => ActivityData.fromJson(x)));

String activityDataToJson(List<ActivityData> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class ActivityData {
  final String? id; // Supports UUID from API
  final String? title;
  final String? details;
  final String? notes;
  final DateTime? startTime;
  final DateTime? endTime;
  final bool? isCompleted;

  ActivityData({
    this.id,
    this.title,
    this.details,
    this.notes,
    this.startTime,
    this.endTime,
    this.isCompleted,
  });

  factory ActivityData.fromJson(Map<String, dynamic> json) {
    return ActivityData(
      id: json['id'] as String?,
      title: json['title'] as String?,
      details: json['details'] as String?,
      notes: json['notes'] as String?,
      startTime:
          json['startTime'] != null ? DateTime.parse(json['startTime']) : null,
      endTime: json['endTime'] != null ? DateTime.parse(json['endTime']) : null,
      isCompleted: json['isCompleted'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'details': details,
      'notes': notes,
      'startTime': startTime?.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
      'isCompleted': isCompleted,
    };
  }
}
