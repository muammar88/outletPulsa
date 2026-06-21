import 'dart:async';
import 'package:sqflite/sqflite.dart' as sql;

class DatabaseHelper {
  static Future<void> createTables(sql.Database database) async {
    await database.execute("""CREATE TABLE Temp(
           id INTEGER PRIMARY KEY, 
           token TEXT, 
           csrf_name TEXT,
           csrf_code TEXT,
           sesi_code TEXT)""");
  }

  static Future<sql.Database> db() async {
    return sql.openDatabase('main.db', version: 1,
        onCreate: (sql.Database database, int version) async {
      await createTables(database);
    });
  }

  Future<int> InsertToken(Map<String, dynamic> data) async {
    final db = await DatabaseHelper.db();
    return await db.insert("Temp", data);
  }

  Future<int> updateToken(Map<String, dynamic> data) async {
    int id = 1;
    final db = await DatabaseHelper.db();
    return await db.update("Temp", data, where: "id = ?", whereArgs: [id]);
  }

  Future<int> deleteTemp() async {
    var db = await DatabaseHelper.db();
    return await db.delete("Temp");
  }

  Future<bool> isTokenExist() async {
    var db = await DatabaseHelper.db();
    var res = await db.query("Temp");
    return res.length > 0 ? true : false;
  }

  Future<bool> isLoggedIn() async {
    var db = await DatabaseHelper.db();
    var res = await db.query("Temp");
    return res.length > 0 ? true : false;
  }

  Future<void> DropTableIfExistsThenReCreate() async {
    var db = await DatabaseHelper.db();
    await db.execute("DROP TABLE IF EXISTS Temp");
    await db.execute("""CREATE TABLE Temp(
           id INTEGER PRIMARY KEY, 
           token TEXT, 
           csrf_name TEXT,
           csrf_code TEXT,
           sesi_code TEXT)""");
  }
}
