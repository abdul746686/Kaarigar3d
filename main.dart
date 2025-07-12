import 'package:flutter/material.dart';
import 'package:boycott_alert/app.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:boycott_alert/services/background_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeService();
  runApp(const BoycottAlertApp());
}