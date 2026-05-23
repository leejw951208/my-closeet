// ─────────────────────────────────────────────────────────────
// MVP 보강 화면들 — 기존 trendy.jsx 화면들에 더해 MVP 스펙에
// 명시되어 있지만 빠져 있던 화면을 추가한다.
//
//   • Tr_ClosetEmpty — 옷장 0벌 빈 상태 (2. 홈 · 빈 옷장)
//   • Tr_AddAI       — AI 분류 결과·수정 화면 (3. 옷 등록)
//   • Tr_Share       — OOTD 공유 미리보기 (7. 공유)
//
// 모든 화면은 trendy.jsx의 T / I / Chip / PrimaryBtn / GhostBtn /
// TSF / TTabs / Garment 를 재사용한다.
// ─────────────────────────────────────────────────────────────

// ─── B′ · 빈 옷장 상태 (0벌) ──────────────────────────────────
function Tr_ClosetEmpty() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative' }}>
        <TSF/>

        <div style={{ padding:'8px 20px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>
              지윤님, 환영해요
            </div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 500, color: T.ink2, marginTop: 4 }}>
              먼저 옷장에 옷을 한 벌 넣어볼까요?
            </div>
          </div>
          <div style={{
            width: 40, height: 40, background: T.card, borderRadius: 20,
            display:'flex', alignItems:'center', justifyContent:'center', boxShadow: CARD_SHADOW,
          }}>{I.bell(20, T.ink)}</div>
        </div>

        {/* Illustration — empty hanger-rail card */}
        <div style={{ padding:'4px 20px 20px' }}>
          <div style={{
            background: T.card, borderRadius: 28, padding: '32px 22px 28px',
            boxShadow: CARD_SHADOW, position:'relative', overflow:'hidden',
          }}>
            {/* Soft confetti dots */}
            {[
              { l: 14, t: 22, s: 8,  c: T.peach },
              { l: 86, t: 14, s: 6,  c: T.blue },
              { l: 90, t: 60, s: 10, c: T.mint },
              { l:  6, t: 70, s: 7,  c: T.lavender },
              { l: 50, t: 8,  s: 5,  c: T.peachDeep },
            ].map((d, i) => (
              <div key={i} style={{
                position:'absolute', left:`${d.l}%`, top:`${d.t}%`,
                width: d.s, height: d.s, borderRadius: d.s, background: d.c,
              }}/>
            ))}

            {/* Closet rail with 3 empty hangers */}
            <div style={{ position:'relative', height: 180, display:'flex', justifyContent:'center', alignItems:'flex-start', paddingTop: 14 }}>
              <svg width="240" height="170" viewBox="0 0 240 170" fill="none">
                {/* rail */}
                <path d="M20 28 H220" stroke={T.ink3} strokeWidth="2.4" strokeLinecap="round"/>
                <circle cx="20" cy="28" r="3.5" fill={T.ink3}/>
                <circle cx="220" cy="28" r="3.5" fill={T.ink3}/>

                {/* hanger 1 */}
                <g stroke={T.peachInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M60 28 V18 a6 6 0 1 1 6 6"/>
                  <path d="M60 30 L42 60 L82 60 Z"/>
                </g>
                {/* hanger 2 — tilted with tag */}
                <g stroke={T.blueInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M120 28 V18 a6 6 0 1 1 6 6"/>
                  <path d="M118 30 L100 64 L142 64 Z"/>
                </g>
                {/* hanger 3 */}
                <g stroke={T.mintInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M180 28 V18 a6 6 0 1 1 6 6"/>
                  <path d="M180 30 L162 60 L202 60 Z"/>
                </g>

                {/* floor shadow */}
                <ellipse cx="120" cy="146" rx="80" ry="6" fill={T.bgSoft}/>
              </svg>
            </div>

            <div style={{ textAlign:'center', marginTop: 4 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 17, fontWeight: 800, color: T.ink, letterSpacing: -0.3 }}>
                옷장이 비어있어요
              </div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 6, lineHeight: 1.55 }}>
                자주 입는 옷부터 한 벌씩 등록해보세요.<br/>사진을 찍으면 AI가 자동으로 분류해줘요.
              </div>
            </div>
          </div>
        </div>

        {/* 3-step onboarding hint */}
        <div style={{ padding:'0 20px' }}>
          <div style={{ background: T.card, borderRadius: 20, padding: 4, boxShadow: CARD_SHADOW }}>
            {[
              { n: '01', t: '사진 찍기',          d: '카메라 또는 앨범에서' },
              { n: '02', t: 'AI 분류 확인',       d: '카테고리·색상 1탭 수정' },
              { n: '03', t: '코디 만들기',        d: '4슬롯에 드래그' },
            ].map((s, i, arr) => (
              <div key={s.n} style={{
                display:'flex', alignItems:'center', gap: 12, padding: '12px 14px',
                borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 16, background: T.bgSoft,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--mono)', fontSize: 11, fontWeight: 600, color: T.ink2,
                }}>{s.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 700, color: T.ink }}>{s.t}</div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, marginTop: 1 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ position:'absolute', left: 0, right: 0, bottom: 90, padding: '0 20px' }}>
          <PrimaryBtn>
            <span style={{ display:'inline-flex', alignItems:'center', gap: 8 }}>
              {I.camera(20, T.primaryInk)}첫 옷 등록하기
            </span>
          </PrimaryBtn>
          <div style={{ textAlign:'center', marginTop: 10 }}>
            <span style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2 }}>
              앨범에서 한꺼번에 <span style={{ color: T.peachInk, fontWeight: 700 }}>최대 20장</span> 선택할 수도 있어요
            </span>
          </div>
        </div>

        <TTabs active="home"/>
      </div>
    </IOSDevice>
  );
}

