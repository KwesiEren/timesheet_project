import 'package:dio/dio.dart';
import '../providers/api_client.dart';
import 'package:flutter/foundation.dart';

class ReportApiService {
  final ApiClient _apiClient = ApiClient();

  /// Downloads a payroll report for a specific user and date range.
  /// [savePath] is the local file path where the PDF will be stored.
  Future<void> downloadPayrollReport({
    required String userId,
    required String startDate,
    required String endDate,
    required String savePath,
    Function(int count, int total)? onProgress,
  }) async {
    try {
      await _apiClient.dio.download(
        '/reports/payroll',
        savePath,
        queryParameters: {
          'userId': userId,
          'startDate': startDate,
          'endDate': endDate,
        },
        onReceiveProgress: onProgress,
        options: Options(
          responseType: ResponseType.bytes,
          followRedirects: false,
        ),
      );
    } on DioException catch (e) {
      debugPrint('Download Payroll Report Error: \${e.response?.data}');
      throw Exception(e.response?.data['error'] ?? 'Failed to download report');
    }
  }
}
