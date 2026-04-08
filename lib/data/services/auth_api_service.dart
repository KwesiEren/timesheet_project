import 'package:dio/dio.dart';
import '../providers/api_client.dart';
import '../models/user_model.dart';
import 'package:flutter/foundation.dart';

class AuthApiService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _apiClient.dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      return response.data;
    } on DioException catch (e) {
      debugPrint('Login Error: \${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Login failed');
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? avatarUrl,
  }) async {
    try {
      final response = await _apiClient.dio.post(
        '/auth/register',
        data: {
          'name': name,
          'email': email,
          'password': password,
          'avatarUrl': avatarUrl,
        },
      );
      return response.data;
    } on DioException catch (e) {
      debugPrint('Register Error: \${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Registration failed');
    }
  }

  Future<UserModel> getCurrentUserProfile() async {
    try {
      final response = await _apiClient.dio.get('/auth/me');
      return UserModel(
        id: response.data['id'],
        name: response.data['name'],
        email: response.data['email'],
        avatarUrl: response.data['avatarUrl'],
      );
    } on DioException catch (e) {
      debugPrint('Get User Profile Error: \${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Failed to get user profile');
    }
  }
}
