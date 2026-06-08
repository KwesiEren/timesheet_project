import 'package:get/get.dart';
import '../data/models/timesheet_entry_model.dart';
import '../data/models/project_model.dart';
import '../data/services/timesheet_api_service.dart';
import '../data/services/project_api_service.dart';
import '../../services/api.dart';
import 'package:intl/intl.dart';

class HomeController extends GetxController {
  final RxList<TimesheetEntryModel> recentEntries = <TimesheetEntryModel>[].obs;
  final RxList<ProjectModel> userProjects = <ProjectModel>[].obs;
  
  final RxInt unreadNotificationCount = 0.obs;
  final RxBool isLoading = false.obs;

  // Dashboard metrics
  final RxString checkInTime = '-- : --'.obs;
  final RxInt activitiesCompleted = 0.obs;
  final RxInt activitiesLeft = 0.obs;
  final RxString workHours = '0 : 00 : 00 HRS'.obs;

  final TimesheetApiService _timesheetService = TimesheetApiService();
  final ProjectApiService _projectService = ProjectApiService();
  final APIServices _apiServices = APIServices();

  @override
  void onInit() {
    super.onInit();
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    isLoading.value = true;
    
    try {
      // Fetch projects
      final projects = await _projectService.getProjects();
      userProjects.assignAll(projects);

      // Fetch timesheets
      final timesheets = await _timesheetService.getTimesheets();
      recentEntries.assignAll(timesheets);
      
      // Calculate dashboard metrics for today
      _calculateTodayMetrics(timesheets);

      // Fetch notifications
      final notifications = await _apiServices.fetchNotificationData();
      unreadNotificationCount.value = notifications.where((n) => n.isUnread == true).length;
    } catch (e) {
      print("Error fetching dashboard data: $e");
    }
    
    isLoading.value = false;
  }

  void _calculateTodayMetrics(List<TimesheetEntryModel> timesheets) {
    final now = DateTime.now();
    final todayStr = DateFormat('yyyy-MM-dd').format(now);
    
    final todayEntries = timesheets.where((entry) {
      return DateFormat('yyyy-MM-dd').format(entry.startTime) == todayStr;
    }).toList();

    if (todayEntries.isNotEmpty) {
      // Sort to find the earliest start time
      todayEntries.sort((a, b) => a.startTime.compareTo(b.startTime));
      checkInTime.value = DateFormat('h : mm a').format(todayEntries.first.startTime);
    } else {
      checkInTime.value = '-- : --';
    }

    int completed = 0;
    int left = 0;
    int totalDurationSeconds = 0;

    for (var entry in todayEntries) {
      if (entry.endTime != null) {
        completed++;
      } else {
        left++;
      }
      
      if (entry.totalDurationSeconds != null) {
        totalDurationSeconds += entry.totalDurationSeconds!;
      } else if (entry.endTime == null) {
        // Active timer: calculate duration up to now
        totalDurationSeconds += now.difference(entry.startTime).inSeconds;
      }
    }

    activitiesCompleted.value = completed;
    activitiesLeft.value = left;
    
    // Format work hours
    final hours = totalDurationSeconds ~/ 3600;
    final minutes = (totalDurationSeconds % 3600) ~/ 60;
    final seconds = totalDurationSeconds % 60;
    workHours.value = '$hours : ${minutes.toString().padLeft(2, '0')} : ${seconds.toString().padLeft(2, '0')} HRS';
  }
}
