// 환경 변수 누락 시 EnvErrorApp이 누락 키를 표시하는지 확인하는 스모크 테스트.

import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/app/env_error_app.dart';

void main() {
    testWidgets('EnvErrorApp이 누락 키를 표시한다', (WidgetTester tester) async {
        await tester.pumpWidget(
            const EnvErrorApp(missing: ['API_BASE_URL']),
        );
        await tester.pumpAndSettle();
        expect(find.text('환경 설정 누락'), findsOneWidget);
        expect(find.text('· API_BASE_URL'), findsOneWidget);
    });
}
