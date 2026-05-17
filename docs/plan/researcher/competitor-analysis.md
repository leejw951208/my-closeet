<!-- 옷장 앱 경쟁 환경 분석 보고서. -->

# Competitive Analysis. 옷장 앱 (My Closet)

- **Date.** 2026-05-17
- **Scope.** 글로벌 + 한국 직접 경쟁사 5곳.
- **Sources.** 공개 웹·앱스토어·비교 리뷰 (본 문서 하단 참조).
- **관련 문서.** [discovery-plan.md](discovery-plan.md), [user-personas.md](user-personas.md), [../founder/startup-canvas.md](../founder/startup-canvas.md), [../founder/pricing.md](../founder/pricing.md), [../marketing/value-proposition.md](../marketing/value-proposition.md)

## 1. Market Overview

- **세그먼트.** "Digital Wardrobe / Outfit Planner" — 패션테크의 소비자 서브카테고리. 2010년 Stylebook 출시 이후 매년 신규 진입.
- **시장 동력.** ①Z세대의 OOTD·셀프 표현 ②지속가능 패션·과소비 자각 ③AI 비전(SAM/CLIP)으로 자동 분류 진입장벽 급락 ④SNS 바이럴 (틱톡 "wardrobe organization" 해시태그).
- **사용자 행동.** 등록 노동이 공통 이탈 지점. "갤러리 일괄 import"와 "영수증 OCR"가 차세대 경쟁 축.
- **수익 모델.** 압도적으로 **프리미엄 구독**($4.99~$9.99/월). 유일한 일회성 결제는 Stylebook($5.99).
- **경쟁 강도.** 중상. 글로벌 리더(Whering, Indyx)는 명확. 한국은 Acloset이 사실상 단독.

## 2. Competitive Set Summary

| #      | 경쟁사                               | 본사·지역    | 포지션                    | 가격               | 강점 한 줄                                 |
| ------ | ------------------------------------ | ------------ | ------------------------- | ------------------ | ------------------------------------------ |
| C1     | **Acloset**                          | 한국 (Looko) | 한국·아시아 리더, AI 코디 | Free 100벌 / 구독  | 한국어·날씨·400만 커뮤니티                 |
| C2     | **Whering**                          | 영국         | 글로벌 리더, 지속가능     | Free + $6.99       | 무료 기능 풍부, cost-per-wear, 리세일 통합 |
| C3     | **Indyx**                            | 미국         | 분석·정리 끝판왕          | Free 일부 + $9.99  | 자동 태깅·영수증 import                    |
| C4     | **Stylebook**                        | 미국         | 클래식·수동 통제          | $5.99 일회성 (iOS) | 광고 없음·구독 없음·15년 신뢰              |
| C5     | **Cladwell**                         | 미국         | 캡슐·미니멀 코칭          | $4.99~$49/월       | 캡슐 워드로브, 인간 스타일리스트           |
| (인접) | Nouva, Combyne, StyleSync, Closet.ly | 글로벌       | AI 코디 추천 신생         | 다양               | AI 추천에 특화                             |

## 3. 경쟁사 상세

### C1. Acloset (에이클로젯, Looko)

- **포지션.** 한국 시장 사실상 단독 리더 + 글로벌 확장. AI 디지털 옷장 + 코디 추천 + 커뮤니티.
- **사용자/규모.** 400만+ 글로벌 유저 (자사 표기). 한국어 1st 클래스.
- **강점.**
    - 한국어·한국 날씨·한국 사용자 행동 최적화.
    - AI 자동 분류 + 배경 제거.
    - 일정·날씨 기반 데일리 코디 추천.
    - 커뮤니티(코디 공유) 활성.
- **약점·갭.**
    - 무료 100벌 제한 → 미니멀리스트 외엔 빠른 결제 압박, 이탈 가능.
    - UI/UX가 패션러 취향에 맞춰져 P3(미니멀·통계)·P4(절약·가족) 페르소나 약함.
    - 분석·통계·중복구매 경고 등 "관리형" 기능 약함.
    - 영수증 import 등 마찰 완화 기능 미흡.
- **가격.** 100벌 무료, 이상 월 구독(공개가 변동).
- **위협 수준.** **🔴 매우 높음** — 한국 타겟이면 정면 충돌.

### C2. Whering (영국)

