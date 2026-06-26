import 'dart:developer';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'ModelSQL.dart';
import 'SecureStorageHelper.dart';

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
    return await openDatabase(
      path,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
      version: 3,
    );
  }

  void _onCreate(Database db, int version) async {
    await db.execute(
        'CREATE TABLE DataProfil(id TEXT PRIMARY KEY, kode TEXT, username TEXT, token TEXT)');
    await db.execute(
        'CREATE TABLE DeviceConnected(id TEXT PRIMARY KEY, device_code TEXT)');
    log('TABLE CREATED');
  }

  void _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      // Migrasi: hapus kolom password (password tidak boleh disimpan plaintext)
      await db.execute('ALTER TABLE DataProfil RENAME TO DataProfil_old');
      await db.execute(
          'CREATE TABLE DataProfil(id TEXT PRIMARY KEY, kode TEXT, username TEXT, token TEXT)');
      await db.execute(
          'INSERT INTO DataProfil(id, kode, username, token) SELECT id, kode, username, token FROM DataProfil_old');
      await db.execute('DROP TABLE DataProfil_old');
      log('MIGRATED to v2: removed password column');
    }
    if (oldVersion < 3) {
      await db.execute(
          'CREATE TABLE IF NOT EXISTS DeviceConnected(id TEXT PRIMARY KEY, device_code TEXT)');
      log('MIGRATED to v3: added DeviceConnected table');
    }
  }

  Future<List<ModelSQL>> getDataProfil() async {
    final db = await _databaseService.database;
    var data = await db.rawQuery('SELECT * FROM DataProfil');
    final secureStorage = SecureStorageHelper();
    final token = await secureStorage.getToken() ?? '';
    
    List<ModelSQL> dataProfil =
        List.generate(data.length, (index) {
          var item = Map<String, dynamic>.from(data[index]);
          item['token'] = token;
          return ModelSQL.fromJson(item);
        });
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

    if (result.isNotEmpty) {
      final secureStorage = SecureStorageHelper();
      final token = await secureStorage.getToken() ?? '';
      var data = Map<String, dynamic>.from(result.first);
      data['token'] = token;
      return data;
    }
    return null;
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
    final secureStorage = SecureStorageHelper();
    await secureStorage.saveToken(dataProfil.token);

    final db = await _databaseService.database;
    var data = await db.rawInsert(
        'INSERT OR REPLACE INTO DataProfil(id, kode, username, token) VALUES(?,?,?,?)',
        [
          dataProfil.id,
          dataProfil.kode,
          dataProfil.username,
          '',
        ]);
    log('inserted $data');
  }

  Future<void> editDataProfil(ModelSQL dataProfil) async {
    final secureStorage = SecureStorageHelper();
    await secureStorage.saveToken(dataProfil.token);

    final db = await _databaseService.database;
    var data = await db.rawUpdate(
        'UPDATE DataProfil SET kode=?, username=?, token=? WHERE id=?',
        [
          dataProfil.kode,
          dataProfil.username,
          '',
          dataProfil.id,
        ]);
    log('updated $data');
  }

  Future<void> deleteDataProfil(String id) async {
    final secureStorage = SecureStorageHelper();
    await secureStorage.deleteToken();

    final db = await _databaseService.database;
    var data = await db.rawDelete('DELETE from DataProfil WHERE id=?', [id]);
    log('deleted $data');
  }

  // Helper untuk DeviceConnected
  Future<String?> getDeviceCode() async {
    final secureStorage = SecureStorageHelper();
    return await secureStorage.getDeviceCode();
  }

  Future<void> saveDeviceCode(String deviceCode) async {
    final secureStorage = SecureStorageHelper();
    await secureStorage.saveDeviceCode(deviceCode);
    log('saved device code securely');
  }
}

