import 'dart:convert';

List<AnnouncementData> announcementDataFromJson(String str) =>
    List<AnnouncementData>.from(
        json.decode(str).map((x) => AnnouncementData.fromJson(x)));

String announcementDataToJson(List<AnnouncementData> data) =>
    json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class AnnouncementData {
  final String? id; // Supports UUID from API
  final String? title;
  final String? description;
  final DateTime? timestamp;

  AnnouncementData({
    this.id,
    this.title,
    this.description,
    this.timestamp,
  });

  factory AnnouncementData.fromJson(Map<String, dynamic> json) {
    return AnnouncementData(
      id: json['id'] as String?,
      title: json['title'] as String?,
      description: json['content'] as String?,
      timestamp: json['created_at'] == null ? null : DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> announcementData = <String, dynamic>{};
    announcementData['id'] = id;
    announcementData['title'] = title;
    announcementData['content'] = description;
    announcementData['created_at'] = timestamp?.toIso8601String(); // Convert DateTime to String
    return announcementData;
  }
}
