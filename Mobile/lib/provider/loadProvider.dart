import 'package:flutter/material.dart';

class Load_provider with ChangeNotifier {
  bool? _isLoad = false;
  bool? get isLoad => _isLoad;

  set isLoad(bool? value) {
    _isLoad = value;
    notifyListeners();
  }
}
