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

  bool get isOwner => _currentUser.value?.role == 'Owner';
  bool get isManager => _currentUser.value?.role == 'Manager';
  bool get isEmployee => _currentUser.value?.role == 'Employee';
  bool get isManagement => isOwner || isManager;

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
    final token = _localStorage.getAuthToken();
    if (cachedUser != null && token != null && token.isNotEmpty) {
      _currentUser.value = UserModel.fromJson(cachedUser);
      Get.offAllNamed(Routes.HOME);
    }
  }

  Future<void> login(String email, String password, bool rememberMe) async {
    try {
      isLoading.value = true;
      
      if (email.isNotEmpty && password.isNotEmpty) {
        final response = await _authService.login(email, password);
        final userData = response['user'];
        final token = response['token'] as String?;

        if (token == null || token.isEmpty) {
          throw Exception('Login succeeded but token was missing');
        }

        final userModel = UserModel.fromJson(userData);
        _currentUser.value = userModel;
        
        // Cache auth state for future app launches
        await _localStorage.saveAuthToken(token);
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
    _localStorage.clearAuthToken();
    _localStorage.clearTimesheets(); // Also clear timesheets on logout
    Get.offAllNamed(Routes.LOGIN);
  }
}
