<!-- 옷장 앱 제품 지표 대시보드·이벤트 스키마 명세. -->

# Metrics Dashboard. My Closet MVP

- **Date.** 2026-05-17
- **Stack.** Amplitude (또는 Mixpanel) + Firebase Crashlytics + 자체 데이터 웨어하우스(BigQuery).
- **관련 문서.** [../founder/north-star.md](../founder/north-star.md), [prd-mvp.md](prd-mvp.md), [user-stories.md](user-stories.md)

## 1. 이벤트 스키마 카탈로그

### 공통 필드 (모든 이벤트)

| 필드        | 타입     | 설명                                |
| ----------- | -------- | ----------------------------------- |
| user_id     | string   | 가입 사용자 식별자 (UUID, PII 아님) |
| device_id   | string   | 디바이스 식별자                     |
| session_id  | string   | 세션 식별자                         |
| timestamp   | ISO-8601 | 이벤트 발생 시각                    |
| platform    | enum     | ios / android                       |
| app_version | string   | 빌드 버전                           |
| ab_buckets  | string[] | 진행 중 A/B 실험 버킷 (선택)        |

### 핵심 이벤트

| 이벤트 명                    | 트리거 시점                                                                                                                                             | 추가 속성                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `sign_up`                    | 가입 완료                                                                                                                                               | provider (kakao/apple/email)                                                                  |
| ~~`onboarding_challenge_*`~~ | (v0.2) 5벌 챌린지가 v1.5로 이연되며 MVP 이벤트 카탈로그에서 제외. v1.5 재기획 시 동일 이름으로 부활 검토.                                               | —                                                                                             |
| `item_register`              | 옷 1벌 등록 완료                                                                                                                                        | source (camera/gallery), batch_size (일괄 시), category_top1, ai_confidence, duration_seconds |
| `item_category_correct`      | 사용자가 카테고리 수정                                                                                                                                  | from_category, to_category                                                                    |
| `item_delete`                | 옷 삭제                                                                                                                                                 | days_since_register                                                                           |
| `wardrobe_view_open`         | 옷장 화면 진입                                                                                                                                          | view_mode (photo/emoji)                                                                       |
| `wardrobe_view_toggle`       | 뷰 모드 토글                                                                                                                                            | from_mode, to_mode                                                                            |
| `outfit_board_open`          | 코디 보드 진입                                                                                                                                          | total_items_owned                                                                             |
| `outfit_shuffle`             | 셔플 실행                                                                                                                                               | —                                                                                             |
| `outfit_save`                | 코디 저장                                                                                                                                               | source (manual/shuffle/recommendation), slots_filled                                          |
| `outfit_wear`                | "오늘 입기" 클릭                                                                                                                                        | outfit_id, days_since_outfit_create                                                           |
| `outfit_share`               | OOTD 공유 클릭                                                                                                                                          | outfit_id, destination (instagram_story/tiktok/etc)                                           |
| `outfit_delete`              | 코디 삭제                                                                                                                                               | days_since_outfit_create                                                                      |
| ~~`recommendation_push_*`~~  | (v0.2) 날씨 추천 푸시가 v1.5로 이연되며 MVP 이벤트 카탈로그에서 제외. v1.5에서는 컨텍스트 트리거(예. `recommendation_trigger_type`) 속성을 추가해 부활. | —                                                                                             |
| `calendar_view_open`         | 캘린더 진입                                                                                                                                             | —                                                                                             |
| `app_open`                   | 앱 진입                                                                                                                                                 | source (icon/push/deeplink)                                                                   |
| `app_close`                  | 앱 종료                                                                                                                                                 | session_duration_seconds                                                                      |
| `crash`                      | 크래시 발생 (Crashlytics 자동)                                                                                                                          | stack_trace                                                                                   |

## 2. North Star 메트릭

| 지표                       | 정의                                          | 계산식                                                                                                                                          |
| -------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **WAU당 Active Outfit 수** | 주간 활성 사용자가 받은 진짜 가치의 평균 빈도 | `COUNT(DISTINCT outfit_id WHERE event IN (outfit_save 24h survival, outfit_wear, outfit_share)) / COUNT(DISTINCT user_id WHERE active_in_week)` |

자세한 정의는 [../founder/north-star.md](../founder/north-star.md) 참조.

## 3. Input Metrics

| 지표                     | 계산식                                                                            | 30d / 90d Target | 알람 임계 |
| ------------------------ | --------------------------------------------------------------------------------- | :--------------: | --------- |
| I1. 7d 등록 옷 평균 수   | `AVG(COUNT(item_register) FROM signup TO signup+7d)`                              |     15 / 20      | <10       |
| I2. WAU 코디 보드 진입률 | `COUNT(DISTINCT user_id WHERE outfit_board_open) / WAU`                           |   ≥40% / ≥50%    | <30%      |
| I3. 저장 전환율          | `outfit_save / outfit_board_open`                                                 |   ≥25% / ≥35%    | <20%      |
| I4. 캘린더 기록 비율     | `outfit_wear / outfit_save`                                                       |   ≥10% / ≥20%    | <8%       |
| I5. 공유 전환율          | `outfit_share / outfit_save`                                                      |    ≥8% / ≥15%    | <5%       |
| I6. D7 retention         | `COUNT(user_id WHERE app_open in [d+7, d+8)) / COUNT(user_id WHERE sign_up on d)` |   ≥25% / ≥30%    | <20%      |

