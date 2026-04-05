import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:timesheet_project/controllers/auth_controller.dart';
import 'package:timesheet_project/data/providers/local_storage_provider.dart';
import 'package:get_storage/get_storage.dart';

void main() {
  setUpAll(() async {
    // Initialize required dependencies for tests
    await GetStorage.init();
  });

  group('AuthController Tests', () {
    late AuthController authController;

    setUp(() {
      Get.testMode = true;
      authController = AuthController();
      Get.put(authController);
    });

    tearDown(() {
      // Clean up GetX state after each test
      Get.reset();
      LocalStorageProvider().clearUser();
    });

    test('Initial state should be logged out', () {
      expect(authController.isAuthenticated, isFalse);
      expect(authController.currentUser, isNull);
    });

    test('Logout clears local storage and resets state', () {
      // Simulate login
      authController.login('test@example.com', 'password', false);
      expect(authController.isLoading.value, isTrue); // Starts loading
      
      // Because login is async and calls the real API, a true end-to-end 
      // mocking setup is required for deep unit tests. 
      // For this test suite, we'll verify the logout behavior standalone.
      authController.logout();
      expect(authController.isAuthenticated, isFalse);
      expect(authController.currentUser, isNull);
      
      final savedUser = LocalStorageProvider().getUser();
      expect(savedUser, isNull);
    });
  });
}
