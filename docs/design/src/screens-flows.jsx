// ─────────────────────────────────────────────────────────────
// 옷 등록 + 코디 + 캘린더 플로우 — MVP §3, §5, §6
//
// 옷 등록 (§3):
//   • Tr_AddSheet     — 카메라/갤러리 선택 시트
//   • Tr_AddCapture   — 촬영 화면 (가이드 프레임)
//   • Tr_AddMulti     — 멀티 선택 (갤러리, 최대 20장)
//   • Tr_AddBatch     — 배치 업로드 진행 화면
//
// 코디 (§5):
//   • Tr_BuildShuffle — 코디 셔플 결과 화면
//   • Tr_OutfitList   — 저장된 코디 목록
//   • Tr_OutfitDetail — 코디 상세
//
// 캘린더 (§6):
//   • Tr_DayDetail    — 날짜 상세 + "오늘 입기" 기록
// ─────────────────────────────────────────────────────────────

// ─── §3 · 카메라/갤러리 선택 시트 ─────────────────────────────
function Tr_AddSheet() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative', overflow:'hidden' }}>
        <TSF/>

        {/* Blurred Home backdrop */}
        <div style={{ filter:'blur(3px)', opacity: 0.55, padding:'0 20px', pointerEvents:'none' }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink }}>지윤님, 안녕하세요</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, marginTop: 20 }}>
            <div style={{ aspectRatio:'1/1', background: T.bgSoft, borderRadius: 24 }}/>
            <div style={{ aspectRatio:'1/1', background: T.bgSoft, borderRadius: 24 }}/>
          </div>
        </div>

        {/* Scrim */}
        <div style={{ position:'absolute', inset: 0, background:'rgba(20,16,8,0.32)' }}/>

        {/* Bottom sheet */}
        <div style={{
          position:'absolute', left: 0, right: 0, bottom: 0,
          background: T.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding:'14px 20px 30px',
          boxShadow:'0 -8px 30px rgba(0,0,0,0.18)',
        }}>
          {/* Drag handle */}
          <div style={{ width: 44, height: 5, borderRadius: 3, background: T.line, margin:'0 auto 14px' }}/>

          <div style={{ textAlign:'center', marginBottom: 4 }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 17, fontWeight: 800, color: T.ink }}>옷 추가하기</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, marginTop: 4 }}>
              어떻게 등록할까요?
            </div>
          </div>

          {/* Big choice tiles */}
          <div style={{ marginTop: 16, display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
            <div style={{
              background: T.peach, borderRadius: 20, padding: 16, color: T.peachInk,
              display:'flex', flexDirection:'column', gap: 6,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background:'rgba(255,255,255,0.55)',
                display:'flex', alignItems:'center', justifyContent:'center', marginBottom: 4,
              }}>{I.camera(22, T.peachInk)}</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>카메라로<br/>한 벌 찍기</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, opacity: 0.8 }}>가이드 프레임 안에 놓고</div>
            </div>
            <div style={{
              background: T.blue, borderRadius: 20, padding: 16, color: T.blueInk,
              display:'flex', flexDirection:'column', gap: 6,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background:'rgba(255,255,255,0.6)',
                display:'flex', alignItems:'center', justifyContent:'center', marginBottom: 4,
              }}>{I.album(22, T.blueInk)}</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>앨범에서<br/>한꺼번에</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, opacity: 0.8 }}>최대 20장 선택 가능</div>
            </div>
          </div>

          {/* Recents — small list */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700, color: T.ink3, textTransform:'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
              최근 앨범
            </div>
            <div style={{ display:'flex', gap: 8, overflowX:'auto' }} className="scroller">
              {CLOSET.slice(0, 8).map(it => (
                <div key={it.id} style={{
                  flex:'0 0 auto', width: 62, height: 62, borderRadius: 12,
                  background: it.tone, position:'relative', overflow:'hidden',
                }}>
                  <div style={{
                    position:'absolute', inset: 0, opacity: 0.06,
                    backgroundImage:`repeating-linear-gradient(135deg, transparent 0 6px, ${it.tag} 6px 6.5px)`,
                  }}/>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, textAlign:'center' }}>
            <span style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600, color: T.ink2 }}>취소</span>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── §3 · 촬영 화면 (가이드 프레임) ──────────────────────────
