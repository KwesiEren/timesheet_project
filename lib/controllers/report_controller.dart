import 'dart:io';
import 'package:get/get.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../data/services/report_api_service.dart';
import 'package:intl/intl.dart';

class ReportController extends GetxController {
  final ReportApiService _reportService = ReportApiService();
  final isLoading = false.obs;
  final downloadProgress = 0.0.obs;

  Future<void> exportAndShare({
    required String userId,
    required String userName,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    try {
      isLoading.value = true;
      downloadProgress.value = 0.0;

      final startStr = DateFormat('yyyy-MM-dd').format(startDate);
      final endStr = DateFormat('yyyy-MM-dd').format(endDate);
      final dateTag = DateFormat('yyyyMMdd').format(startDate);
      
      final fileName = 'payroll_\${userName.replaceAll(' ', '_')}_\$dateTag.pdf';
      late String savePath;

      // 1. Determine Save Path
      if (Platform.isAndroid) {
        // Target public Downloads folder
        savePath = '/storage/emulated/0/Download/\$fileName';
        
        // Fallback if specific path logic fails on modern Android
        if (!Directory('/storage/emulated/0/Download').existsSync()) {
          final directory = await getExternalStorageDirectory();
          savePath = '\${directory!.path}/\$fileName';
        }
      } else {
        // iOS / other
        final directory = await getApplicationDocumentsDirectory();
        savePath = '\${directory.path}/\$fileName';
      }

      // Check for duplicates and append timestamp if needed
      File file = File(savePath);
      if (file.existsSync()) {
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        savePath = savePath.replaceFirst('.pdf', '_\$timestamp.pdf');
      }

      // 2. Download
      await _reportService.downloadPayrollReport(
        userId: userId,
        startDate: startStr,
        endDate: endStr,
        savePath: savePath,
        onProgress: (count, total) {
          if (total > 0) {
            downloadProgress.value = count / total;
          }
        },
      );

      isLoading.value = false;

      // 3. Prompt to Share
      Get.dialog(
        GetDialog(
          title: 'Export Successful',
          middleText: 'Payroll report saved to:\n\${savePath.split('/').last}\n\nWould you like to share it now?',
          textConfirm: 'Share',
          textCancel: 'Close',
          confirmTextColor: .white,
          onConfirm: () async {
            Get.back();
            await Share.shareXFiles([XFile(savePath)], text: 'Payroll Report for \$userName');
          },
        ),
      );

    } catch (e) {
      isLoading.value = false;
      Get.snackbar(
        'Export Failed',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
}

// Simple wrapper for Get.defaultDialog to keep it clean
class GetDialog extends StatelessWidget {
  final String title;
  final String middleText;
  final String textConfirm;
  final String textCancel;
  final VoidCallback onConfirm;

  const GetDialog({
    super.key,
    required this.title,
    required this.middleText,
    required this.textConfirm,
    required this.textCancel,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    return Get.defaultDialog(
      title: title,
      middleText: middleText,
      textConfirm: textConfirm,
      textCancel: textCancel,
      onConfirm: onConfirm,
      barrierDismissible: false,
    );
  }
}
