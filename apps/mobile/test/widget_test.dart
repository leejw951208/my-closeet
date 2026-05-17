// 기본 위젯 스모크 테스트. 앱이 빌드되고 환영 문구가 노출되는지 확인한다.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:my_closet_mobile/main.dart';

void main() {
  testWidgets('홈 화면이 환영 문구를 표시한다', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: MyClosetApp()));
    expect(find.text('옷장을 열기 전, 앱을 먼저 여세요.'), findsOneWidget);
  });
}
