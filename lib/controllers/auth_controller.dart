import 'package:get/get.dart';
import '../data/models/user_model.dart';
import '../data/services/auth_api_service.dart';
import '../data/providers/local_storage_provider.dart';
import '../routes/app_pages.dart';
import 'package:flutter/material.dart';

class AuthController extends GetxController {
  // Using Rxn so it can be null initially
  final Rxn<UserModel> _currentUser = Rxn<UserModel>();

  UserModel? get currentUser => _currentUser.value;
  bool get isAuthenticated => _currentUser.value != null;

  final RxBool isLoading = false.obs;
  final AuthApiService _authService = AuthApiService();
  final LocalStorageProvider _localStorage = LocalStorageProvider();

  @override
  void onInit() {
    super.onInit();
    _checkLoginStatus();
  }

  void _checkLoginStatus() {
    final cachedUser = _localStorage.getUser();
    if (cachedUser != null) {
      _currentUser.value = UserModel.fromJson(cachedUser);
      Get.offAllNamed(Routes.HOME);
    }
  }

  Future<void> login(String email, String password, bool rememberMe) async {
    try {
      isLoading.value = true;
      
      if (email.isNotEmpty && password.isNotEmpty) {
        final response = await _authService.login(email);
        final userData = response['user'];

        final userModel = UserModel(
          id: userData['id'],
          name: userData['name'],
          email: userData['email'],
        );
        _currentUser.value = userModel;
        
        // Cache the user data
        _localStorage.saveUser(userModel.toJson());

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
    _localStorage.clearUser();
    _localStorage.clearTimesheets(); // Also clear timesheets on logout
    Get.offAllNamed(Routes.LOGIN);
  }
}
