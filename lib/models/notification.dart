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
      details: json['details'] as String?,
      timestamp:
          json['timestamp'] != null ? DateTime.parse(json['timestamp']) : null,
      isUnread: json['isUnread'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'details': details,
      'timestamp': timestamp?.toIso8601String(),
      'isUnread': isUnread,
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
