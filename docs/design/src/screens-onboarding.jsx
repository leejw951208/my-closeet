// ─────────────────────────────────────────────────────────────
// 온보딩·가입 플로우 — MVP §1 로그인·온보딩
//
//   • Tr_OnbConsent   — 온보딩 동의 화면 (서비스 소개 + 약관)
//   • Tr_OnbPhone     — 휴대폰 번호 입력
//   • Tr_OnbSms       — SMS 인증번호 입력
//   • Tr_OnbPinSet    — PIN 6자리 설정 (확인 단계)
//   • Tr_OnbBio       — 생체인식 등록 다이얼로그
//   • Tr_PinReset     — PIN 재설정 (잠금 해제 후)
// ─────────────────────────────────────────────────────────────

// ─── 1. 온보딩 동의 ──────────────────────────────────────────
function Tr_OnbConsent() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column', padding:'0 24px' }}>
        <TSF/>

        <div style={{ marginTop: 40, display:'flex', flexDirection:'column', alignItems:'center', gap: 20 }}>
          <div style={{
            width: 78, height: 78, borderRadius: 22, background: T.primary,
            display:'flex', alignItems:'center', justifyContent:'center', boxShadow: ELEVATE_SHADOW,
          }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <path d="M12 6.5a2 2 0 11.5-3.9c.5.1.5.5.5.9v2" stroke={T.primaryInk} strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M12 8l-9 5.5c-.5.3-.7.5-.7 1 0 .8.5 1.5 1.5 1.5h16.4c1 0 1.5-.7 1.5-1.5 0-.5-.2-.7-.7-1L12 8z" stroke={T.primaryInk} strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </div>

          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 26, fontWeight: 800, color: T.ink, letterSpacing: -0.6 }}>
              내 옷장을 휴대폰 속으로
            </div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 500, color: T.ink2, marginTop: 10, lineHeight: 1.5 }}>
              사진으로 등록하고 코디를 만들어<br/>입은 날들을 자동으로 기록해요
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display:'flex', flexDirection:'column', gap: 10 }}>
          {[
            { c: T.peach,    ink: T.peachInk,    t:'사진 한 장으로 옷 등록', d:'AI가 카테고리·색상 자동 분류' },
            { c: T.mint,     ink: T.mintInk,     t:'마네킹에 드래그해 코디',    d:'4슬롯 · 셔플 추천' },
            { c: T.blue,     ink: T.blueInk,     t:'캘린더에 입은 옷 기록',     d:'한 달이 한 눈에' },
            { c: T.lavender, ink: T.lavenderInk, t:'OOTD 한 번에 공유',         d:'인스타·카톡으로 바로' },
          ].map(f => (
            <div key={f.t} style={{ display:'flex', alignItems:'center', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12, background: f.c, color: f.ink,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0,
                fontFamily:'var(--sans)', fontSize: 17, fontWeight: 800,
              }}>·</div>
              <div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 700, color: T.ink }}>{f.t}</div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, marginTop: 1 }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:'auto', paddingBottom: 24 }}>
          <div style={{
            background: T.bgSoft, borderRadius: 14, padding:'12px 14px', marginBottom: 12,
            display:'flex', gap: 12, alignItems:'flex-start',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 6, background: T.primary,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0, marginTop: 1,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke={T.primaryInk} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, lineHeight: 1.5 }}>
              <span style={{ color: T.ink, fontWeight: 700 }}>[필수]</span> 서비스 이용약관 · 개인정보 처리방침에 동의합니다.<br/>
              <span style={{ color: T.ink3 }}>[선택] 마케팅 정보 수신 동의</span>
            </div>
          </div>
          <PrimaryBtn>시작하기</PrimaryBtn>
          <div style={{ textAlign:'center', marginTop: 14 }}>
            <span style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2 }}>
              이미 계정이 있어요 <span style={{ color: T.peachInk, fontWeight: 700 }}>로그인</span>
            </span>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── 2. 휴대폰 번호 입력 ─────────────────────────────────────
