import 'package:supabase_flutter/supabase_flutter.dart';
import '../providers/api_client.dart';
import '../models/user_model.dart';
import 'package:flutter/foundation.dart';

class AuthApiService {
  final ApiClient _apiClient = ApiClient();
  final _supabase = Supabase.instance.client;

  Future<AuthResponse> login(String email, String password) async {
    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
      return response;
    } on AuthException catch (e) {
      debugPrint('Supabase Login Error: ${e.message}');
      throw Exception(e.message);
    } catch (e) {
      debugPrint('Unexpected Login Error: $e');
      throw Exception('An unexpected error occurred during login');
    }
  }

  Future<AuthResponse> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {'name': name},
      );
      return response;
    } on AuthException catch (e) {
      debugPrint('Supabase Register Error: ${e.message}');
      throw Exception(e.message);
    } catch (e) {
      debugPrint('Unexpected Register Error: $e');
      throw Exception('An unexpected error occurred during registration');
    }
  }

  Future<UserModel> getCurrentUserProfile() async {
    try {
      // This still calls our Node backend to get organization/role data
      final response = await _apiClient.dio.get('/auth/me');
      return UserModel.fromJson(response.data);
    } on DioException catch (e) {
      debugPrint('Get User Profile Error: ${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Failed to get user profile');
    }
  }

}
