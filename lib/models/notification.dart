import 'dart:convert';
import 'package:intl/intl.dart'; // Add this package for better date formatting.

List<NotificationData> notificationDataFromJson(String str) =>
    List<NotificationData>.from(
        json.decode(str).map((x) => NotificationData.fromJson(x)));

String notificationDataToJson(List<NotificationData> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class NotificationData {
  final String? id;
  final String? title;
  final String? details;
  final DateTime? timestamp;
  final bool? isUnread;

  NotificationData({
    this.id,
    this.title,
    this.details,
    this.timestamp,
    this.isUnread,
  });

  factory NotificationData.fromJson(Map<String, dynamic> json) {
    return NotificationData(
      id: json['id'] as String?,
      title: json['title'] as String?,
      details: json['message'] as String?,
      timestamp: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
      isUnread: !(json['is_read'] as bool? ?? false),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': details,
      'created_at': timestamp?.toIso8601String(),
      'is_read': !(isUnread ?? true),
    };
  }

  /// Computed property to get a human-readable time difference
  String get relativeTimestamp {
    if (timestamp == null) return "No timestamp";

    final now = DateTime.now();
    final difference = now.difference(timestamp!);

    if (difference.inDays == 1) {
      return "Yesterday";
    } else if (difference.inDays > 1) {
      return "${difference.inDays} days ago";
    } else if (difference.inHours >= 1) {
      return "${difference.inHours} hours ago";
    } else if (difference.inMinutes >= 1) {
      return "${difference.inMinutes} minutes ago";
    } else {
      return "Just now";
    }
  }
}
