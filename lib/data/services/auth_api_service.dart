import 'package:dio/dio.dart';
import '../providers/api_client.dart';
import '../models/user_model.dart';
import 'package:flutter/foundation.dart';

class AuthApiService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> login(String email) async {
    try {
      final response = await _apiClient.dio.post(
        '/auth/login',
        data: {'email': email},
      );
      return response.data;
    } on DioException catch (e) {
      debugPrint('Login Error: \${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Login failed');
    }
  }

  Future<UserModel> getUserProfile(String userId) async {
    try {
      final response = await _apiClient.dio.get('/auth/\$userId');
      return UserModel(
        id: response.data['id'],
        name: response.data['name'],
        email: response.data['email'],
        avatarUrl: response.data['avatar_url'],
      );
    } on DioException catch (e) {
      debugPrint('Get User Profile Error: \${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Failed to get user profile');
    }
  }
}
