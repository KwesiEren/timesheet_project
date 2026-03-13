import 'package:get/get.dart';
import '../data/models/user_model.dart';
import '../routes/app_pages.dart';
import 'package:flutter/material.dart';

class AuthController extends GetxController {
  // Using Rxn so it can be null initially
  final Rxn<UserModel> _currentUser = Rxn<UserModel>();

  UserModel? get currentUser => _currentUser.value;
  bool get isAuthenticated => _currentUser.value != null;

  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _checkLoginStatus();
  }

  void _checkLoginStatus() {
    // TODO: In Phase 3, check local storage / secure storage for token
    // For now we assume the user is not logged in.
  }

  Future<void> login(String email, String password, bool rememberMe) async {
    try {
      isLoading.value = true;
      
      // Simulate network delay
      await Future.delayed(const Duration(seconds: 1));

      // Dummy authentication logic - replace in Phase 3
      if (email.isNotEmpty && password.isNotEmpty) {
        _currentUser.value = UserModel(
          id: 'usr_123',
          name: 'Kwesi Eren',
          email: email,
        );

        Get.snackbar(
          'Success', 
          'Logged in successfully!',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.green,
          colorText: Colors.white,
        );

        Get.offAllNamed(Routes.HOME);
      } else {
        Get.snackbar(
          'Error', 
          'Please enter valid credentials',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error', 
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  void logout() {
    _currentUser.value = null;
    // TODO: Clear local token in Phase 3
    Get.offAllNamed(Routes.LOGIN);
  }
}
