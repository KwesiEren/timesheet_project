import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:flutter/foundation.dart';

class ReportApiService {
  final _supabase = Supabase.instance.client;

  /// Generates a payroll report for a specific user and date range locally.
  /// [savePath] is the local file path where the PDF will be stored.
  Future<void> downloadPayrollReport({
    required String userId,
    required String startDate,
    required String endDate,
    required String savePath,
    Function(int count, int total)? onProgress,
  }) async {
    try {
      if (onProgress != null) onProgress(10, 100);

      // 1. Fetch user details
      final response = await _supabase
          .from('profiles')
          .select('name, email')
          .eq('id', userId)
          .single();
          
      final user = response as Map<String, dynamic>;

      if (onProgress != null) onProgress(30, 100);

      // 2. Fetch activities
      final activitiesResponse = await _supabase
          .from('timesheet_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('start_time', '${startDate}T00:00:00Z')
          .lte('start_time', '${endDate}T23:59:59Z')
          .order('start_time', ascending: true);
          
      final activities = activitiesResponse as List<dynamic>;

      if (onProgress != null) onProgress(60, 100);

      // 3. Generate PDF
      final pdf = pw.Document();

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (pw.Context context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text('Payroll Work Summary', style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold)),
                pw.SizedBox(height: 10),
                pw.Text('Employee: ${user['name'] ?? 'Unknown'} (${user['email'] ?? 'No Email'})'),
                pw.Text('Period: $startDate to $endDate'),
                pw.SizedBox(height: 20),
                pw.TableHelper.fromTextArray(
                  headers: ['Date', 'Activity', 'Start', 'End', 'Hours'],
                  data: activities.map((a) {
                    final start = DateTime.parse(a['start_time']);
                    final end = a['end_time'] != null ? DateTime.parse(a['end_time']) : null;
                    final hours = a['total_duration_seconds'] != null 
                        ? (a['total_duration_seconds'] / 3600).toStringAsFixed(2) 
                        : '0.00';
                    return [
                      "${start.year}-${start.month.toString().padLeft(2, '0')}-${start.day.toString().padLeft(2, '0')}",
                      a['title'] ?? 'Work',
                      "${start.hour.toString().padLeft(2, '0')}:${start.minute.toString().padLeft(2, '0')}",
                      end != null ? "${end.hour.toString().padLeft(2, '0')}:${end.minute.toString().padLeft(2, '0')}" : '-',
                      hours,
                    ];
                  }).toList(),
                ),
              ],
            );
          },
        ),
      );

      if (onProgress != null) onProgress(90, 100);

      // 4. Save to file
      final file = File(savePath);
      await file.writeAsBytes(await pdf.save());

      if (onProgress != null) onProgress(100, 100);

    } catch (e) {
      debugPrint('Download Payroll Report Error: $e');
      throw Exception('Failed to generate report: $e');
    }
  }
}
