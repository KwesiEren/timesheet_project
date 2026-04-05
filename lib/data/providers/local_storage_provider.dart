import 'package:get_storage/get_storage.dart';

class LocalStorageProvider {
  final _box = GetStorage();
  
  // Keys
  static const String keyUser = 'user';
  static const String keyTimesheets = 'timesheets';

  // Auth User
  Future<void> saveUser(Map<String, dynamic> userData) async {
    await _box.write(keyUser, userData);
  }

  Map<String, dynamic>? getUser() {
    return _box.read(keyUser);
  }

  Future<void> clearUser() async {
    await _box.remove(keyUser);
  }

  // Timesheets
  Future<void> saveTimesheets(List<Map<String, dynamic>> timesheets) async {
    await _box.write(keyTimesheets, timesheets);
  }

  List<dynamic>? getTimesheets() {
    return _box.read(keyTimesheets);
  }

  Future<void> clearTimesheets() async {
    await _box.remove(keyTimesheets);
  }
}
