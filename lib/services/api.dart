import 'package:dio/dio.dart';
import 'package:timesheet_project/models/activity.dart';
import 'package:timesheet_project/models/notification.dart';
import 'package:timesheet_project/models/announcement.dart';
import 'package:timesheet_project/models/employee.dart';

class APIServices {
  final Dio _dio = Dio();
  final String baseUrl = ""; // Replace with your actual API base URL

  Future<List<ActivityData>> fetchActivityData() async {
    try {
      final response = await _dio.get('$baseUrl/activities');
      if (response.statusCode == 200) {
        return (response.data as List)
            .map((item) => ActivityData.fromJson(item))
            .toList();
      } else {
        throw Exception('Failed to load Activities');
      }
    } catch (e) {
      throw Exception('Error fetching Activity Data: $e');
    }
  }

  Future<List<NotificationData>> fetchNotificationData() async {
    try {
      final response = await _dio.get('$baseUrl/notifications');
      if (response.statusCode == 200) {
        return (response.data as List)
            .map((item) => NotificationData.fromJson(item))
            .toList();
      } else {
        throw Exception('Failed to load Notifications');
      }
    } catch (e) {
      throw Exception('Error fetching Notification Data: $e');
    }
  }

  Future<List<AnnouncementData>> fetchAnnouncementData() async {
    try {
      final response = await _dio.get('$baseUrl/announcements');
      if (response.statusCode == 200) {
        return (response.data as List)
            .map((item) => AnnouncementData.fromJson(item))
            .toList();
      } else {
        throw Exception('Failed to load Announcements');
      }
    } catch (e) {
      throw Exception('Error fetching Announcement Data: $e');
    }
  }

  Future<List<EmployeeDay>> fetchEmployeeData() async {
    try {
      final response = await _dio.get('$baseUrl/employees');
      if (response.statusCode == 200) {
        return (response.data as List)
            .map((item) => EmployeeDay.fromJson(item))
            .toList();
      } else {
        throw Exception('Failed to load Employee Data');
      }
    } catch (e) {
      throw Exception('Error fetching Employee Data: $e');
    }
  }
}
