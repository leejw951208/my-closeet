// My Closet 모바일 앱 진입점. 최소 Material 셸만 정의하며 본격 라우팅은 후속 작업에서 추가한다.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  runApp(const ProviderScope(child: MyClosetApp()));
}

class MyClosetApp extends StatelessWidget {
  const MyClosetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Closet',
      theme: ThemeData(colorSchemeSeed: Colors.indigo, useMaterial3: true),
      home: const _HomePage(),
    );
  }
}

class _HomePage extends StatelessWidget {
  const _HomePage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Closet')),
      body: const Center(child: Text('옷장을 열기 전, 앱을 먼저 여세요.')),
    );
  }
}
