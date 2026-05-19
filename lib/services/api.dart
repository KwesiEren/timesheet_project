import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:timesheet_project/models/activity.dart';
import 'package:timesheet_project/models/notification.dart';
import 'package:timesheet_project/models/announcement.dart';
import 'package:timesheet_project/models/employee.dart';

class APIServices {
  final _supabase = Supabase.instance.client;

  Future<List<ActivityData>> fetchActivityData() async {
    try {
      final data = await _supabase.from('timesheet_entries').select().order('start_time', ascending: false);
      return data.map((item) => ActivityData.fromJson(item)).toList();
    } catch (e) {
      throw Exception('Error fetching Activity Data: $e');
    }
  }

  Future<List<NotificationData>> fetchNotificationData() async {
    try {
      final data = await _supabase.from('notifications').select().order('created_at', ascending: false);
      return data.map((item) => NotificationData.fromJson(item)).toList();
    } catch (e) {
      throw Exception('Error fetching Notification Data: $e');
    }
  }

  Future<List<AnnouncementData>> fetchAnnouncementData() async {
    try {
      final data = await _supabase.from('announcements').select().order('created_at', ascending: false);
      return data.map((item) => AnnouncementData.fromJson(item)).toList();
    } catch (e) {
      throw Exception('Error fetching Announcement Data: $e');
    }
  }

  Future<List<EmployeeDay>> fetchEmployeeData() async {
    try {
      final data = await _supabase.from('profiles').select();
      return data.map((item) => EmployeeDay.fromJson(item)).toList();
    } catch (e) {
      throw Exception('Error fetching Employee Data: $e');
    }
  }
}