function Tr_OnbPhone() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column', padding:'0 24px' }}>
        <TSF/>

        <div style={{ display:'flex', alignItems:'center', marginTop: 4, marginLeft: -8 }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(22)}</div>
        </div>

        <div style={{ marginTop: 4, display:'flex', gap: 4 }}>
          {[1, 0, 0, 0].map((on, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: on ? T.primaryInk : T.line }}/>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 24, fontWeight: 800, color: T.ink, letterSpacing: -0.5 }}>
            휴대폰 번호를<br/>입력해주세요
          </div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 500, color: T.ink2, marginTop: 10 }}>
            인증번호를 보내드려요
          </div>
        </div>

        <div style={{ marginTop: 36, display:'flex', gap: 8 }}>
          <div style={{
            background: T.card, borderRadius: 16, padding:'14px 16px', boxShadow: CARD_SHADOW,
            display:'flex', alignItems:'center', gap: 6,
            fontFamily:'var(--sans)', fontSize: 16, fontWeight: 600, color: T.ink,
          }}>
            🇰🇷 +82
          </div>
          <div style={{
            flex: 1, background: T.card, borderRadius: 16, padding:'14px 18px', boxShadow: CARD_SHADOW,
            position:'relative',
            fontFamily:'var(--sans)', fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: 0.6,
          }}>
            010 1234 5678
            <div style={{
              position:'absolute', right: 14, top: '50%', transform:'translateY(-50%)',
              width: 22, height: 22, borderRadius: 11, background: T.bgSoft,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>{I.close(12, T.ink3)}</div>
          </div>
        </div>

        <div style={{ marginTop: 14, padding:'10px 14px', background: T.bgSoft, borderRadius: 12,
          fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, lineHeight: 1.55 }}>
          입력하신 번호는 본인 확인 용도로만 쓰여요. 광고에 활용되지 않습니다.
        </div>

        <div style={{ marginTop:'auto', paddingBottom: 12 }}>
          <PrimaryBtn>인증번호 받기</PrimaryBtn>
        </div>

        <div style={{ background: T.bgSoft, margin:'12px -24px -34px', padding:'8px 4px 18px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 6 }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
              <div key={i} style={{
                height: 44, display:'flex', alignItems:'center', justifyContent:'center',
                background: k ? T.card : 'transparent', borderRadius: 8,
                fontFamily:'var(--sans)', fontSize: 22, fontWeight: 400, color: T.ink,
                boxShadow: k && k !== '⌫' ? '0 1px 0 rgba(0,0,0,0.15)' : 'none',
              }}>{k}</div>
            ))}
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── 3. SMS 인증번호 입력 ────────────────────────────────────
function Tr_OnbSms() {
  const digits = ['8','3','7','','',''];
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column', padding:'0 24px' }}>
        <TSF/>

        <div style={{ display:'flex', alignItems:'center', marginTop: 4, marginLeft: -8 }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(22)}</div>
        </div>

        <div style={{ marginTop: 4, display:'flex', gap: 4 }}>
          {[1, 1, 0, 0].map((on, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: on ? T.primaryInk : T.line }}/>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 24, fontWeight: 800, color: T.ink, letterSpacing: -0.5 }}>
            받으신 인증번호를<br/>입력해주세요
          </div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 500, color: T.ink2, marginTop: 10 }}>
            +82 010-1234-5678 으로 보냈어요 · <span style={{ color: T.peachInk, fontWeight: 700 }}>번호 변경</span>
          </div>
        </div>

        <div style={{ marginTop: 32, display:'flex', gap: 8 }}>
          {digits.map((d, i) => (
            <div key={i} style={{
              flex: 1, height: 60, background: T.card, borderRadius: 14,
              boxShadow: CARD_SHADOW, display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--sans)', fontSize: 26, fontWeight: 800, color: T.ink,
              border: i === 3 ? `2px solid ${T.primaryInk}` : `2px solid transparent`,
              position:'relative',
            }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, textAlign:'center' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize: 13, fontWeight: 600, color: T.ink2 }}>
            남은 시간 02:48
          </span>
          <span style={{ margin:'0 12px', color: T.ink3 }}>·</span>
          <span style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.peachInk }}>
            인증번호 다시 받기
          </span>
        </div>

        <div style={{ marginTop:'auto', paddingBottom: 12 }}>
          <PrimaryBtn>다음</PrimaryBtn>
        </div>

        <div style={{ background: T.bgSoft, margin:'12px -24px -34px', padding:'8px 4px 18px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 6 }}>
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
              <div key={i} style={{
                height: 44, display:'flex', alignItems:'center', justifyContent:'center',
                background: k ? T.card : 'transparent', borderRadius: 8,
                fontFamily:'var(--sans)', fontSize: 22, fontWeight: 400, color: T.ink,
                boxShadow: k && k !== '⌫' ? '0 1px 0 rgba(0,0,0,0.15)' : 'none',
              }}>{k}</div>
            ))}
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── 4. PIN 6자리 설정 ───────────────────────────────────────
function Tr_OnbPinSet() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column', padding:'0 24px' }}>
        <TSF/>

        <div style={{ display:'flex', alignItems:'center', marginTop: 4, marginLeft: -8 }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(22)}</div>
        </div>

        <div style={{ marginTop: 4, display:'flex', gap: 4 }}>
          {[1, 1, 1, 0].map((on, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: on ? T.primaryInk : T.line }}/>
          ))}
        </div>

        <div style={{ marginTop: 28, textAlign:'center' }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>
            앱 잠금용 PIN 설정
          </div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 8 }}>
            한 번 더 입력해 확인해주세요
          </div>
        </div>

        <div style={{ marginTop: 36, display:'flex', flexDirection:'column', gap: 22 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
            <div style={{ flex:'0 0 64px', fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink2 }}>1차 입력</div>
            <div style={{ flex: 1, display:'flex', justifyContent:'center', alignItems:'center', gap: 8 }}>
              {[1,1,1,1,1,1].map((_, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: T.mintInk, opacity: 0.45 }}/>
              ))}
              <div style={{ marginLeft: 8, color: T.mintInk, fontSize: 14, fontWeight: 700 }}>✓</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
            <div style={{ flex:'0 0 64px', fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink }}>2차 확인</div>
            <div style={{ flex: 1, display:'flex', justifyContent:'center' }}>
              <PinDots length={4}/>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 26, padding:'12px 14px', background: T.bgSoft, borderRadius: 14,
          fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, lineHeight: 1.55,
        }}>
          쉽게 추측 가능한 번호는 피해주세요 (생년월일·연속된 숫자 등). PIN은 기기 안에서만 안전하게 저장돼요.
        </div>

        <div style={{ marginTop:'auto', paddingBottom: 30 }}>
          <NumPad onDigit={()=>{}} onDelete={()=>{}} onBio={()=>{}}/>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── 5. 생체인식 등록 다이얼로그 ──────────────────────────────
