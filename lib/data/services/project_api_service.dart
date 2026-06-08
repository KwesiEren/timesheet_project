import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/project_model.dart';
import 'package:flutter/foundation.dart';

class ProjectApiService {
  final _supabase = Supabase.instance.client;

  Future<List<ProjectModel>> getProjects() async {
    try {
      final session = _supabase.auth.currentSession;
      if (session == null) throw Exception('Not authenticated');

      // Fetch orgId from profile
      final response = await _supabase
          .from('profiles')
          .select('user_roles(organization_id)')
          .eq('id', session.user.id)
          .single();
      
      String? orgId;
      final userRoles = response['user_roles'] as List<dynamic>?;
      if (userRoles != null && userRoles.isNotEmpty) {
        orgId = userRoles[0]['organization_id'] as String?;
      }

      if (orgId == null) {
        return [];
      }

      final data = await _supabase
          .from('projects')
          .select('*')
          .eq('organization_id', orgId)
          .eq('is_active', true)
          .order('created_at', ascending: false);
          
      return data.map<ProjectModel>((json) {
        return ProjectModel(
          id: json['id'],
          name: json['name'],
          // Provide a default color code since the schema doesn't have it
          colorCode: '#0052cc', 
        );
      }).toList();
    } catch (e) {
      debugPrint('Get Projects Error: $e');
      throw Exception('Failed to fetch projects: $e');
    }
  }
}
