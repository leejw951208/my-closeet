// 환경 변수 검증 로직 테스트.

import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/core/env/app_env.dart';

void main() {
    test('API_BASE_URL 미설정이면 validate가 키를 반환한다', () {
        // 테스트 실행 시 --dart-define이 없으므로 빈 문자열이다.
        expect(AppEnv.apiBaseUrl, '');
        expect(AppEnv.validate(), contains('API_BASE_URL'));
    });
}
