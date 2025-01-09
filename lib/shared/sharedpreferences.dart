import 'package:shared_preferences/shared_preferences.dart';

class TimesheetPreferences {
  static const _checkInKey = "check_in_time";
  static const _checkOutKey = "check_out_time";
  static const _workHoursKey = "work_hours";
  static const _breakHoursKey = "break_hours";

  // Save Check-In Time
  static Future<void> saveCheckInTime(DateTime checkIn) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_checkInKey, checkIn.toIso8601String());
  }

  // Get Check-In Time
  static Future<DateTime?> getCheckInTime() async {
    final prefs = await SharedPreferences.getInstance();
    String? checkIn = prefs.getString(_checkInKey);
    return checkIn != null ? DateTime.parse(checkIn) : null;
  }

  // Save Check-Out Time
  static Future<void> saveCheckOutTime(DateTime checkOut) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_checkOutKey, checkOut.toIso8601String());
  }

  // Get Check-Out Time
  static Future<DateTime?> getCheckOutTime() async {
    final prefs = await SharedPreferences.getInstance();
    String? checkOut = prefs.getString(_checkOutKey);
    return checkOut != null ? DateTime.parse(checkOut) : null;
  }

  // Save Work Hours
  static Future<void> saveWorkHours(Duration workHours) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_workHoursKey, workHours.inSeconds);
  }

  // Get Work Hours
  static Future<Duration> getWorkHours() async {
    final prefs = await SharedPreferences.getInstance();
    int? seconds = prefs.getInt(_workHoursKey);
    return Duration(seconds: seconds ?? 0);
  }

  // Save Break Hours
  static Future<void> saveBreakHours(Duration breakHours) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_breakHoursKey, breakHours.inSeconds);
  }

  // Get Break Hours
  static Future<Duration> getBreakHours() async {
    final prefs = await SharedPreferences.getInstance();
    int? seconds = prefs.getInt(_breakHoursKey);
    return Duration(seconds: seconds ?? 0);
  }
}
