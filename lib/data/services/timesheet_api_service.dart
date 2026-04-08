import 'package:dio/dio.dart';
import '../providers/api_client.dart';
import '../models/timesheet_entry_model.dart';
import 'package:flutter/foundation.dart';

class TimesheetApiService {
  final ApiClient _apiClient = ApiClient();

  Future<List<TimesheetEntryModel>> getTimesheets() async {
    try {
      final response = await _apiClient.dio.get('/timesheets');
      final List<dynamic> data = response.data;
      return data.map((json) {
        // Backend returns snake_case, need to map to the model's expected camelCase JSON
        // Or we can convert directly here. The model expects JSON keys as defined in its fromJson.
        return TimesheetEntryModel(
          id: json['id'],
          userId: json['user_id'],
          projectId: json['project_id'],
          description: json['description'],
          startTime: DateTime.parse(json['start_time']),
          endTime: json['end_time'] != null ? DateTime.parse(json['end_time']) : null,
          totalDuration: json['total_duration_seconds'] != null ? Duration(seconds: json['total_duration_seconds']) : null,
        );
      }).toList();
    } on DioException catch (e) {
      debugPrint('Get Timesheets Error: \${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Failed to fetch timesheets');
    }
  }

  Future<TimesheetEntryModel> createTimesheet(TimesheetEntryModel entry) async {
    try {
      final response = await _apiClient.dio.post(
        '/timesheets',
        data: {
          'id': entry.id,
          'projectId': entry.projectId,
          'description': entry.description,
          'startTime': entry.startTime.toIso8601String(),
        },
      );
      final json = response.data;
      return TimesheetEntryModel(
        id: json['id'],
        userId: json['user_id'],
        projectId: json['project_id'],
        description: json['description'],
        startTime: DateTime.parse(json['start_time']),
      );
    } on DioException catch (e) {
      debugPrint('Create Timesheet Error: \${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Failed to create timesheet');
    }
  }

  Future<TimesheetEntryModel> updateTimesheet(TimesheetEntryModel entry) async {
    try {
      final response = await _apiClient.dio.put(
        '/timesheets/\${entry.id}',
        data: {
          'endTime': entry.endTime?.toIso8601String(),
          'totalDurationSeconds': entry.totalDuration?.inSeconds,
          'description': entry.description,
        },
      );
      final json = response.data;
      return TimesheetEntryModel(
        id: json['id'],
        userId: json['user_id'],
        projectId: json['project_id'],
        description: json['description'],
        startTime: DateTime.parse(json['start_time']),
        endTime: json['end_time'] != null ? DateTime.parse(json['end_time']) : null,
        totalDuration: json['total_duration_seconds'] != null ? Duration(seconds: json['total_duration_seconds']) : null,
      );
    } on DioException catch (e) {
      debugPrint('Update Timesheet Error: \${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Failed to update timesheet');
    }
  }

  Future<String> deleteTimesheet(String id) async {
    try {
      final response = await _apiClient.dio.delete('/timesheets/\$id');
      return response.data['id'] ?? id;
    } on DioException catch (e) {
      debugPrint('Delete Timesheet Error: \${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Failed to delete timesheet');
    }
  }
}
