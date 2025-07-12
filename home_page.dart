import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:boycott_alert/services/speech_service.dart';
import 'package:boycott_alert/services/audio_service.dart';
import 'package:boycott_alert/utils/brands.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final SpeechService _speechService = SpeechService();
  final AudioService _audioService = AudioService();
  bool _isListening = false;
  String _statusText = 'Mic Off';

  @override
  void initState() {
    super.initState();
    _initServices();
  }

  Future<void> _initServices() async {
    await _audioService.init();
    await _speechService.initSpeech();
    _speechService.addListener(_handleSpeechResult);
  }

  void _handleSpeechResult(String text) {
    if (text.isEmpty) return;

    for (var brand in boycottBrands) {
      if (text.toLowerCase().contains(brand.toLowerCase())) {
        _triggerAlert(brand);
        break;
      }
    }
  }

  void _triggerAlert(String brand) {
    _audioService.playAlertSound();
    HapticFeedback.vibrate();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('🚨 Boycott Alert'),
        content: Text('Detected brand: $brand'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _toggleListening() async {
    if (_isListening) {
      await _speechService.stopListening();
      setState(() {
        _isListening = false;
        _statusText = 'Mic Off';
      });
    } else {
      final hasPermission = await _speechService.requestPermission();
      if (hasPermission) {
        await _speechService.startListening();
        setState(() {
          _isListening = true;
          _statusText = 'Listening...';
        });
      }
    }
  }

  @override
  void dispose() {
    _speechService.removeListener();
    _speechService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Boycott Alert'),
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              _statusText,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 40),
            Switch(
              value: _isListening,
              onChanged: (value) => _toggleListening(),
              activeColor: Colors.green,
              inactiveThumbColor: Colors.red,
            ),
            const SizedBox(height: 10),
            Text(
              _isListening ? 'Stop Listening' : 'Start Listening',
              style: const TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}