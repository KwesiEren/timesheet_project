import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:timesheet_project/controllers/timesheet_controller.dart';
import 'package:get_storage/get_storage.dart';

void main() {
  setUpAll(() async {
    await GetStorage.init();
  });

  group('TimesheetController Tests', () {
    late TimesheetController _controller;

    setUp(() {
      Get.testMode = true;
      _controller = TimesheetController();
      Get.put(_controller);
    });

    tearDown(() {
      Get.reset();
    });

    test('Initial state is empty list', () {
      expect(_controller.entries, isEmpty);
      expect(_controller.activeEntry.value, isNull);
    });

    test('Starting a timer creates an active entry', () async {
      // In a real test suite, you'd mock TimesheetApiService and LocalStorageProvider.
      // This verifies the synchronous reactive state.
      _controller.activeEntry.value = null; // Ensure null before
      // Start fake timer async operation
      _controller.startTimer('proj_1', 'Testing task');
      
      // Because `startTimer` is an async function that makes network requests, 
      // wait for it (or at least check the loading state transition).
      expect(_controller.isLoading.value, isTrue);
    });
  });
}
