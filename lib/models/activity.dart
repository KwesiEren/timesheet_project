class Activity {
  final String title;
  final String details;
  final String notes;
  final DateTime startTime;
  final DateTime endTime;
  final bool isCompleted;

  Activity(
      {required this.title,
      required this.details,
      required this.notes,
      required this.startTime,
      required this.endTime,
      this.isCompleted = false});
}
