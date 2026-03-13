class TimesheetEntryModel {
  final String id;
  final String userId;
  final String projectId;
  final String description;
  final DateTime startTime;
  final DateTime? endTime;
  final Duration? totalDuration;

  TimesheetEntryModel({
    required this.id,
    required this.userId,
    required this.projectId,
    required this.description,
    required this.startTime,
    this.endTime,
    this.totalDuration,
  });

  bool get isActive => endTime == null;

  factory TimesheetEntryModel.fromJson(Map<String, dynamic> json) {
    return TimesheetEntryModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      projectId: json['projectId'] as String,
      description: json['description'] as String,
      startTime: DateTime.parse(json['startTime'] as String),
      endTime: json['endTime'] != null ? DateTime.parse(json['endTime'] as String) : null,
      totalDuration: json['totalDuration'] != null ? Duration(seconds: json['totalDuration'] as int) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'projectId': projectId,
      'description': description,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
      'totalDuration': totalDuration?.inSeconds,
    };
  }

  TimesheetEntryModel copyWith({
    String? id,
    String? userId,
    String? projectId,
    String? description,
    DateTime? startTime,
    DateTime? endTime,
    Duration? totalDuration,
  }) {
    return TimesheetEntryModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      projectId: projectId ?? this.projectId,
      description: description ?? this.description,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      totalDuration: totalDuration ?? this.totalDuration,
    );
  }
}
