class TimesheetEntryModel {
  final String id;
  final String userId;
  final String? projectId;
  final String? title;
  final String? details;
  final String? notes;
  final DateTime startTime;
  final DateTime? endTime;
  final int? totalDurationSeconds;
  final bool isCompleted;
  final bool isFlagged;
  final Map<String, dynamic>? originalData;

  TimesheetEntryModel({
    required this.id,
    required this.userId,
    this.projectId,
    this.title,
    this.details,
    this.notes,
    required this.startTime,
    this.endTime,
    this.totalDurationSeconds,
    this.isCompleted = false,
    this.isFlagged = false,
    this.originalData,
  });

  bool get isActive => endTime == null && !isCompleted;

  factory TimesheetEntryModel.fromJson(Map<String, dynamic> json) {
    return TimesheetEntryModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      projectId: json['project_id'] as String?,
      title: json['title'] as String?,
      details: json['details'] as String?,
      notes: json['notes'] as String?,
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: json['end_time'] != null ? DateTime.parse(json['end_time'] as String) : null,
      totalDurationSeconds: json['total_duration_seconds'] as int?,
      isCompleted: json['is_completed'] as bool? ?? false,
      isFlagged: json['is_flagged'] as bool? ?? false,
      originalData: json['original_data'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'project_id': projectId,
      'title': title,
      'details': details,
      'notes': notes,
      'start_time': startTime.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'total_duration_seconds': totalDurationSeconds,
      'is_completed': isCompleted,
      'is_flagged': isFlagged,
      'original_data': originalData,
    };
  }

  TimesheetEntryModel copyWith({
    String? id,
    String? userId,
    String? projectId,
    String? title,
    String? details,
    String? notes,
    DateTime? startTime,
    DateTime? endTime,
    int? totalDurationSeconds,
    bool? isCompleted,
    bool? isFlagged,
    Map<String, dynamic>? originalData,
  }) {
    return TimesheetEntryModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      projectId: projectId ?? this.projectId,
      title: title ?? this.title,
      details: details ?? this.details,
      notes: notes ?? this.notes,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      totalDurationSeconds: totalDurationSeconds ?? this.totalDurationSeconds,
      isCompleted: isCompleted ?? this.isCompleted,
      isFlagged: isFlagged ?? this.isFlagged,
      originalData: originalData ?? this.originalData,
    );
  }
}