// ─── E′ · AI 분류 결과·수정 화면 ──────────────────────────────
function Tr_AddAI() {
  const it = byId('i01'); // 후디 후보를 AI가 분류했다고 가정
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column' }}>
        <TSF/>

        {/* Header */}
        <div style={{ padding:'8px 12px 4px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(22)}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>분류 확인</div>
          <button style={{
            border:'none', background:'transparent', fontFamily:'var(--sans)',
            fontSize: 14, fontWeight: 700, color: T.peachInk, cursor:'pointer', padding:'0 12px',
          }}>저장</button>
        </div>

        {/* Progress (2/2) */}
        <div style={{ padding:'4px 20px 8px', display:'flex', alignItems:'center', gap: 8 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: T.bgSoft, overflow:'hidden' }}>
            <div style={{ width:'100%', height:'100%', background: T.primaryInk }}/>
          </div>
          <span style={{ fontFamily:'var(--mono)', fontSize: 11, fontWeight: 600, color: T.ink2 }}>2 / 2</span>
        </div>

        <div className="scroller" style={{ flex: 1, overflowY:'auto', padding:'4px 20px 30px' }}>
          {/* AI badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap: 6,
            background: T.lavender, color: T.lavenderInk, borderRadius: 14,
            padding:'5px 12px', fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, marginBottom: 12,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill={T.lavenderInk}/>
            </svg>
            AI가 자동으로 채워봤어요 · 1탭으로 수정 가능
          </div>

          {/* Photo + suggestion */}
          <div style={{
            display:'grid', gridTemplateColumns:'132px 1fr', gap: 14,
            background: T.card, borderRadius: 20, padding: 14, boxShadow: CARD_SHADOW,
          }}>
            <div style={{ aspectRatio:'3/4', borderRadius: 14, overflow:'hidden', background: it.tone, position:'relative' }}>
              <div style={{
                position:'absolute', inset: 0, opacity: 0.05,
                backgroundImage:`repeating-linear-gradient(135deg, transparent 0 7px, ${it.tag} 7px 7.5px)`,
              }}/>
              <div style={{
                position:'absolute', top: 6, left: 6, background:'rgba(255,255,255,0.92)',
                padding:'3px 8px', borderRadius: 10,
                fontFamily:'var(--sans)', fontSize: 10, fontWeight: 700, color: T.ink,
              }}>예측 신뢰도 92%</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', gap: 10 }}>
              <div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 4 }}>이름 (추정)</div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 16, fontWeight: 800, color: T.ink, letterSpacing: -0.3 }}>오버사이즈 후디</div>
              </div>
              <button style={{
                background:'transparent', border:`1px solid ${T.line}`, borderRadius: 14,
                padding:'8px 12px', fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2, cursor:'pointer',
                display:'inline-flex', alignItems:'center', gap: 6, alignSelf:'flex-start',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" stroke={T.ink2} strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
                이름 수정
              </button>
            </div>
          </div>

          {/* Category */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 8 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink }}>카테고리</div>
              <span style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.lavenderInk }}>AI 추천: 상의</span>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
              {CATS.slice(1).map(c => (
                <Chip key={c.id} active={c.id==='TOP'} color="blue">{c.ko}</Chip>
              ))}
            </div>
          </div>

          {/* Color */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 8 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink }}>색상</div>
              <span style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.lavenderInk }}>AI 추천: 오트</span>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 8 }}>
              {[
                { c:'#E4DCC9', l:'오트',     ink:'#5A4F38', on: true },
                { c:'#1A1A18', l:'블랙',     ink:'#FFFFFF' },
                { c:'#FFFFFF', l:'화이트',   ink:'#1A1A18' },
                { c:'#D9B5A0', l:'테라코타', ink:'#5C2E1A' },
                { c:'#C8D1B5', l:'세이지',   ink:'#3D6E50' },
                { c:'#8FA4BD', l:'인디고',   ink:'#FFFFFF' },
              ].map(s => (
                <div key={s.l} style={{
                  display:'inline-flex', alignItems:'center', gap: 6, height: 36,
                  padding:'0 12px 0 6px', borderRadius: 18,
                  background: s.on ? T.card : T.card,
                  boxShadow: s.on ? `inset 0 0 0 2px ${T.primaryInk}` : `inset 0 0 0 1px ${T.line}`,
                  fontFamily:'var(--sans)', fontSize: 12, fontWeight: s.on ? 700 : 500, color: T.ink,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 11, background: s.c,
                    boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.08)',
                  }}/>
                  {s.l}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>태그</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
              {['#오버핏','#스트릿','#가을·겨울'].map(t => <Chip key={t} active>{t}</Chip>)}
              <Chip>+ 추가</Chip>
            </div>
          </div>

          {/* Helper */}
          <div style={{
            marginTop: 22, padding:'12px 14px', background: T.bgSoft, borderRadius: 14,
            display:'flex', gap: 10, alignItems:'flex-start',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: T.peachDeep, marginTop: 6, flexShrink: 0 }}/>
            <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, lineHeight: 1.55 }}>
              잘못된 분류는 다음 옷부터 더 정확해져요. <strong style={{ color: T.ink, fontWeight: 700 }}>저장</strong>을 눌러 옷장에 추가하세요.
            </div>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── J · OOTD 공유 미리보기 ───────────────────────────────────