- **포지션.** 글로벌 리더. "Sustainable wardrobe"가 핵심 메시지.
- **강점.**
    - 무료 티어가 가장 관대 (대다수 핵심 기능 무료).
    - **Cost-per-wear**·**리세일 통합** — 지속가능 페르소나에 최적.
    - 강력한 SNS·인플루언서 마케팅.
- **약점·갭.**
    - 한국 시장 거의 미진출, 한국어·날씨 미지원.
    - AI 코디 추천 품질은 중간 수준.
    - 가족·공유 옷장 기능 약함.
- **가격.** Free + $6.99/월.
- **위협 수준.** 🟡 중 (한국 진입 시 급변).

### C3. Indyx (미국)

- **포지션.** "옷장 분석·정리의 끝판왕". 데이터광 페르소나 타겟.
- **강점.**
    - **자동 태깅(카테고리·색·브랜드·소재)** 정확도 업계 최고 평가.
    - **이메일 영수증 → 자동 등록** (유일 제공).
    - 통계·필터 깊이.
- **약점·갭.**
    - 코디 추천(스타일링)은 "기능적이지만 기본 수준" — 가치 동사가 분석에 치우침.
    - 가격 부담 ($9.99/월), 무료는 제한적.
    - 한국 미지원.
- **위협 수준.** 🟡 중 (P3 미니멀·정리광 타겟 시 직접 충돌).

### C4. Stylebook (미국, 2010~)

- **포지션.** 15년 된 클래식. "수동 통제·광고 없음·구독 없음".
- **강점.**
    - 한 번 결제($5.99 iOS) → 평생 사용. 충성 유저 견고.
    - 패키징 리스트·캘린더·통계 등 기능 깊이.
    - 신뢰·안정성.
- **약점·갭.**
    - **iOS only**, Android 부재.
    - AI 자동 분류 없음 → 등록 노동 가장 큼.
    - UI 노후, 신세대(Z) 어필 약함.
- **위협 수준.** 🟢 낮음 (다른 코호트). 그러나 "구독 거부감" 유저 흡수.

### C5. Cladwell (미국)

- **포지션.** "캡슐 워드로브 코칭". 옷장 만들기 자체를 가르치는 컨시어지.
- **강점.**
    - 캡슐·미니 캡슐 추천, **인간 스타일리스트 상담**($49/월).
    - 의사결정 피로 페르소나(P2)에 최적.
- **약점·갭.**
    - 가격 진입 장벽($4.99~$49).
    - 한국 미지원, AI 분류 약함.
    - 사진 등록보다 사전 카탈로그 선택 방식 — 한국 의류와 핏 안 맞음.
- **위협 수준.** 🟢 낮음 (보완재에 가까움).

## 4. 포지셔닝 맵

```
                       ↑ AI 코디·자동화 강
                       │
                       │
   Cladwell (캡슐코칭)  │  Acloset (한국 리더)
                       │  Nouva/StyleSync (AI 추천 특화)
   ←─── 사람 큐레이션  │  자동화·AI ───→
                       │
   Stylebook (수동·통제)│  Indyx (분석·정리)
                       │  Whering (지속가능·무료)
                       │
                       ↓ 등록 노동 큼 / 수동
```

## 5. 시장 갭과 차별화 기회

| 갭                                      | 설명                                                     | My Closet 차별화 각도             |
| --------------------------------------- | -------------------------------------------------------- | --------------------------------- |
| G1. **한국 맥락 + AI 코디 + 무료 친화** | Acloset은 100벌 유료 벽, 글로벌 앱은 한국어·날씨·핏 부재 | 한국 1st + 관대한 무료 + AI 분류  |
| G2. **이모지/플레이풀 정체성**          | 모든 경쟁사가 사진 썸네일 중심. "재미·가벼움" 차별 없음  | 이모지 모드 = SNS 친화 후크       |
| G3. **온보딩 마찰 완화**                | Indyx 영수증 외엔 모두 한 장씩 사진                      | 갤러리 일괄 import + "5벌 챌린지" |
| G4. **중복구매 경고**                   | Whering은 cost-per-wear, 중복 경고는 어디도 안 함        | P4(절약형) 유료 후크              |
| G5. **가족·공유 옷장**                  | 전 경쟁사 1인용 가정                                     | 가족 모드 = 유료 차별             |
| G6. **"어제 뭐 입었지?" 회상**          | 캘린더는 있으나 retention 트리거로 설계된 곳 부재        | P2 핵심 후크                      |
| G7. **OOTD 1탭 SNS export**             | 공유 기능 약함 (인스타·틱톡 직결)                        | P1 바이럴 엔진                    |

