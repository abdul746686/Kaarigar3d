import 'package:flutter/material.dart';
import 'package:boycott_alert/home_page.dart';

class BoycottAlertApp extends StatelessWidget {
  const BoycottAlertApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Boycott Alert',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const HomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}