function Tr_Share() {
  const items = ['i01','i07','i11','i12'].map(byId);
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bgSoft, display:'flex', flexDirection:'column' }}>
        <TSF/>

        {/* Header */}
        <div style={{ padding:'8px 12px 6px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.close(22)}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>OOTD 공유</div>
          <div style={{ width: 40 }}/>
        </div>

        {/* Aspect format pills */}
        <div style={{ padding:'2px 20px 14px', display:'flex', gap: 6, justifyContent:'center' }}>
          {[
            { l:'1:1',  on: false },
            { l:'4:5',  on: true },
            { l:'9:16', on: false },
          ].map(p => (
            <div key={p.l} style={{
              padding:'6px 14px', borderRadius: 14,
              background: p.on ? T.ink : T.card, color: p.on ? T.card : T.ink2,
              fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700,
              boxShadow: p.on ? 'none' : `inset 0 0 0 1px ${T.line}`,
            }}>{p.l}</div>
          ))}
        </div>

        {/* Composed share card */}
        <div style={{ flex: 1, padding:'0 24px 14px', display:'flex', justifyContent:'center', overflow:'hidden' }}>
          <div style={{
            width:'100%', aspectRatio:'4/5', background: T.card, borderRadius: 22,
            boxShadow: ELEVATE_SHADOW, padding: 18, display:'flex', flexDirection:'column',
            position:'relative', overflow:'hidden',
          }}>
            {/* Top meta */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink3, letterSpacing: 0.6, textTransform:'uppercase' }}>
                  OOTD · MAY 18
                </div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 17, fontWeight: 800, color: T.ink, marginTop: 4, letterSpacing: -0.3 }}>
                  비 오는 화요일 ☔
                </div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 2, display:'inline-flex', alignItems:'center', gap: 4 }}>
                  <WeatherGlyph kind="rain" size={11} color={T.ink2}/> 14° · 마포구
                </div>
              </div>
              <div style={{
                background: T.peach, color: T.peachInk, padding:'4px 10px', borderRadius: 12,
                fontFamily:'var(--sans)', fontSize: 10, fontWeight: 700,
              }}>지윤</div>
            </div>

            {/* Mannequin / flat-lay 2x2 */}
            <div style={{
              marginTop: 14, flex: 1, position:'relative',
              background: T.bgSoft, borderRadius: 16, padding: 18, overflow:'hidden',
            }}>
              {/* soft shadow disc */}
              <div style={{
                position:'absolute', left:'10%', right:'10%', bottom: 10, height: 14,
                borderRadius: 14, background:'rgba(0,0,0,0.06)', filter:'blur(8px)',
              }}/>
              <div style={{ position:'relative', height:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap: 10 }}>
                {items.map((it, i) => {
                  if (!it) return <div key={i}/>;
                  const labels = ['TOP','BOTTOM','SHOES','ACC'];
                  return (
                    <div key={it.id} style={{
                      position:'relative', borderRadius: 12, background: it.tone, overflow:'hidden',
                      boxShadow:'0 1px 6px rgba(40,32,20,0.06)',
                    }}>
                      <div style={{
                        position:'absolute', inset:0, opacity: 0.06,
                        backgroundImage:`repeating-linear-gradient(135deg, transparent 0 6px, ${it.tag} 6px 6.5px)`,
                      }}/>
                      <div style={{
                        position:'absolute', top: 6, left: 6,
                        fontFamily:'var(--mono)', fontSize: 9, fontWeight: 600,
                        color: T.ink2, background:'rgba(255,255,255,0.85)',
                        padding:'2px 6px', borderRadius: 8,
                      }}>{labels[i]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Item credits */}
            <div style={{ marginTop: 12, display:'flex', flexDirection:'column', gap: 3 }}>
              {items.slice(0,3).map(it => it && (
                <div key={it.id} style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--sans)', fontSize: 10, fontWeight: 600, color: T.ink2 }}>
                  <span>{it.ko}</span>
                  <span style={{ color: T.ink3 }}>{it.brand}</span>
                </div>
              ))}
            </div>

            {/* Footer — watermark + QR */}
            <div style={{
              marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.line}`,
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 7, background: T.primary,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6.5a2 2 0 11.5-3.9c.5.1.5.5.5.9v2" stroke={T.primaryInk} strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 8l-9 5.5c-.5.3-.7.5-.7 1 0 .8.5 1.5 1.5 1.5h16.4c1 0 1.5-.7 1.5-1.5 0-.5-.2-.7-.7-1L12 8z" stroke={T.primaryInk} strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 800, color: T.ink, letterSpacing: -0.2 }}>My Closets</div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 9, fontWeight: 500, color: T.ink3 }}>mycloset.app/u/jiyun</div>
                </div>
              </div>
              {/* QR */}
              <div style={{ width: 38, height: 38, padding: 3, borderRadius: 6, background: T.card, boxShadow: `inset 0 0 0 1px ${T.line}` }}>
                <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gridTemplateRows:'repeat(7, 1fr)', gap: 0 }}>
                  {[
                    1,1,1,0,1,1,1,
                    1,0,1,0,1,0,1,
                    1,1,1,1,1,1,1,
                    0,1,0,1,0,1,0,
                    1,1,1,0,1,1,1,
                    1,0,1,1,0,0,1,
                    1,1,1,0,1,1,1,
                  ].map((b, i) => (
                    <div key={i} style={{ background: b ? T.ink : 'transparent' }}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share targets */}
        <div style={{ padding:'0 20px 6px' }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink3, textTransform:'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
            보낼 곳
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 6 }}>
            {[
              { l:'스토리',   c: T.peach,    ink: T.peachInk,    g:'IG' },
              { l:'카톡',     c: '#F7E36A',  ink:'#5E4A00',      g:'K' },
              { l:'X',        c: T.ink,      ink: T.card,        g:'X' },
              { l:'사진 저장', c: T.blue,    ink: T.blueInk,     g:'↓'},
              { l:'더보기',   c: T.bgSoft,   ink: T.ink2,        g:'…'},
            ].map(s => (
              <div key={s.l} style={{ textAlign:'center' }}>
                <div style={{
                  width:'100%', aspectRatio:'1', borderRadius: 18, background: s.c, color: s.ink,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--sans)', fontSize: 16, fontWeight: 800,
                }}>{s.g}</div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink, marginTop: 6 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ padding:'12px 20px 22px' }}>
          <PrimaryBtn>이미지 내보내기</PrimaryBtn>
        </div>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { Tr_ClosetEmpty, Tr_AddAI, Tr_Share });