function Tr_OnbBio() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative', overflow:'hidden' }}>
        <TSF/>

        <div style={{ filter:'blur(2px)', opacity: 0.6, padding:'0 20px', pointerEvents:'none' }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink }}>지윤님, 안녕하세요</div>
          <div style={{ marginTop: 20, height: 180, background: T.bgSoft, borderRadius: 24 }}/>
          <div style={{ marginTop: 14, height: 120, background: T.bgSoft, borderRadius: 24 }}/>
        </div>

        <div style={{ position:'absolute', inset: 0, background:'rgba(20,16,8,0.45)', backdropFilter:'blur(8px)' }}/>

        <div style={{
          position:'absolute', left: 24, right: 24, top: '50%', transform:'translateY(-50%)',
          background: T.card, borderRadius: 26, padding: '28px 22px 18px',
          boxShadow:'0 30px 60px rgba(0,0,0,0.25)', textAlign:'center',
        }}>
          <div style={{
            width: 78, height: 78, borderRadius: 22, background: T.bgSoft,
            display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px',
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke={T.ink} strokeWidth="1.8"/>
              <path d="M8 3.5V6M16 3.5V6M3.5 8h2.5M18 8h2.5M3.5 16h2.5M18 16h2.5M8 20.5V18M16 20.5V18" stroke={T.ink} strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="9.5" cy="11" r="0.8" fill={T.ink}/>
              <circle cx="14.5" cy="11" r="0.8" fill={T.ink}/>
              <path d="M12 11v3l-1 0.5" stroke={T.ink} strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M9 15c0.8 0.8 1.8 1.2 3 1.2s2.2-0.4 3-1.2" stroke={T.ink} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>

          <div style={{ fontFamily:'var(--sans)', fontSize: 18, fontWeight: 800, color: T.ink, letterSpacing: -0.3 }}>
            Face ID로 빠르게 로그인할까요?
          </div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 8, lineHeight: 1.5 }}>
            다음부터 PIN 입력 없이<br/>한 번에 잠금을 풀 수 있어요
          </div>

          <div style={{ marginTop: 22, display:'flex', flexDirection:'column', gap: 8 }}>
            <PrimaryBtn>Face ID 등록하기</PrimaryBtn>
            <button style={{
              background:'transparent', border:'none',
              fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600, color: T.ink2,
              cursor:'pointer', padding: 10,
            }}>나중에 설정에서</button>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── 6. PIN 재설정 (잠금 해제 후) ─────────────────────────────
function Tr_PinReset() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column', padding:'0 24px' }}>
        <TSF/>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 4 }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center', marginLeft: -8 }}>{I.close(22)}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>PIN 재설정</div>
          <div style={{ width: 40 }}/>
        </div>

        <div style={{
          marginTop: 18, background: T.mint, color: T.mintInk, borderRadius: 14,
          padding:'10px 14px', display:'flex', alignItems:'center', gap: 10,
          fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={T.mintInk} strokeWidth="2"/>
            <path d="M7 12l4 4 6-7" stroke={T.mintInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          본인 확인 완료 (SMS 인증)
        </div>

        <div style={{ marginTop: 26, textAlign:'center' }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 20, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>
            새 PIN 6자리를 입력해주세요
          </div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 8 }}>
            이전 PIN은 더 이상 사용할 수 없어요
          </div>
        </div>

        <div style={{ marginTop: 36 }}>
          <PinDots length={2}/>
        </div>

        <div style={{ marginTop:'auto', paddingBottom: 12, display:'flex', justifyContent:'center', gap: 22, fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2 }}>
          <span>건너뛰기</span>
          <span style={{ color: T.line }}>|</span>
          <span style={{ color: T.peachInk, fontWeight: 700 }}>도움말</span>
        </div>

        <div style={{ paddingBottom: 30 }}>
          <NumPad onDigit={()=>{}} onDelete={()=>{}} onBio={()=>{}}/>
        </div>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { Tr_OnbConsent, Tr_OnbPhone, Tr_OnbSms, Tr_OnbPinSet, Tr_OnbBio, Tr_PinReset });
