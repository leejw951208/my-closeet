// shared/widgets 토큰·렌더링 unit 테스트.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/core/theme/app_colors.dart';
import 'package:my_closet_mobile/core/theme/app_theme.dart';
import 'package:my_closet_mobile/shared/widgets/feature_chip.dart';
import 'package:my_closet_mobile/shared/widgets/primary_button.dart';
import 'package:my_closet_mobile/shared/widgets/soft_card.dart';

Widget _wrap(Widget child) =>
    MaterialApp(home: Scaffold(body: Padding(padding: const EdgeInsets.all(16), child: child)));

void main() {
    test('AppShadows.card / elevate 토큰이 정의되어 있다', () {
        expect(AppShadows.card, isNotEmpty);
        expect(AppShadows.elevate, isNotEmpty);
        expect(AppShadows.card.first.blurRadius, greaterThan(0));
    });

    test('AppColors mockup 팔레트 값이 spec과 일치한다', () {
        expect(AppColors.bg, const Color(0xFFFFFFFF));
        expect(AppColors.bgSoft, const Color(0xFFF6F4EE));
        expect(AppColors.ink, const Color(0xFF1A1A18));
        expect(AppColors.peach, const Color(0xFFFBCFA8));
        expect(AppColors.peachInk, const Color(0xFF7A4119));
        expect(AppColors.mint, const Color(0xFFD9E8DC));
        expect(AppColors.mintInk, const Color(0xFF3D6E50));
        expect(AppColors.blue, const Color(0xFFCFDEEF));
        expect(AppColors.lavender, const Color(0xFFE3DCEF));
    });

    testWidgets('PrimaryButton: 라벨이 보이고 onPressed=null이면 비활성', (tester) async {
        await tester.pumpWidget(_wrap(
            const PrimaryButton(label: '시작하기', onPressed: null),
        ));
        expect(find.text('시작하기'), findsOneWidget);
        final inkWell = tester.widget<InkWell>(find.byType(InkWell));
        expect(inkWell.onTap, isNull);
    });

    testWidgets('PrimaryButton: onPressed 콜백이 호출된다', (tester) async {
        var taps = 0;
        await tester.pumpWidget(_wrap(
            PrimaryButton(label: '눌러줘', onPressed: () => taps++),
        ));
        await tester.tap(find.byType(PrimaryButton));
        expect(taps, 1);
    });

    testWidgets('SoftCard: bgSoft 배경·라운드 14', (tester) async {
        await tester.pumpWidget(_wrap(
            const SoftCard(child: Text('내용')),
        ));
        final container = tester.widget<Container>(
            find.ancestor(of: find.text('내용'), matching: find.byType(Container)).first,
        );
        final decoration = container.decoration as BoxDecoration;
        expect(decoration.color, AppColors.bgSoft);
        expect(decoration.borderRadius, BorderRadius.circular(14));
    });

    testWidgets('FeatureChip: variant 색이 매핑된다', (tester) async {
        await tester.pumpWidget(_wrap(
            const Column(children: [
                FeatureChip(variant: FeatureChipVariant.peach),
                FeatureChip(variant: FeatureChipVariant.mint),
                FeatureChip(variant: FeatureChipVariant.blue),
                FeatureChip(variant: FeatureChipVariant.lavender),
            ]),
        ));
        final chips = tester.widgetList<Container>(
            find.descendant(of: find.byType(FeatureChip), matching: find.byType(Container)),
        ).toList();
        expect((chips[0].decoration as BoxDecoration).color, AppColors.peach);
        expect((chips[1].decoration as BoxDecoration).color, AppColors.mint);
        expect((chips[2].decoration as BoxDecoration).color, AppColors.blue);
        expect((chips[3].decoration as BoxDecoration).color, AppColors.lavender);
    });
}
