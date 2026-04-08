class ProjectModel {
  final String id;
  final String name;
  final String colorCode; // e.g '#FF0000'

  ProjectModel({
    required this.id,
    required this.name,
    required this.colorCode,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['id'] as String,
      name: json['name'] as String,
      colorCode: json['colorCode'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'colorCode': colorCode,
    };
  }
}
