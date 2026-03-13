import 'package:get/get.dart';
import '../data/models/timesheet_entry_model.dart';
import 'package:uuid/uuid.dart';

class TimesheetController extends GetxController {
  final RxList<TimesheetEntryModel> entries = <TimesheetEntryModel>[].obs;
  final RxBool isLoading = false.obs;

  final Uuid _uuid = const Uuid();

  @override
  void onInit() {
    super.onInit();
    fetchEntries();
  }

  Future<void> fetchEntries() async {
    isLoading.value = true;
    
    // Simulate API fetch delay
    await Future.delayed(const Duration(seconds: 1));

    // Dummy data for Phase 2
    entries.assignAll([
      TimesheetEntryModel(
        id: _uuid.v4(),
        userId: 'usr_123',
        projectId: 'p1',
        description: 'Worked on initial setup',
        startTime: DateTime.now().subtract(const Duration(hours: 4)),
        endTime: DateTime.now().subtract(const Duration(hours: 2)),
        totalDuration: const Duration(hours: 2),
      ),
      TimesheetEntryModel(
        id: _uuid.v4(),
        userId: 'usr_123',
        projectId: 'p2',
        description: 'Client meeting',
        startTime: DateTime.now().subtract(const Duration(hours: 1)),
        endTime: DateTime.now(),
        totalDuration: const Duration(hours: 1),
      )
    ]);

    isLoading.value = false;
  }

  Future<void> addEntry(TimesheetEntryModel entry) async {
    isLoading.value = true;
    await Future.delayed(const Duration(milliseconds: 500));
    entries.add(entry);
    isLoading.value = false;
  }

  Future<void> updateEntry(TimesheetEntryModel entry) async {
    isLoading.value = true;
    await Future.delayed(const Duration(milliseconds: 500));
    final index = entries.indexWhere((e) => e.id == entry.id);
    if (index != -1) {
      entries[index] = entry;
    }
    isLoading.value = false;
  }

  Future<void> deleteEntry(String id) async {
    isLoading.value = true;
    await Future.delayed(const Duration(milliseconds: 500));
    entries.removeWhere((e) => e.id == id);
    isLoading.value = false;
  }

  // Active Timer Logic
  final Rxn<TimesheetEntryModel> activeEntry = Rxn<TimesheetEntryModel>();

  void startTimer(String projectId, String description) {
    if (activeEntry.value != null) return; // Timer already running
    
    final newEntry = TimesheetEntryModel(
      id: _uuid.v4(),
      userId: 'usr_123',
      projectId: projectId,
      description: description,
      startTime: DateTime.now(),
    );
    activeEntry.value = newEntry;
    entries.insert(0, newEntry);
  }

  void stopTimer() {
    if (activeEntry.value == null) return;
    
    final updatedEntry = activeEntry.value!.copyWith(
      endTime: DateTime.now(),
      totalDuration: DateTime.now().difference(activeEntry.value!.startTime),
    );
    
    updateEntry(updatedEntry);
    activeEntry.value = null;
  }
}
