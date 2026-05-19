import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_model.dart';
import 'package:flutter/foundation.dart';

class AuthApiService {
  final _supabase = Supabase.instance.client;

  Future<AuthResponse> login(String email, String password) async {
    try {
      return await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );
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
      return await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {'name': name},
      );
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
      final session = _supabase.auth.currentSession;
      if (session == null) throw Exception('Not authenticated');
      
      final response = await _supabase
          .from('profiles')
          .select('*, user_roles(role, organization_id, organizations(name))')
          .eq('id', session.user.id)
          .single();

      String? role;
      String? orgId;
      String? orgName;

      final userRoles = response['user_roles'] as List<dynamic>?;
      if (userRoles != null && userRoles.isNotEmpty) {
        final roleData = userRoles[0] as Map<String, dynamic>;
        role = roleData['role'] as String?;
        orgId = roleData['organization_id'] as String?;
        final orgData = roleData['organizations'];
        if (orgData != null) {
          orgName = orgData['name'] as String?;
        }
      }

      return UserModel(
        id: response['id'] as String,
        email: response['email'] as String? ?? session.user.email ?? '',
        name: response['name'] as String? ?? '',
        avatarUrl: response['avatarUrl'] as String?,
        role: role ?? 'employee',
        organizationId: orgId,
        organizationName: orgName,
      );
    } catch (e) {
      debugPrint('Get User Profile Error: $e');
      throw Exception('Failed to get user profile: $e');
    }
  }
}
