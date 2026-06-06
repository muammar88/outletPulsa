class ModelSQL {
  final String id;
  final String kode;
  final String username;
  final String token;

  ModelSQL({
    required this.id,
    required this.kode,
    required this.username,
    required this.token,
  });

  factory ModelSQL.fromJson(Map<String, dynamic> data) => ModelSQL(
      id: data['id'],
      kode: data['kode'],
      username: data['username'],
      token: data['token']);

  Map<String, dynamic> toMap() => {
        'id': id,
        'kode': kode,
        'username': username,
        'token': token,
      };
}
