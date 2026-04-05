import 'package:get/get.dart';
import '../data/models/timesheet_entry_model.dart';
import '../data/services/timesheet_api_service.dart';
import '../data/providers/local_storage_provider.dart';
import 'package:uuid/uuid.dart';

class TimesheetController extends GetxController {
  final RxList<TimesheetEntryModel> entries = <TimesheetEntryModel>[].obs;
  final RxBool isLoading = false.obs;

  final TimesheetApiService _apiService = TimesheetApiService();
  final LocalStorageProvider _localStorage = LocalStorageProvider();
  final Uuid _uuid = const Uuid();

  @override
  void onInit() {
    super.onInit();
    fetchEntries();
  }

  Future<void> fetchEntries() async {
    isLoading.value = true;
    try {
      // First, try to load from cache
      final cachedData = _localStorage.getTimesheets();
      if (cachedData != null) {
        entries.assignAll(
          cachedData.map((e) => TimesheetEntryModel.fromJson(e)).toList()
        );
      }

      // Hardcoding user ID for now since we don't have persistency
      final fetchedEntries = await _apiService.getTimesheets('usr_123');
      entries.assignAll(fetchedEntries);
      
      // Cache the fresh data
      _localStorage.saveTimesheets(fetchedEntries.map((e) => e.toJson()).toList());
    } catch (e) {
      Get.snackbar('Offline Mode', 'Showing locally cached timesheets if available.');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> addEntry(TimesheetEntryModel entry) async {
    isLoading.value = true;
    try {
      final createdEntry = await _apiService.createTimesheet(entry);
      entries.insert(0, createdEntry);
      _localStorage.saveTimesheets(entries.map((e) => e.toJson()).toList());
    } catch (e) {
      Get.snackbar('Error', 'Could not create timesheet: \$e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> updateEntry(TimesheetEntryModel entry) async {
    isLoading.value = true;
    try {
      final updatedEntry = await _apiService.updateTimesheet(entry);
      final index = entries.indexWhere((e) => e.id == updatedEntry.id);
      if (index != -1) {
        entries[index] = updatedEntry;
        _localStorage.saveTimesheets(entries.map((e) => e.toJson()).toList());
      }
    } catch (e) {
      Get.snackbar('Error', 'Could not update timesheet: \$e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> deleteEntry(String id) async {
    isLoading.value = true;
    try {
      await _apiService.deleteTimesheet(id);
      entries.removeWhere((e) => e.id == id);
      _localStorage.saveTimesheets(entries.map((e) => e.toJson()).toList());
    } catch (e) {
      Get.snackbar('Error', 'Could not delete timesheet: \$e');
    } finally {
      isLoading.value = false;
    }
  }

  // Active Timer Logic
  final Rxn<TimesheetEntryModel> activeEntry = Rxn<TimesheetEntryModel>();

  Future<void> startTimer(String projectId, String description) async {
    if (activeEntry.value != null) return; // Timer already running
    
    isLoading.value = true;
    try {
      final newEntry = TimesheetEntryModel(
        id: _uuid.v4(),
        userId: 'usr_123',
        projectId: projectId,
        description: description,
        startTime: DateTime.now(),
      );
      
      final createdEntry = await _apiService.createTimesheet(newEntry);
      activeEntry.value = createdEntry;
      entries.insert(0, createdEntry);
      _localStorage.saveTimesheets(entries.map((e) => e.toJson()).toList());
    } catch (e) {
      Get.snackbar('Error', 'Could not start timer: \$e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> stopTimer() async {
    if (activeEntry.value == null) return;
    
    isLoading.value = true;
    try {
      final updatedEntry = activeEntry.value!.copyWith(
        endTime: DateTime.now(),
        totalDuration: DateTime.now().difference(activeEntry.value!.startTime),
      );
      
      final savedEntry = await _apiService.updateTimesheet(updatedEntry);
      
      final index = entries.indexWhere((e) => e.id == savedEntry.id);
      if (index != -1) {
        entries[index] = savedEntry;
      }
      activeEntry.value = null;
    } catch (e) {
      Get.snackbar('Error', 'Could not stop timer: \$e');
    } finally {
      isLoading.value = false;
    }
  }
}