## 6. 위협 요약

- **🔴 1순위.** Acloset 한국 락인. 사용자가 이미 옷을 등록해 둔 상태 = 강한 스위칭 비용.
- **🟡 2순위.** Whering 한국어화·신흥 시장 진출 가능성.
- **🟡 3순위.** Indyx 자동 태깅 기술 격차.
- **🟢 4순위.** OpenAI/Apple Vision의 OS 레벨 옷 인식 통합 (장기, 18개월+).

## 7. Positioning Recommendation

**한 줄 포지션.**

> "한국인의 옷장 + 매일의 코디. 사진 한 장으로 끝내는, 가장 가벼운 디지털 옷장."

**차별화 4축.**

1. **한국 1st** — 한국어·한국 날씨·한국 의류 카테고리 우선.
2. **온보딩 마찰 최소** — 갤러리 일괄 import + 5벌 챌린지 + 영수증 import (v1.5).
3. **이모지 모드 + 사진 모드 토글** — 플레이풀 정체성으로 P1 바이럴, 사진 모드로 P2·P3 호환.
4. **유료화는 P4 "쇼핑 가드"** — 중복구매 경고·예산·가족 공유 패키지. 가격은 Acloset보다 명확하고 낮게.

**타겟 우선순위.**

- 비치헤드. P1 (20대 SNS 패션러) + 한국.
- 인접 확장. P2 (결정 피로 직장인).
- 유료화. P4 (절약·가족관리자).
- 회피. Stylebook 충성층(수동 컨트롤 광)·Cladwell 캡슐 매니아 — ROI 낮음.

**피해야 할 함정.**

- Acloset과 동일 포지션(AI 코디 + 커뮤니티)에서 정면 승부. 자원 부족 시 패배.
- 전 페르소나 동시 만족 시도 (Stylebook의 노후화 함정).
- 무료 100벌 같은 임의 벽 → 등록 임계(30벌) 직전에 결제 압박은 자살.

## 8. 12~18개월 리스크·기회

- **리스크.** Acloset의 가격 인하/무료 확장, Whering 한국어 진출, Apple iOS 'Wardrobe' 기본 앱 출시.
- **기회.** 한국 의류 쇼핑몰(무신사·29CM·지그재그) 영수증 import 파트너십, 틱톡 OOTD 챌린지 바이럴, B2B(스타일리스트·중고 거래 플랫폼) 데이터 라이선스.

---

## Sources

- [Best Wardrobe Apps 2026 — Clueless](https://clueless.clothing/blog/best-wardrobe-apps-2026/)
- [The Best Wardrobe Apps 2026 — Indyx](https://www.myindyx.com/blog/the-best-wardrobe-apps)
- [Best Wardrobe Apps 2026 — Nouva](https://www.nouva.app/blog/best-wardrobe-apps-2026-comparison)
- [Whering vs. Cladwell — Indyx](https://www.myindyx.com/versus/whering-vs-cladwell)
- [Best Wardrobe Management Apps 2026 — Wardrowbe](https://wardrowbe.com/blog/best-wardrobe-apps-2026/)
- [8 Best Digital Wardrobe Apps — FitWardrobe](https://fitwardrobe.me/blog/best-digital-wardrobe-apps)
- [Top 8 Closet & Outfit Planner Apps — Fits](https://www.fits-app.com/posts/top-8-closet-outfit-planning-apps-reviewed)
- [Acloset 공식](https://ko.acloset.app/-how-it-works)
- [Acloset App Store (KR)](https://apps.apple.com/kr/app/%EC%97%90%EC%9D%B4%ED%81%B4%EB%A1%9C%EC%A0%AF-ai-%EB%94%94%EC%A7%80%ED%84%B8-%EC%98%B7%EC%9E%A5/id1542311809)
- [StyleSync AI — Google Play](https://play.google.com/store/apps/details?id=com.trinityapps.stylesyncai&hl=en_US)
- [Closet.ly App Store](https://apps.apple.com/us/app/closet-ly-%EC%98%B7%EC%9E%A5%EA%B4%80%EB%A6%AC-%EC%BD%94%EB%94%94%EC%95%B1/id6749236210?l=ko)