function Tr_AddCapture() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background:'#171410', position:'relative', color: T.card }}>
        <TSF/>

        {/* Top controls */}
        <div style={{
          position:'absolute', top: 54, left: 0, right: 0, padding:'12px 16px',
          display:'flex', justifyContent:'space-between', alignItems:'center', zIndex: 2,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 19, background:'rgba(255,255,255,0.12)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>{I.close(20, '#fff')}</div>
          <div style={{
            padding:'6px 14px', borderRadius: 14, background:'rgba(255,255,255,0.12)',
            fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700, color:'#fff',
          }}>
            한 벌만 잡아주세요
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: 19, background:'rgba(255,255,255,0.12)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {/* flash icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Camera viewport with guide frame */}
        <div style={{ position:'absolute', inset:'54px 0 0 0', overflow:'hidden' }}>
          {/* faux camera scene — soft gradient + faux fabric */}
          <div style={{
            position:'absolute', inset: 0,
            background:'radial-gradient(circle at 50% 40%, #2a2520 0%, #15110d 70%)',
          }}/>

          {/* faux garment silhouette */}
          <div style={{
            position:'absolute', left:'18%', right:'18%', top:'22%', bottom:'30%',
            background: 'linear-gradient(180deg, #C8D1B5 0%, #97A98C 100%)',
            borderRadius: 36, opacity: 0.85,
            boxShadow:'0 30px 60px rgba(0,0,0,0.55)',
          }}/>

          {/* Dim outside the guide */}
          <div style={{
            position:'absolute', inset: 0,
            background:'radial-gradient(rgba(0,0,0,0) 38%, rgba(0,0,0,0.55) 70%)',
          }}/>

          {/* Guide frame corners */}
          {[
            { l: '10%', t: '14%' }, { r: '10%', t: '14%' },
            { l: '10%', b: '24%' }, { r: '10%', b: '24%' },
          ].map((p, i) => {
            const isTop = p.t !== undefined;
            const isLeft = p.l !== undefined;
            return (
              <div key={i} style={{
                position:'absolute',
                ...(p.l !== undefined ? { left: p.l } : { right: p.r }),
                ...(p.t !== undefined ? { top: p.t } : { bottom: p.b }),
                width: 28, height: 28,
                borderTop:    isTop  ? `3px solid ${T.primary}` : 'none',
                borderBottom: !isTop ? `3px solid ${T.primary}` : 'none',
                borderLeft:   isLeft ? `3px solid ${T.primary}` : 'none',
                borderRight:  !isLeft ? `3px solid ${T.primary}` : 'none',
                borderTopLeftRadius:     isTop && isLeft   ? 8 : 0,
                borderTopRightRadius:    isTop && !isLeft  ? 8 : 0,
                borderBottomLeftRadius:  !isTop && isLeft  ? 8 : 0,
                borderBottomRightRadius: !isTop && !isLeft ? 8 : 0,
              }}/>
            );
          })}

          {/* Hint */}
          <div style={{
            position:'absolute', left: 0, right: 0, top:'14%', textAlign:'center',
          }}>
            <div style={{
              display:'inline-block', padding:'5px 12px', borderRadius: 12,
              background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)',
              fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color:'#fff',
            }}>
              밝은 배경 · 옷 한 벌이 가장 잘 나와요
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div style={{
          position:'absolute', left: 0, right: 0, bottom: 0,
          padding:'14px 20px 30px',
          background:'linear-gradient(0deg, #0c0a06 60%, rgba(12,10,6,0))',
          display:'flex', alignItems:'center', justifyContent:'space-between', zIndex: 2,
        }}>
          {/* Last shot thumbnail */}
          <div style={{ width: 50, height: 50, borderRadius: 12, background: T.peach, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset: 0, opacity: 0.1, backgroundImage:`repeating-linear-gradient(135deg, transparent 0 6px, ${T.ink} 6px 6.5px)` }}/>
            <div style={{ position:'absolute', bottom: 2, right: 2, background:'#fff', color: T.ink, fontFamily:'var(--sans)', fontSize: 9, fontWeight: 700, borderRadius: 8, padding:'1px 5px' }}>3</div>
          </div>

          {/* Shutter */}
          <div style={{
            width: 72, height: 72, borderRadius: 36, background:'#fff',
            border:`4px solid rgba(255,255,255,0.35)`, padding: 4,
          }}>
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', background: T.primary }}/>
          </div>

          {/* Mode toggle */}
          <div style={{
            width: 50, height: 50, borderRadius: 25, background:'rgba(255,255,255,0.12)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h3l2-3h6l2 3h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" stroke="#fff" strokeWidth="1.7"/>
              <path d="M7 13l5 5 5-9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Mode pills */}
        <div style={{
          position:'absolute', left: 0, right: 0, bottom: 122, display:'flex', justifyContent:'center', gap: 18,
          fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700, color:'rgba(255,255,255,0.55)',
        }}>
          <span>앨범</span>
          <span style={{ color:'#fff', borderBottom:`2px solid ${T.primary}`, paddingBottom: 4 }}>한 벌</span>
          <span>여러 벌</span>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── §3 · 멀티 선택 (갤러리) ─────────────────────────────────
function Tr_AddMulti() {
  // 6x7 grid; mark some as selected with order numbers
  const selected = { 0: 1, 1: 2, 5: 3, 8: 4, 12: 5, 17: 6, 20: 7, 24: 8 };
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column' }}>
        <TSF/>

        {/* Header */}
        <div style={{ padding:'8px 12px 8px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 4 }}>
            <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.close(22)}</div>
            <div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 800, color: T.ink }}>최근 항목 ▾</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2 }}>최대 20장 선택</div>
            </div>
          </div>
          <button style={{
            border:'none', background: T.primary, color: T.primaryInk,
            fontFamily:'var(--sans)', fontSize: 13, fontWeight: 800, padding:'8px 16px',
            borderRadius: 16, cursor:'pointer',
          }}>다음 ({Object.keys(selected).length})</button>
        </div>

        {/* Selection counter pill */}
        <div style={{ padding:'0 20px 10px' }}>
          <div style={{
            background: T.bgSoft, borderRadius: 12, padding:'10px 14px',
            display:'flex', alignItems:'center', gap: 10,
            fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2,
          }}>
            <div style={{ flex: 1, height: 4, background: T.line, borderRadius: 2, overflow:'hidden' }}>
              <div style={{ width:'40%', height:'100%', background: T.primaryInk }}/>
            </div>
            <span><strong style={{ color: T.ink }}>8</strong> / 20</span>
          </div>
        </div>

        {/* Grid */}
        <div className="scroller" style={{ flex: 1, overflowY:'auto', padding:'0 2px 12px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 2 }}>
            {Array.from({ length: 27 }).map((_, i) => {
              const it = CLOSET[i % CLOSET.length];
              const sel = selected[i];
              return (
                <div key={i} style={{
                  position:'relative', aspectRatio:'1/1', background: it.tone, overflow:'hidden',
                }}>
                  <div style={{
                    position:'absolute', inset: 0, opacity: 0.06,
                    backgroundImage:`repeating-linear-gradient(135deg, transparent 0 6px, ${it.tag} 6px 6.5px)`,
                  }}/>
                  {sel && (
                    <div style={{ position:'absolute', inset: 0, background:'rgba(122,65,25,0.18)' }}/>
                  )}
                  <div style={{
                    position:'absolute', top: 6, right: 6,
                    width: 22, height: 22, borderRadius: 11,
                    background: sel ? T.peachInk : 'rgba(255,255,255,0.35)',
                    border: sel ? 'none' : '1.5px solid rgba(255,255,255,0.9)',
                    color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--sans)', fontSize: 11, fontWeight: 800,
                  }}>{sel || ''}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom strip of selected previews */}
        <div style={{
          padding:'10px 16px 28px', background: T.bgSoft,
          display:'flex', gap: 8, overflowX:'auto',
        }} className="scroller">
          {Object.entries(selected).sort((a,b)=>a[1]-b[1]).map(([k, n]) => {
            const it = CLOSET[parseInt(k) % CLOSET.length];
            return (
              <div key={k} style={{ position:'relative', flex:'0 0 auto', width: 56, height: 56, borderRadius: 10, background: it.tone, overflow:'hidden' }}>
                <div style={{ position:'absolute', inset: 0, opacity: 0.06, backgroundImage:`repeating-linear-gradient(135deg, transparent 0 6px, ${it.tag} 6px 6.5px)` }}/>
                <div style={{
                  position:'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 8,
                  background: T.peachInk, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--sans)', fontSize: 9, fontWeight: 800,
                }}>{n}</div>
              </div>
            );
          })}
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── §3 · 배치 업로드 진행 ───────────────────────────────────
function Tr_AddBatch() {
  // 8장 중 5장 완료, 2장 진행/대기
  const items = [
    { i: 0, s: 'done',  cat:'상의'   },
    { i: 1, s: 'done',  cat:'하의'   },
    { i: 2, s: 'done',  cat:'신발'   },
    { i: 3, s: 'done',  cat:'잡화'   },
    { i: 4, s: 'done',  cat:'상의'   },
    { i: 5, s: 'doing', cat:'AI 분석 중...' },
    { i: 6, s: 'queue', cat:'대기'   },
    { i: 7, s: 'queue', cat:'대기'   },
  ];
  const done = items.filter(x => x.s === 'done').length;
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column' }}>
        <TSF/>

        {/* Header */}
        <div style={{ padding:'8px 12px 6px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(22)}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>일괄 등록</div>
          <button style={{ border:'none', background:'transparent', fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600, color: T.ink2, cursor:'pointer', padding:'0 12px' }}>백그라운드</button>
        </div>

        {/* Big progress card */}
        <div style={{ padding:'10px 20px 16px' }}>
          <div style={{
            background: T.card, borderRadius: 24, padding:'20px 18px', boxShadow: CARD_SHADOW,
          }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink2 }}>업로드 진행 중</div>
              <div style={{ fontFamily:'var(--mono)', fontSize: 12, fontWeight: 600, color: T.ink2 }}>약 30초 남음</div>
            </div>
            <div style={{ marginTop: 8, display:'flex', alignItems:'baseline', gap: 8 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 36, fontWeight: 800, color: T.ink, letterSpacing: -1.2 }}>{done}</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 16, fontWeight: 600, color: T.ink2 }}>/ {items.length}장 완료</div>
            </div>
            <div style={{ marginTop: 12, height: 8, background: T.bgSoft, borderRadius: 4, overflow:'hidden' }}>
              <div style={{ width: `${done/items.length*100}%`, height:'100%', background: T.primaryInk, borderRadius: 4 }}/>
            </div>

            {/* Per-step chips */}
            <div style={{ marginTop: 14, display:'flex', gap: 6, flexWrap:'wrap' }}>
              {[
                ['배경 제거', 'done'],
                ['카테고리 분류', 'done'],
                ['색상 추출', 'doing'],
                ['클라우드 백업', 'queue'],
              ].map(([l, s]) => (
                <div key={l} style={{
                  display:'inline-flex', alignItems:'center', gap: 5,
                  padding:'4px 10px', borderRadius: 12,
                  background: s==='done' ? T.mint : s==='doing' ? T.peach : T.bgSoft,
                  color: s==='done' ? T.mintInk : s==='doing' ? T.peachInk : T.ink2,
                  fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700,
                }}>
                  {s==='done' && '✓'}
                  {s==='doing' && (
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: T.peachInk, animation:'pulse 1.2s infinite' }}/>
                  )}
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items grid */}
        <div className="scroller" style={{ flex: 1, overflowY:'auto', padding:'0 20px 20px' }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 800, color: T.ink, marginBottom: 10 }}>처리 상태</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8 }}>
            {items.map((it, k) => {
              const c = CLOSET[k % CLOSET.length];
              return (
                <div key={k} style={{ position:'relative', aspectRatio:'1/1', borderRadius: 12, background: c.tone, overflow:'hidden' }}>
                  <div style={{ position:'absolute', inset: 0, opacity: 0.06, backgroundImage:`repeating-linear-gradient(135deg, transparent 0 6px, ${c.tag} 6px 6.5px)` }}/>
                  {it.s === 'doing' && (
                    <div style={{ position:'absolute', inset: 0, background:'rgba(20,16,8,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 11, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 1s linear infinite' }}/>
                    </div>
                  )}
                  {it.s === 'queue' && (
                    <div style={{ position:'absolute', inset: 0, background:'rgba(255,255,255,0.55)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ fontFamily:'var(--sans)', fontSize: 10, fontWeight: 700, color: T.ink2 }}>대기</div>
                    </div>
                  )}
                  {it.s === 'done' && (
                    <div style={{ position:'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, background: T.mintInk, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <div style={{
                    position:'absolute', left: 0, right: 0, bottom: 0,
                    padding:'4px 6px', background:'linear-gradient(0deg, rgba(0,0,0,0.45), rgba(0,0,0,0))',
                    fontFamily:'var(--sans)', fontSize: 9, fontWeight: 700, color:'#fff',
                  }}>{it.cat}</div>
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <div style={{ marginTop: 16, padding:'12px 14px', background: T.bgSoft, borderRadius: 14,
            fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, lineHeight: 1.55 }}>
            업로드는 백그라운드로도 계속돼요. 잘못된 분류는 옷장에서 1탭으로 수정할 수 있어요.
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 50% { opacity: 0.3; } }
        `}</style>
      </div>
    </IOSDevice>
  );
}

// ─── §5 · 코디 셔플 결과 ─────────────────────────────────────
function Tr_BuildShuffle() {
  const suggestions = [
    { id:'s1', mood:'캐주얼한 출근', items:['i02','i06','i09','i14'], temp:'18°', wx:'partly' },
    { id:'s2', mood:'비 오는 날',   items:['i01','i07','i11','i12'], temp:'14°', wx:'rain'   },
    { id:'s3', mood:'데이트 무드',   items:['i03','i08','i09','i15'], temp:'19°', wx:'sun'    },
  ];
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative' }}>
        <TSF/>

        <div style={{ padding:'4px 20px 4px', display:'flex', alignItems:'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center', marginLeft: -8 }}>{I.back(22)}</div>
          <div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>셔플 결과</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, marginTop: 2 }}>
              옷장에서 무작위 3가지를 골라봤어요
            </div>
          </div>
        </div>

        <div className="scroller" style={{ height:'calc(100% - 200px)', overflowY:'auto', padding:'12px 20px 120px' }}>
          {suggestions.map((s, i) => (
            <div key={s.id} style={{
              background: T.card, borderRadius: 22, padding: 14, boxShadow: CARD_SHADOW,
              marginBottom: 12, display:'flex', gap: 14, alignItems:'center',
            }}>
              <div style={{ width: 100, aspectRatio:'1/1', borderRadius: 14, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 2, flexShrink: 0 }}>
                {s.items.map(id => <Garment key={id} item={byId(id)} showLabel={false} radius={0}/>)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                  <div style={{
                    background: T[['peach','blue','lavender'][i]], color: T[['peachInk','blueInk','lavenderInk'][i]],
                    padding:'3px 9px', borderRadius: 10,
                    fontFamily:'var(--sans)', fontSize: 10, fontWeight: 700,
                  }}>제안 {i+1}</div>
                </div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 800, color: T.ink, marginTop: 6, letterSpacing: -0.2 }}>
                  {s.mood}
                </div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 3, display:'inline-flex', alignItems:'center', gap: 6 }}>
                  <WeatherGlyph kind={s.wx} size={11} color={T.ink2}/> {s.temp} · 4개 아이템
                </div>
                <div style={{ display:'flex', gap: 6, marginTop: 10 }}>
                  <div style={{
                    height: 30, padding:'0 12px', borderRadius: 15, background: T.primary, color: T.primaryInk,
                    display:'inline-flex', alignItems:'center', fontFamily:'var(--sans)', fontSize: 11, fontWeight: 800,
                  }}>이걸로 입기</div>
                  <div style={{
                    height: 30, padding:'0 10px', borderRadius: 15, background: T.bgSoft, color: T.ink2,
                    display:'inline-flex', alignItems:'center', fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600,
                  }}>편집</div>
                </div>
              </div>
            </div>
          ))}

          {/* Hint card */}
          <div style={{
            background: T.lavender, color: T.lavenderInk, borderRadius: 18, padding: 14, marginTop: 4,
            display:'flex', gap: 10, alignItems:'center',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background:'rgba(255,255,255,0.55)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--sans)', fontSize: 14, fontWeight: 800 }}>↻</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, lineHeight: 1.45 }}>
              마음에 드는 게 없으면 다시 셔플하거나, 슬롯 하나만 잠그고 나머지를 바꿔보세요.
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          position:'absolute', left: 0, right: 0, bottom: 0,
          padding:'12px 20px 30px', background:`linear-gradient(0deg, ${T.bg} 65%, rgba(255,255,255,0) 100%)`,
          display:'flex', gap: 8,
        }}>
          <GhostBtn style={{ flex: 1 }}>마음에 안 들어</GhostBtn>
          <PrimaryBtn style={{ flex: 1.3 }}>↻ 다시 셔플</PrimaryBtn>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── §5 · 저장된 코디 목록 ───────────────────────────────────
function Tr_OutfitList() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative' }}>
        <TSF/>

        <div style={{ padding:'4px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>저장된 코디</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 2 }}>
              {OUTFITS.length}개 · 자주 입은 순
            </div>
          </div>
          <div style={{
            width: 40, height: 40, background: T.card, borderRadius: 20,
            display:'flex', alignItems:'center', justifyContent:'center', boxShadow: CARD_SHADOW,
          }}>{I.search(20, T.ink)}</div>
        </div>

        {/* Filter chips */}
        <div style={{ display:'flex', gap: 8, padding:'2px 20px 12px', overflowX:'auto' }} className="scroller">
          {['전체','자주 입은','최근','날씨별','계절별'].map((c, i) => (
            <Chip key={c} active={i===0} color="peach">{c}</Chip>
          ))}
        </div>

        {/* 2-col grid */}
        <div className="scroller" style={{ height:'calc(100% - 200px)', overflowY:'auto', padding:'0 20px 100px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
            {OUTFITS.map((o, i) => (
              <div key={o.id} style={{ background: T.card, borderRadius: 20, padding: 8, boxShadow: CARD_SHADOW }}>
                <div style={{ aspectRatio:'1/1', borderRadius: 14, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 2, position:'relative' }}>
                  {o.items.slice(0, 4).map(id => <Garment key={id} item={byId(id)} showLabel={false} radius={0}/>)}
                  {i === 0 && (
                    <div style={{
                      position:'absolute', top: 6, left: 6, background: T.peach, color: T.peachInk,
                      padding:'3px 8px', borderRadius: 10,
                      fontFamily:'var(--sans)', fontSize: 9, fontWeight: 700,
                    }}>★ 자주</div>
                  )}
                </div>
                <div style={{ padding:'8px 4px 2px' }}>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, lineHeight: 1.25 }}>{o.mood}</div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink3, marginTop: 2, display:'inline-flex', alignItems:'center', gap: 4 }}>
                    <WeatherGlyph kind={o.weather} size={10} color={T.ink3}/> {o.temp} · ×{Math.max(1, 6-i)}회
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAB */}
        <div style={{
          position:'absolute', right: 20, bottom: 90,
          width: 56, height: 56, borderRadius: 28, background: T.primary,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: ELEVATE_SHADOW,
        }}>{I.plus(24, T.primaryInk)}</div>

        <TTabs active="build"/>
      </div>
    </IOSDevice>
  );
}

// ─── §5 · 코디 상세 ──────────────────────────────────────────
function Tr_OutfitDetail() {
  const o = OUTFITS[0];
  const items = o.items.map(byId);
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column' }}>
        <TSF/>

        {/* Top nav over hero */}
        <div style={{
          position:'absolute', top: 54, left: 0, right: 0, padding:'12px 16px',
          display:'flex', justifyContent:'space-between', zIndex: 3,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(20)}</div>
          <div style={{ display:'flex', gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {/* share icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v14M7 8l5-5 5 5" stroke={T.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" stroke={T.ink} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 20, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>{I.more(20)}</div>
          </div>
        </div>

        {/* Hero — outfit 2x2 mannequin */}
        <div style={{ position:'relative', height: 320, background: T.bgSoft, padding: 30 }}>
          <div style={{ height:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap: 8 }}>
            {items.slice(0, 4).map((it, i) => it && (
              <div key={i} style={{
                background: it.tone, borderRadius: 16, position:'relative', overflow:'hidden',
                boxShadow:'0 4px 16px rgba(40,32,20,0.08)',
              }}>
                <div style={{ position:'absolute', inset: 0, opacity: 0.06, backgroundImage:`repeating-linear-gradient(135deg, transparent 0 7px, ${it.tag} 7px 7.5px)` }}/>
              </div>
            ))}
          </div>
        </div>

        {/* Content card pulled up */}
        <div className="scroller" style={{
          flex: 1, marginTop: -28, background: T.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding:'24px 22px 20px', overflowY:'auto', position:'relative', zIndex: 2,
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink3, letterSpacing: 0.5 }}>
                저장된 코디
              </div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, marginTop: 4, letterSpacing: -0.4 }}>
                {o.mood}
              </div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, marginTop: 4, display:'inline-flex', alignItems:'center', gap: 6 }}>
                <WeatherGlyph kind={o.weather} size={12} color={T.ink2}/> {o.date.replace(/·/g, '/')} · {o.temp}
              </div>
            </div>
            <div style={{ background: T.peach, color: T.peachInk, padding:'5px 10px', borderRadius: 12, fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700 }}>
              ×3회
            </div>
          </div>

          {/* Item list */}
          <div style={{ marginTop: 18, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 800, color: T.ink, marginBottom: 8 }}>
            구성 아이템
          </div>
          <div style={{ background: T.card, borderRadius: 18, padding: 4, boxShadow: CARD_SHADOW }}>
            {items.map((it, i, arr) => it && (
              <div key={it.id} style={{
                display:'flex', alignItems:'center', gap: 12, padding:'10px 10px',
                borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
              }}>
                <div style={{ width: 40, aspectRatio:'1', borderRadius: 10, overflow:'hidden' }}>
                  <Garment item={it} showLabel={false} radius={0}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink }}>{it.ko}</div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2 }}>{it.brand}</div>
                </div>
                <div style={{
                  padding:'3px 8px', borderRadius: 8, background: T.bgSoft,
                  fontFamily:'var(--sans)', fontSize: 10, fontWeight: 700, color: T.ink2,
                }}>{ {TOP:'상의', BOTTOM:'하의', OUTER:'아우터', SHOES:'신발', ACC:'잡화'}[it.cat] }</div>
              </div>
            ))}
          </div>

          {/* Wear history */}
          <div style={{ marginTop: 18, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 800, color: T.ink, marginBottom: 8 }}>
            입었던 날
          </div>
          <div style={{ display:'flex', gap: 8 }}>
            {['5/12','4/28','4/15'].map((d, i) => (
              <div key={d} style={{
                flex: 1, background: T.card, borderRadius: 14, padding:'10px 12px', boxShadow: CARD_SHADOW,
                textAlign:'center',
              }}>
                <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink2 }}>{['이번 주','지난 달','지난 달'][i]}</div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 800, color: T.ink, marginTop: 4 }}>{d}</div>
              </div>
            ))}
          </div>

          {/* Bottom CTAs */}
          <div style={{ marginTop: 24, display:'flex', gap: 8 }}>
            <GhostBtn style={{ flex: 1 }}>편집</GhostBtn>
            <PrimaryBtn style={{ flex: 1.4 }}>오늘 다시 입기 ✓</PrimaryBtn>
          </div>
          <div style={{ height: 20 }}/>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── §6 · 날짜 상세 + 오늘 입기 기록 ─────────────────────────
function Tr_DayDetail() {
  const o = OUTFITS[0];
  const items = o.items.map(byId);
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column' }}>
        <TSF/>

        {/* Sheet-like header */}
        <div style={{ padding:'8px 12px 6px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(22)}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>5월 12일 · 화</div>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.more(22)}</div>
        </div>

        {/* Weather strip */}
        <div style={{ padding:'4px 20px 14px' }}>
          <div style={{
            background: T.bgSoft, borderRadius: 14, padding:'12px 14px',
            display:'flex', alignItems:'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: T.card,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <WeatherGlyph kind="rain" size={22} color={T.blueInk}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 800, color: T.ink }}>14° · 비 옴</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 2 }}>서울 · 마포구 · 강수 80%</div>
            </div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink2 }}>최저 11° / 최고 16°</div>
          </div>
        </div>

        <div className="scroller" style={{ flex: 1, overflowY:'auto', padding:'0 20px 30px' }}>
          {/* Wore today card */}
          <div style={{
            background: T.card, borderRadius: 22, padding: 14, boxShadow: CARD_SHADOW,
            display:'flex', gap: 14, alignItems:'center',
          }}>
            <div style={{ width: 100, aspectRatio:'1/1', borderRadius: 14, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 2, flexShrink: 0 }}>
              {items.map(it => it && <Garment key={it.id} item={it} showLabel={false} radius={0}/>)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.mintInk, display:'inline-flex', alignItems:'center', gap: 4 }}>
                <div style={{ width: 14, height: 14, borderRadius: 7, background: T.mint, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke={T.mintInk} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                이 날 입었어요
              </div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 16, fontWeight: 800, color: T.ink, marginTop: 6, letterSpacing: -0.2 }}>
                {o.mood}
              </div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 2 }}>
                4개 아이템 · 오후 2:14 기록
              </div>
            </div>
          </div>

          {/* Mood + notes */}
          <div style={{ marginTop: 14, background: T.card, borderRadius: 18, padding: 14, boxShadow: CARD_SHADOW }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700, color: T.ink3, textTransform:'uppercase', letterSpacing: 0.4 }}>NOTE</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink, marginTop: 6, lineHeight: 1.55 }}>
              점심에 갑자기 비가 와서 하의가 좀 젖었음. 다음엔 와이드 셀비지가 나을 듯.
            </div>
            <div style={{ marginTop: 10, display:'flex', gap: 6, flexWrap:'wrap' }}>
              {['#비','#출근','#실패'].map(t => <Chip key={t} active>{t}</Chip>)}
            </div>
          </div>

          {/* Past 회상 — same day in previous months */}
          <div style={{ marginTop: 18, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 800, color: T.ink, marginBottom: 8 }}>
            작년 오늘
          </div>
          <div style={{ display:'flex', gap: 8 }}>
            {[OUTFITS[2], OUTFITS[3], OUTFITS[4]].map((p, i) => p && (
              <div key={i} style={{
                flex: 1, background: T.card, borderRadius: 14, padding: 8, boxShadow: CARD_SHADOW,
              }}>
                <div style={{ aspectRatio:'1/1', borderRadius: 10, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 1 }}>
                  {p.items.slice(0,4).map(id => <Garment key={id} item={byId(id)} showLabel={false} radius={0}/>)}
                </div>
                <div style={{ fontFamily:'var(--mono)', fontSize: 10, fontWeight: 600, color: T.ink3, marginTop: 6, textAlign:'center' }}>
                  {2025 - i}.05.12
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTAs */}
          <div style={{ marginTop: 24, display:'flex', gap: 8 }}>
            <GhostBtn style={{ flex: 1 }}>코디 바꾸기</GhostBtn>
            <PrimaryBtn style={{ flex: 1.2 }}>공유하기</PrimaryBtn>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, {
  Tr_AddSheet, Tr_AddCapture, Tr_AddMulti, Tr_AddBatch,
  Tr_BuildShuffle, Tr_OutfitList, Tr_OutfitDetail, Tr_DayDetail,
});
