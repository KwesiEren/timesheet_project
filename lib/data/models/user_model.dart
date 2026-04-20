class UserModel {
  final String id;
  final String name;
  final String email;
  final String? avatarUrl;
  final String? organizationId;
  final String? organizationName;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    this.organizationId,
    this.organizationName,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      organizationId: json['organizationId'] as String?,
      organizationName: json['organizationName'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatarUrl': avatarUrl,
      'organizationId': organizationId,
      'organizationName': organizationName,
    };
  }

  UserModel copyWith({
    String? id,
    String? name,
    String? email,
    String? avatarUrl,
    String? organizationId,
    String? organizationName,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      organizationId: organizationId ?? this.organizationId,
      organizationName: organizationName ?? this.organizationName,
    );
  }

}
