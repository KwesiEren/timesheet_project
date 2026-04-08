import 'package:get/get.dart';
import 'auth_controller.dart';
import 'home_controller.dart';
import 'timesheet_controller.dart';

class InitialBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(AuthController(), permanent: true);
    Get.put(HomeController(), permanent: true);
    Get.put(TimesheetController(), permanent: true);
  }
}
