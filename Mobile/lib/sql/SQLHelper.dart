import 'dart:developer';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'ModelSQL.dart';

class SQLHelper {
  static final SQLHelper _databaseService = SQLHelper._internal();
  factory SQLHelper() => _databaseService;
  SQLHelper._internal();
  static Database? _database;
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await initDatabase();
    return _database!;
  }

  Future<Database> initDatabase() async {
    final getDirectory = await getApplicationDocumentsDirectory();
    String path = getDirectory.path + '/outletdb.db';
    log(path);
    return await openDatabase(path, onCreate: _onCreate, version: 1);
  }

  void _onCreate(Database db, int version) async {
    await db.execute(
        'CREATE TABLE DataProfil(id TEXT PRIMARY KEY, kode TEXT, username TEXT, password TEXT, token TEXT)');
    log('TABLE CREATED');
  }

  Future<List<ModelSQL>> getDataProfil() async {
    final db = await _databaseService.database;
    var data = await db.rawQuery('SELECT * FROM DataProfil');
    List<ModelSQL> dataProfil =
        List.generate(data.length, (index) => ModelSQL.fromJson(data[index]));
    return dataProfil;
  }

  Future<Map<String, dynamic>?> getSingleData(String id) async {
    Database db = await database;
    List<Map<String, dynamic>> result = await db.query(
      'DataProfil',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1, // Memastikan hanya satu data yang diambil
    );

    return result.isNotEmpty ? result.first : null;
  }

  Future<bool> isDataExist(String id) async {
    final db = await _databaseService.database;
    List<Map<String, dynamic>> result = await db.query(
      'DataProfil',
      where: 'id = ?',
      whereArgs: [id],
    );
    return result.isNotEmpty; // Mengembalikan true jika result tidak kosong
  }

  Future<void> insertDataProfil(ModelSQL dataProfil) async {
    final db = await _databaseService.database;
    var data = await db.rawInsert(
        'INSERT INTO DataProfil(id, kode, username, password, token ) VALUES(?,?,?,?,?)',
        [
          dataProfil.id,
          dataProfil.kode,
          dataProfil.username,
          dataProfil.password,
          dataProfil.token
        ]);
    log('inserted $data');
  }

  Future<void> editDataProfil(ModelSQL dataProfil) async {
    final db = await _databaseService.database;
    var data = await db.rawUpdate(
        'UPDATE DataProfil SET kode=?, username=?,password=?,token=? WHERE ID=?',
        [
          dataProfil.kode,
          dataProfil.username,
          dataProfil.password,
          dataProfil.token,
          dataProfil.id
        ]);
    log('updated $data');
  }

  Future<void> deleteDataProfil(String id) async {
    final db = await _databaseService.database;
    var data = await db.rawDelete('DELETE from DataProfil WHERE id=?', [id]);
    log('deleted $data');
  }
}