## 4. Health / Counter Metrics

| 지표                           | 정의                                                          | 알람 임계                             |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------------- |
| H1. 등록 평균 소요 시간        | `AVG(item_register.duration_seconds)`                         | >10초                                 |
| H2. AI 카테고리 보정 비율      | `item_category_correct / item_register`                       | >25%                                  |
| H3. 등록 후 7일 내 삭제 비율   | `item_delete WHERE days_since_register <= 7 / item_register`  | >15%                                  |
| H4. 코디 저장 후 1시간 내 삭제 | `outfit_delete WHERE minutes_since_create < 60 / outfit_save` | >10%                                  |
| H5. (v1.5 활성) 푸시 OFF 비율  | `notification_disabled / WAU`                                 | >30% — MVP는 푸시 미출시이므로 미추적 |
| H6. 크래시율                   | `crash_users / DAU`                                           | >0.5%                                 |
| H7. P95 화면 진입 시간         | 클라이언트 측정                                               | >2초                                  |
| H8. /classify API P95          | 서버 측정                                                     | >2.5초                                |
| H9. 앱스토어 평점              | 외부 데이터                                                   | <4.0                                  |
| H10. AI 분류 Top-1 정확도      | 일 단위 회귀 테스트                                           | <80%                                  |

## 5. 대시보드 구성

### 5.1 Daily Pulse (매일 자동, Slack 알림)

- 어제 신규 가입자, DAU.
- 어제 NSM (WAU당 Active Outfit, 트레일링 7일 기준).
- 알람 임계 위반 항목.

### 5.2 Weekly Review (매주 월요일)

- NSM + I1~I6 7일 트렌드.
- Counter Metric 위반 알람 로그.
- 핵심 코호트(주차별 가입자) D1·D3·D7 retention.
- 신규 vs 복귀 사용자 비율.

### 5.3 Funnel Dashboard

1. `app_install → sign_up`
2. `sign_up → onboarding_challenge_complete`
3. `onboarding_challenge_complete → first outfit_save`
4. `first outfit_save → outfit_share or outfit_wear (7일 내)`
5. `D7 retention`

각 단계 전환율 + 절단점 시각화.

### 5.4 Feature Adoption

- 기능별 7d 활성 사용자 수 (옷장 / 코디 / 캘린더 / 추천 / 공유).
- 기능 미사용자 비율 (예. "코디 보드 한 번도 안 본 사용자").

### 5.5 AI Performance

- 일별 분류 정확도 (회귀 셋 100장).
- 사용자 보정 카테고리 confusion matrix.
- 모델 버전별 비교.

### 5.6 Cost Tracker (v1.5 이후)

- 사용자당 월 스토리지·추론 한계비용.
- 유료 전환율·MRR·해지율.
- LTV·CAC 추정.

## 6. 알람·온콜

- **Critical (즉시 호출).** 크래시율 ≥1%, /classify API 5xx ≥1%, NSM 일 변동률 ≥30% 하락.
- **High (1일 내 대응).** D7 retention 임계 이하, AI 정확도 임계 이하, 푸시 OFF율 임계 이상.
- **Medium (주간 검토).** 등록 후 삭제율, 캘린더 기록 비율 정체.

채널. Slack #closet-metrics + 야간 호출은 PagerDuty (출시 후 사용자 ≥10,000 시점부터).

## 7. 데이터 거버넌스

- **PII 미수집.** 이벤트에는 사진·이름·이메일 미포함.
- **사진 데이터 사용 동의.** AI 학습용 익명 보관은 별도 동의 후에만.
- **로그 보관.** 원본 이벤트 90일, 집계 데이터 무기한.
- **GDPR/PIPA 대응.** 사용자 요청 시 30일 내 모든 이벤트 삭제 가능.
- **A/B 실험.** 실험 ID 카탈로그 별도 관리, 동시 실험 ≤3.

## 8. 출시 전 체크리스트

- [ ] 위 이벤트 카탈로그 모두 구현 + QA.
- [ ] PII 미포함 코드 리뷰 통과.
- [ ] Daily Pulse·Weekly Review·Funnel·Feature Adoption·AI Performance 5개 대시보드 가동.
- [ ] 알람 채널 Slack 연결.
- [ ] AI 회귀 셋 100장 라벨링 완료.
- [ ] 사용자 데이터 삭제 운영 절차 문서화.
- [ ] 분석 SDK 한 곳으로 통일 (Amplitude 또는 Mixpanel).
