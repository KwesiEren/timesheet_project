import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/timesheet_entry_model.dart';
import 'package:flutter/foundation.dart';

class TimesheetApiService {
  final _supabase = Supabase.instance.client;

  Future<List<TimesheetEntryModel>> getTimesheets() async {
    try {
      final session = _supabase.auth.currentSession;
      if (session == null) throw Exception('Not authenticated');

      final data = await _supabase
          .from('timesheet_entries')
          .select('*')
          .eq('user_id', session.user.id)
          .order('start_time', ascending: false);
          
      return data.map<TimesheetEntryModel>((json) {
        return TimesheetEntryModel(
          id: json['id'],
          userId: json['user_id'],
          projectId: json['project_id'],
          title: json['title'] ?? json['description'],
          startTime: DateTime.parse(json['start_time']),
          endTime: json['end_time'] != null ? DateTime.parse(json['end_time']) : null,
          totalDurationSeconds: json['total_duration_seconds'],
        );
      }).toList();
    } catch (e) {
      debugPrint('Get Timesheets Error: $e');
      throw Exception('Failed to fetch timesheets: $e');
    }
  }

  Future<TimesheetEntryModel> createTimesheet(TimesheetEntryModel entry) async {
    try {
      final session = _supabase.auth.currentSession;
      if (session == null) throw Exception('Not authenticated');

      // Fetch orgId from profile
      final response = await _supabase
          .from('profiles')
          .select('user_roles(organization_id)')
          .eq('id', session.user.id)
          .single();
      
      String? orgId;
      final userRoles = response['user_roles'] as List<dynamic>?;
      if (userRoles != null && userRoles.isNotEmpty) {
        orgId = userRoles[0]['organization_id'] as String?;
      }

      final data = await _supabase.from('timesheet_entries').insert({
        'id': entry.id,
        'user_id': session.user.id,
        'organization_id': orgId,
        'project_id': entry.projectId,
        'title': entry.title,
        'start_time': entry.startTime.toIso8601String(),
        'is_completed': false,
      }).select().single();

      return TimesheetEntryModel(
        id: data['id'],
        userId: data['user_id'],
        projectId: data['project_id'],
        title: data['title'],
        startTime: DateTime.parse(data['start_time']),
      );
    } catch (e) {
      debugPrint('Create Timesheet Error: $e');
      throw Exception('Failed to create timesheet: $e');
    }
  }

  Future<TimesheetEntryModel> updateTimesheet(TimesheetEntryModel entry) async {
    try {
      final data = await _supabase.from('timesheet_entries').update({
        'end_time': entry.endTime?.toIso8601String(),
        'total_duration_seconds': entry.totalDurationSeconds,
        'title': entry.title,
        'is_completed': entry.endTime != null,
      }).eq('id', entry.id).select().single();

      return TimesheetEntryModel(
        id: data['id'],
        userId: data['user_id'],
        projectId: data['project_id'],
        title: data['title'] ?? data['description'],
        startTime: DateTime.parse(data['start_time']),
        endTime: data['end_time'] != null ? DateTime.parse(data['end_time']) : null,
        totalDurationSeconds: data['total_duration_seconds'],
      );
    } catch (e) {
      debugPrint('Update Timesheet Error: $e');
      throw Exception('Failed to update timesheet: $e');
    }
  }

  Future<String> deleteTimesheet(String id) async {
    try {
      await _supabase.from('timesheet_entries').delete().eq('id', id);
      return id;
    } catch (e) {
      debugPrint('Delete Timesheet Error: $e');
      throw Exception('Failed to delete timesheet: $e');
    }
  }
}
