import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:get_storage/get_storage.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart' hide Response;

class PendingAction {
  final String id;
  final String method;
  final String path;
  final dynamic body;
  final DateTime timestamp;

  PendingAction({
    required this.id,
    required this.method,
    required this.path,
    this.body,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'method': method,
    'path': path,
    'body': body,
    'timestamp': timestamp.toIso8601String(),
  };

  factory PendingAction.fromJson(Map<String, dynamic> json) => PendingAction(
    id: json['id'],
    method: json['method'],
    path: json['path'],
    body: json['body'],
    timestamp: DateTime.parse(json['timestamp']),
  );
}

class SyncService extends GetxService {
  final _storage = GetStorage();
  final _dio = Dio(BaseOptions(
    baseUrl: 'YOUR_API_BASE_URL', // Should be injected or fetched from config
    connectTimeout: const Duration(seconds: 5),
  ));
  
  final _pendingActions = <PendingAction>[].obs;
  StreamSubscription? _connectivitySubscription;

  @override
  void onInit() {
    super.onInit();
    _loadPendingActions();
    _startConnectivityMonitoring();
  }

  void _loadPendingActions() {
    final List<dynamic>? stored = _storage.read('pending_actions');
    if (stored != null) {
      _pendingActions.value = stored.map((e) => PendingAction.fromJson(e)).toList();
    }
  }

  void _savePendingActions() {
    _storage.write('pending_actions', _pendingActions.map((e) => e.toJson()).toList());
  }

  void _startConnectivityMonitoring() {
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((results) {
      // In newer connectivity_plus, it returns a List<ConnectivityResult>
      if (results.any((r) => r != ConnectivityResult.none)) {
        syncNow();
      }
    });
  }

  Future<void> queueRequest({
    required String method,
    required String path,
    dynamic body,
  }) async {
    final action = PendingAction(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      method: method,
      path: path,
      body: body,
      timestamp: DateTime.now(),
    );

    _pendingActions.add(action);
    _savePendingActions();
    
    // Try to sync immediately if online
    syncNow();
  }

  Future<void> syncNow() async {
    if (_pendingActions.isEmpty) return;

    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity.any((r) => r == ConnectivityResult.none)) return;

    final actionsToProcess = List<PendingAction>.from(_pendingActions);
    
    for (var action in actionsToProcess) {
      try {
        final options = Options(method: action.method);
        await _dio.request(
          action.path,
          data: action.body,
          options: options,
        );
        
        // Success! Remove from queue
        _pendingActions.removeWhere((e) => e.id == action.id);
        _savePendingActions();
      } catch (e) {
        print('Sync failed for action \${action.id}: \$e');
        // If it's a persistent error (400, 404), we might want to remove it
        // If it's a network error (timeout, 503), we keep it for next retry
        if (e is DioException && e.response != null && e.response!.statusCode != null) {
          if (e.response!.statusCode! >= 400 && e.response!.statusCode! < 500) {
             _pendingActions.removeWhere((e) => e.id == action.id);
             _savePendingActions();
          }
        }
      }
    }
  }

  @override
  void onClose() {
    _connectivitySubscription?.cancel();
    super.onClose();
  }
}
