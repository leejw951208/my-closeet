// Design canvas host — full MVP flow.
// 27개 화면을 MVP §1–§9 섹션으로 그룹화. 마지막에 인터랙티브 프로토타입.

const ART_W = 402;
const ART_H = 874;

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="intro"
        title="My Closets · 옷장 관리 앱"
        subtitle="컨템포러리 한국 앱 톤 · 따뜻한 크림 + 파스텔 액센트 · 사진 중심 · Pretendard · MVP 전체 27화면"
      >
        <DCArtboard id="intro-note" label="시작점" width={480} height={ART_H}>
          <div style={{
            background:'#FFFFFF', color:'#1A1A18', height:'100%',
            padding: '36px 32px', display:'flex', flexDirection:'column',
            fontFamily:'var(--sans)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, background:'#FBCFA8',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 6px 24px rgba(60,52,40,0.08)',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 6.5a2 2 0 11.5-3.9c.5.1.5.5.5.9v2" stroke="#7A4119" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 8l-9 5.5c-.5.3-.7.5-.7 1 0 .8.5 1.5 1.5 1.5h16.4c1 0 1.5-.7 1.5-1.5 0-.5-.2-.7-.7-1L12 8z" stroke="#7A4119" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </div>

            <div style={{ fontSize: 34, fontWeight: 800, color:'#1A1A18', letterSpacing: -0.8, marginTop: 28, lineHeight: 1.1 }}>
              옷장
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color:'#737067', marginTop: 8, lineHeight: 1.55 }}>
              MVP 스펙 풀 플로우 — 가입부터 동기화·내보내기까지 27개 화면.
            </div>

            <div style={{ height: 1, background:'#EFEAE0', margin: '28px 0' }}/>

            <div style={{ fontSize: 12, fontWeight: 700, color:'#B5B2A8', textTransform:'uppercase', letterSpacing: 0.4 }}>섹션 매핑</div>
            <div style={{ marginTop: 10, display:'flex', flexDirection:'column', gap: 8 }}>
              {[
                ['§1', '로그인·온보딩',  '7화면'],
                ['§2', '홈',             '2화면'],
                ['§3', '옷 등록',        '5화면'],
                ['§4', '옷장 둘러보기',   '3화면'],
                ['§5', '코디 만들기',     '4화면'],
                ['§6', '캘린더',         '2화면'],
                ['§7', '공유',           '1화면'],
                ['§8', '동기화',         '1화면'],
                ['§9', '설정',           '2화면'],
              ].map(([s, t, n]) => (
                <div key={s} style={{ display:'flex', alignItems:'baseline', gap: 10 }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize: 11, fontWeight: 600, color:'#B5B2A8', width: 22, flexShrink: 0 }}>{s}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color:'#1A1A18', flex: 1 }}>{t}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color:'#737067' }}>{n}</div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background:'#EFEAE0', margin: '24px 0 18px' }}/>

            <div style={{ fontSize: 12, fontWeight: 700, color:'#B5B2A8', textTransform:'uppercase', letterSpacing: 0.4 }}>디자인 시스템</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginTop: 12 }}>
              {[
                ['#FBCFA8','피치','#7A4119'],
                ['#CFDEEF','스카이','#2D4F7B'],
                ['#D9E8DC','민트','#3D6E50'],
                ['#E3DCEF','라벤더','#5C4080'],
              ].map(([c, l, ink]) => (
                <div key={c} style={{
                  background: c, color: ink, borderRadius: 14, padding: 14,
                  fontSize: 13, fontWeight: 700,
                }}>{l}</div>
              ))}
            </div>

            <div style={{ marginTop:'auto', fontSize: 11, fontWeight: 500, color:'#B5B2A8' }}>
              KO · iOS / Android · Pretendard
            </div>
          </div>
        </DCArtboard>
      </DCSection>

      {/* ─────────── §1 로그인·온보딩 (7 화면) ─────────── */}
      <DCSection
        id="s1"
        title="§1 · 로그인·온보딩"
        subtitle="가입 동의 → 휴대폰 번호 → SMS 인증 → PIN 설정 → 생체 → 일상 로그인 + PIN 재설정"
      >
        <DCArtboard id="onb-consent" label="1.1 · 온보딩 동의"        width={ART_W} height={ART_H}><Tr_OnbConsent/></DCArtboard>
        <DCArtboard id="onb-phone"   label="1.2 · 휴대폰 번호"        width={ART_W} height={ART_H}><Tr_OnbPhone/></DCArtboard>
        <DCArtboard id="onb-sms"     label="1.3 · SMS 인증번호"       width={ART_W} height={ART_H}><Tr_OnbSms/></DCArtboard>
        <DCArtboard id="onb-pin"     label="1.4 · PIN 설정"           width={ART_W} height={ART_H}><Tr_OnbPinSet/></DCArtboard>
        <DCArtboard id="onb-bio"     label="1.5 · 생체인식 등록"      width={ART_W} height={ART_H}><Tr_OnbBio/></DCArtboard>
        <DCArtboard id="login"       label="1.6 · PIN 로그인"         width={ART_W} height={ART_H}><Tr_Login/></DCArtboard>
        <DCArtboard id="pin-reset"   label="1.7 · PIN 재설정"         width={ART_W} height={ART_H}><Tr_PinReset/></DCArtboard>
      </DCSection>

      {/* ─────────── §2 홈 (2 화면) ─────────── */}
      <DCSection
        id="s2"
        title="§2 · 홈"
        subtitle="오늘의 코디 + 빠른 진입 · 첫 사용자는 빈 옷장 안내"
      >
        <DCArtboard id="home"        label="2.1 · 홈/대시보드"        width={ART_W} height={ART_H}><Tr_Home/></DCArtboard>
        <DCArtboard id="home-empty"  label="2.2 · 빈 옷장 (0벌)"      width={ART_W} height={ART_H}><Tr_ClosetEmpty/></DCArtboard>
      </DCSection>

      {/* ─────────── §3 옷 등록 (5 화면) ─────────── */}
      <DCSection
        id="s3"
        title="§3 · 옷 등록"
        subtitle="카메라/갤러리 선택 → 촬영 또는 멀티 선택 → AI 자동 분류·수정 → 배치 업로드"
      >
        <DCArtboard id="add-sheet"   label="3.1 · 카메라/앨범 선택"   width={ART_W} height={ART_H}><Tr_AddSheet/></DCArtboard>
        <DCArtboard id="add-capture" label="3.2 · 촬영 (가이드)"      width={ART_W} height={ART_H}><Tr_AddCapture/></DCArtboard>
        <DCArtboard id="add-form"    label="3.3 · 사진 + 정보 입력"   width={ART_W} height={ART_H}><Tr_Add/></DCArtboard>
        <DCArtboard id="add-ai"      label="3.4 · AI 분류 결과·수정"   width={ART_W} height={ART_H}><Tr_AddAI/></DCArtboard>
        <DCArtboard id="add-multi"   label="3.5 · 멀티 선택 (앨범)"   width={ART_W} height={ART_H}><Tr_AddMulti/></DCArtboard>
        <DCArtboard id="add-batch"   label="3.6 · 배치 업로드 진행"   width={ART_W} height={ART_H}><Tr_AddBatch/></DCArtboard>
      </DCSection>

      {/* ─────────── §4 옷장 둘러보기 (3 화면) ─────────── */}
      <DCSection
        id="s4"
        title="§4 · 옷장 둘러보기"
        subtitle="사진/이모지 두 가지 그리드 + 상세"
      >
        <DCArtboard id="closet"      label="4.1 · 옷장 (사진 뷰)"     width={ART_W} height={ART_H}><Tr_Closet/></DCArtboard>
        <DCArtboard id="closet-emo"  label="4.2 · 옷장 (이모지 뷰)"   width={ART_W} height={ART_H}><Tr_ClosetEmoji/></DCArtboard>
        <DCArtboard id="item"        label="4.3 · 옷 상세"            width={ART_W} height={ART_H}><Tr_Item/></DCArtboard>
      </DCSection>

      {/* ─────────── §5 코디 만들기 (4 화면) ─────────── */}
      <DCSection
        id="s5"
        title="§5 · 코디 만들기"
        subtitle="4슬롯 마네킹 → 셔플 추천 → 저장된 코디 → 코디 상세"
      >
        <DCArtboard id="build"       label="5.1 · 마네킹 보드"        width={ART_W} height={ART_H}><Tr_Build/></DCArtboard>
        <DCArtboard id="shuffle"     label="5.2 · 셔플 결과"          width={ART_W} height={ART_H}><Tr_BuildShuffle/></DCArtboard>
        <DCArtboard id="outfit-list" label="5.3 · 저장된 코디"        width={ART_W} height={ART_H}><Tr_OutfitList/></DCArtboard>
        <DCArtboard id="outfit-det"  label="5.4 · 코디 상세"          width={ART_W} height={ART_H}><Tr_OutfitDetail/></DCArtboard>
      </DCSection>

      {/* ─────────── §6 캘린더 (2 화면) ─────────── */}
      <DCSection
        id="s6"
        title="§6 · 캘린더"
        subtitle="월 단위 캘린더 + 날짜 상세 (오늘 입기 기록 · 과거 회상)"
      >
        <DCArtboard id="cal"         label="6.1 · 월 캘린더"          width={ART_W} height={ART_H}><Tr_Log/></DCArtboard>
        <DCArtboard id="day-detail"  label="6.2 · 날짜 상세"          width={ART_W} height={ART_H}><Tr_DayDetail/></DCArtboard>
      </DCSection>

      {/* ─────────── §7 공유 (1 화면) ─────────── */}
      <DCSection
        id="s7"
        title="§7 · 공유"
        subtitle="OOTD 합성 이미지 미리보기 + 시스템 공유 시트"
      >
        <DCArtboard id="share"       label="7.1 · OOTD 공유"          width={ART_W} height={ART_H}><Tr_Share/></DCArtboard>
      </DCSection>

      {/* ─────────── §8 동기화 (1 화면) ─────────── */}
      <DCSection
        id="s8"
        title="§8 · 동기화"
        subtitle="클라우드 자동 업로드 · 오프라인 큐 · 활동 로그"
      >
        <DCArtboard id="sync"        label="8.1 · 동기화 상태"        width={ART_W} height={ART_H}><Tr_Sync/></DCArtboard>
      </DCSection>

      {/* ─────────── §9 설정 (3 화면) ─────────── */}
      <DCSection
        id="s9"
        title="§9 · 설정"
        subtitle="마이 · 데이터 내보내기 · 휴대폰 번호 변경"
      >
        <DCArtboard id="me"          label="9.1 · 설정·마이"          width={ART_W} height={ART_H}><Tr_Me/></DCArtboard>
        <DCArtboard id="export"      label="9.2 · 데이터 내보내기"    width={ART_W} height={ART_H}><Tr_Export/></DCArtboard>
        <DCArtboard id="phone"       label="9.3 · 휴대폰 번호 변경"   width={ART_W} height={ART_H}><Tr_PhoneChange/></DCArtboard>
      </DCSection>

      {/* ─────────── 인터랙티브 프로토타입 ─────────── */}
      <DCSection
        id="proto"
        title="인터랙티브 프로토타입"
        subtitle="실제로 작동하는 풀-플로 · 로그인 → 옷장 → 옷 상세 → 코디 빌더 → 기록 → 마이"
      >
        <DCArtboard id="proto" label="실제 작동" width={ART_W} height={ART_H}><Prototype/></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
