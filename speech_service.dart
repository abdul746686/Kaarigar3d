import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:speech_to_text/speech_recognition_result.dart';

class SpeechService {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isInitialized = false;
  Function(String)? _listener;

  Future<bool> initSpeech() async {
    _isInitialized = await _speech.initialize();
    return _isInitialized;
  }

  Future<bool> requestPermission() async {
    if (!_isInitialized) return false;
    return await _speech.hasPermission;
  }

  Future<void> startListening() async {
    if (!_isInitialized) return;
    await _speech.listen(
      onResult: (result) => _handleSpeechResult(result),
      listenFor: const Duration(hours: 1),
      pauseFor: const Duration(seconds: 5),
      partialResults: true,
      localeId: 'en_US',
    );
  }

  Future<void> stopListening() async {
    if (!_isInitialized) return;
    await _speech.stop();
  }

  void _handleSpeechResult(SpeechRecognitionResult result) {
    if (result.finalResult && _listener != null) {
      _listener!(result.recognizedWords);
    }
  }

  void addListener(Function(String) listener) {
    _listener = listener;
  }

  void removeListener() {
    _listener = null;
  }

  void dispose() {
    _speech.cancel();
  }
}