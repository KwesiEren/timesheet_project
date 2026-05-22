import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/models/user_model.dart';
import '../data/services/auth_api_service.dart';
import '../data/providers/local_storage_provider.dart';
import '../routes/app_pages.dart';
import 'package:flutter/material.dart';

class AuthController extends GetxController {
  final Rxn<UserModel> _currentUser = Rxn<UserModel>();

  UserModel? get currentUser => _currentUser.value;
  bool get isAuthenticated => _currentUser.value != null;

  bool get isOwner => _currentUser.value?.role == 'owner';
  bool get isManager => _currentUser.value?.role == 'manager';
  bool get isEmployee => _currentUser.value?.role == 'employee';
  bool get isManagement => isOwner || isManager;

  final RxBool isLoading = false.obs;
  final AuthApiService _authService = AuthApiService();
  final LocalStorageProvider _localStorage = LocalStorageProvider();
  final _supabase = Supabase.instance.client;

  @override
  void onInit() {
    super.onInit();
    _checkLoginStatus();
    
    // Listen to auth state changes
    _supabase.auth.onAuthStateChange.listen((data) {
      final AuthChangeEvent event = data.event;
      if (event == AuthChangeEvent.signedOut) {
        _currentUser.value = null;
        _localStorage.clearUser();
        Get.offAllNamed(Routes.LOGIN);
      }
    });
  }

  void _checkLoginStatus() {
    final cachedUser = _localStorage.getUser();
    final session = _supabase.auth.currentSession;
    
    if (session != null && cachedUser != null) {
      _currentUser.value = UserModel.fromJson(cachedUser);
      // Optional: Refresh profile from backend to ensure roles are up to date
      _refreshProfile();
      Get.offAllNamed(Routes.HOME);
    }
  }

  Future<void> _refreshProfile() async {
    try {
      final userModel = await _authService.getCurrentUserProfile();
      _currentUser.value = userModel;
      _localStorage.saveUser(userModel.toJson());
    } catch (e) {
      debugPrint('Error refreshing profile: $e');
    }
  }

  Future<void> login(String email, String password, bool rememberMe) async {
    try {
      isLoading.value = true;
      
      if (email.isNotEmpty && password.isNotEmpty) {
        // 1. Supabase Auth Login
        await _authService.login(email, password);
        
        // 2. Fetch Profile from Node Backend (to get Organization and Role)
        final userModel = await _authService.getCurrentUserProfile();
        
        _currentUser.value = userModel;
        
        // 3. Cache user model for role-based UI access
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
        'Login Failed', 
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    await _supabase.auth.signOut();
    _currentUser.value = null;
    _localStorage.clearUser();
    _localStorage.clearTimesheets();
    Get.offAllNamed(Routes.LOGIN);
  }
}
