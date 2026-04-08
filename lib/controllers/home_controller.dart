import 'package:get/get.dart';
import '../data/models/timesheet_entry_model.dart';
import '../data/models/project_model.dart';

class HomeController extends GetxController {
  final RxList<TimesheetEntryModel> recentEntries = <TimesheetEntryModel>[].obs;
  final RxList<ProjectModel> userProjects = <ProjectModel>[].obs;
  
  final RxInt unreadNotificationCount = 0.obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    isLoading.value = true;
    
    // Simulate API fetch delay
    await Future.delayed(const Duration(seconds: 1));

    // Dummy data for Phase 2
    userProjects.assignAll([
      ProjectModel(id: 'p1', name: 'Internal Tooling', colorCode: '#0052cc'),
      ProjectModel(id: 'p2', name: 'Client Website', colorCode: '#ff5630'),
    ]);

    unreadNotificationCount.value = 3;
    
    isLoading.value = false;
  }
}
