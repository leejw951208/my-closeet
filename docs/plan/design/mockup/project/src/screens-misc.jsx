// ─────────────────────────────────────────────────────────────
// 기타 보조 화면 — MVP §4, §8, §9
//
//   • Tr_ClosetEmoji  — 옷장 그리드 이모지 뷰 (§4)
//   • Tr_Sync         — 동기화 상태 화면 (§8)
//   • Tr_Export       — 데이터 내보내기 (§9)
//   • Tr_PhoneChange  — 휴대폰 번호 변경 (§1)
// ─────────────────────────────────────────────────────────────

// 카테고리·색상 → 이모지 매핑 데모
const EMOJI_MAP = {
  i01: '🧥', i02: '👕', i03: '👕', i04: '🧥', i05: '🧥',
  i06: '👖', i07: '👖', i08: '👖',
  i09: '👟', i10: '👟', i11: '👟',
  i12: '🧢', i13: '🧣', i14: '👜', i15: '👜',
};

// ─── §4 · 옷장 이모지 뷰 ─────────────────────────────────────
function Tr_ClosetEmoji() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative' }}>
        <TSF/>

        <div style={{ padding:'4px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>내 옷장</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 2 }}>
              {CLOSET.length}벌 · 이모지 뷰
            </div>
          </div>
          {/* View toggle — emoji active */}
          <div style={{
            background: T.bgSoft, borderRadius: 14, padding: 3, display:'flex', gap: 2,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 11,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'transparent',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke={T.ink3} strokeWidth="1.7"/>
                <circle cx="9" cy="11" r="1.8" fill={T.ink3}/>
                <path d="M5 17l4-4 3 3 3-3 4 4" stroke={T.ink3} strokeWidth="1.7" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 11,
              display:'flex', alignItems:'center', justifyContent:'center',
              background: T.card, boxShadow:'0 1px 3px rgba(0,0,0,0.08)',
              fontSize: 14,
            }}>😊</div>
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display:'flex', gap: 8, padding:'2px 20px 14px', overflowX:'auto' }} className="scroller">
          {CATS.map((c, i) => (
            <Chip key={c.id} active={i===0} color="peach">
              {c.ko} <span style={{ marginLeft: 5, opacity: 0.7, fontWeight: 600 }}>{byCat(c.id).length}</span>
            </Chip>
          ))}
        </div>

        {/* Grid with emoji tiles */}
        <div className="scroller" style={{ height:'calc(100% - 200px)', overflowY:'auto', padding:'0 20px 100px' }}>
          {/* Section: 상의 */}
          {[
            { cat:'TOP',    label:'상의',   color:'blue'     },
            { cat:'BOTTOM', label:'하의',   color:'mint'     },
            { cat:'OUTER',  label:'아우터', color:'lavender' },
            { cat:'SHOES',  label:'신발',   color:'peach'    },
            { cat:'ACC',    label:'잡화',   color:'blue'     },
          ].map(sec => {
            const items = byCat(sec.cat);
            if (!items.length) return null;
            return (
              <div key={sec.cat} style={{ marginBottom: 18 }}>
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 8 }}>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 800, color: T.ink }}>
                    {sec.label} <span style={{ color: T.ink3, fontWeight: 600 }}>{items.length}</span>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8 }}>
                  {items.map(it => (
                    <div key={it.id} style={{
                      aspectRatio:'1/1', background: it.tone, borderRadius: 16, position:'relative',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow: CARD_SHADOW, overflow:'hidden',
                    }}>
                      <div style={{
                        position:'absolute', inset: 0, opacity: 0.05,
                        backgroundImage:`repeating-linear-gradient(135deg, transparent 0 6px, ${it.tag} 6px 6.5px)`,
                      }}/>
                      <div style={{ fontSize: 30, lineHeight: 1, position:'relative' }}>{EMOJI_MAP[it.id]}</div>
                      <div style={{
                        position:'absolute', bottom: 4, right: 5,
                        fontFamily:'var(--sans)', fontSize: 9, fontWeight: 700, color: T.ink2,
                        background:'rgba(255,255,255,0.85)', padding:'1px 5px', borderRadius: 6,
                      }}>×{it.wears}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <TTabs active="closet"/>
      </div>
    </IOSDevice>
  );
}

// ─── §8 · 동기화 상태 ────────────────────────────────────────
function Tr_Sync() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column' }}>
        <TSF/>

        <div style={{ padding:'8px 12px 6px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(22)}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>동기화</div>
          <div style={{ width: 40 }}/>
        </div>

        <div className="scroller" style={{ flex: 1, overflowY:'auto', padding:'8px 20px 30px' }}>
          {/* Big status hero */}
          <div style={{
            background: T.mint, color: T.mintInk, borderRadius: 24, padding:'22px 20px',
            boxShadow: CARD_SHADOW, display:'flex', gap: 16, alignItems:'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18, background:'rgba(255,255,255,0.6)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M7 6a6 6 0 019.5-3.6L20 5M17 18a6 6 0 01-9.5 3.6L4 19" stroke={T.mintInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2v4h4M8 22v-4H4" stroke={T.mintInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>모두 동기화됐어요</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, marginTop: 4, opacity: 0.8 }}>
                마지막 백업 · 방금 전
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ marginTop: 14, display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
            <div style={{ background: T.card, borderRadius: 18, padding: 14, boxShadow: CARD_SHADOW }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink2 }}>업로드 완료</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 26, fontWeight: 800, color: T.ink, marginTop: 4, letterSpacing: -0.5 }}>{CLOSET.length}<span style={{ fontSize: 14, fontWeight: 600, color: T.ink2, marginLeft: 4 }}>벌</span></div>
            </div>
            <div style={{ background: T.card, borderRadius: 18, padding: 14, boxShadow: CARD_SHADOW }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink2 }}>코디</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 26, fontWeight: 800, color: T.ink, marginTop: 4, letterSpacing: -0.5 }}>{OUTFITS.length}<span style={{ fontSize: 14, fontWeight: 600, color: T.ink2, marginLeft: 4 }}>개</span></div>
            </div>
            <div style={{ background: T.card, borderRadius: 18, padding: 14, boxShadow: CARD_SHADOW }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink2 }}>저장 공간</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 26, fontWeight: 800, color: T.ink, marginTop: 4, letterSpacing: -0.5 }}>248<span style={{ fontSize: 14, fontWeight: 600, color: T.ink2, marginLeft: 4 }}>MB</span></div>
            </div>
            <div style={{ background: T.card, borderRadius: 18, padding: 14, boxShadow: CARD_SHADOW }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink2 }}>연결된 기기</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 26, fontWeight: 800, color: T.ink, marginTop: 4, letterSpacing: -0.5 }}>2<span style={{ fontSize: 14, fontWeight: 600, color: T.ink2, marginLeft: 4 }}>대</span></div>
            </div>
          </div>

          {/* Activity log */}
          <div style={{ marginTop: 18, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 800, color: T.ink, marginBottom: 8 }}>
            최근 활동
          </div>
          <div style={{ background: T.card, borderRadius: 18, padding: 4, boxShadow: CARD_SHADOW }}>
            {[
              { t:'코디 1개 백업',        d:'방금 전',           s:'done'  },
              { t:'옷 3장 업로드 완료',   d:'2분 전',           s:'done'  },
              { t:'iPad mini 와 동기화',  d:'오늘 09:14',       s:'done'  },
              { t:'사진 1장 업로드 실패', d:'어제 21:30 · 재시도', s:'fail'  },
              { t:'옷장 복원',           d:'2일 전',           s:'done'  },
            ].map((row, i, arr) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap: 12, padding:'12px 12px',
                borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 13,
                  background: row.s === 'fail' ? T.peach : T.mint,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0,
                }}>
                  {row.s === 'fail' ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4v9M12 17v2" stroke={T.peachInk} strokeWidth="2.4" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke={T.mintInk} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink }}>{row.t}</div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 1 }}>{row.d}</div>
                </div>
                {row.s === 'fail' && (
                  <div style={{ padding:'4px 10px', borderRadius: 10, background: T.peach, color: T.peachInk,
                    fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700 }}>재시도</div>
                )}
              </div>
            ))}
          </div>

          {/* Offline queue card */}
          <div style={{
            marginTop: 16, padding:'14px 16px', background: T.bgSoft, borderRadius: 16,
            display:'flex', gap: 12, alignItems:'center',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12, background: T.card,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12a9 9 0 0118 0M3 12a9 9 0 0018 0M3 12h18" stroke={T.ink2} strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink }}>오프라인 대기열 비어있음</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 1 }}>
                연결 안 되어도 등록한 옷은 자동으로 큐에 쌓여요
              </div>
            </div>
          </div>

          {/* Manual */}
          <div style={{ marginTop: 16 }}>
            <PrimaryBtn>지금 다시 동기화</PrimaryBtn>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── §9 · 데이터 내보내기 ────────────────────────────────────
function Tr_Export() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column' }}>
        <TSF/>

        <div style={{ padding:'8px 12px 6px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(22)}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>데이터 내보내기</div>
          <div style={{ width: 40 }}/>
        </div>

        <div className="scroller" style={{ flex: 1, overflowY:'auto', padding:'8px 20px 30px' }}>
          {/* Intro */}
          <div style={{ padding:'6px 0 14px' }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 20, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>
              내 옷장을 파일로 받기
            </div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 6, lineHeight: 1.55 }}>
              사진·메타데이터·코디 정보를 압축 파일로 내보냅니다. 언제든 다시 불러올 수 있어요.
            </div>
          </div>

          {/* Bundle preview */}
          <div style={{
            background: T.card, borderRadius: 22, padding: 18, boxShadow: CARD_SHADOW,
            display:'flex', gap: 14, alignItems:'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: T.peach,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M6 3h8l4 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke={T.peachInk} strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M14 3v4h4" stroke={T.peachInk} strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M9 13h6M9 17h4" stroke={T.peachInk} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'var(--mono)', fontSize: 13, fontWeight: 600, color: T.ink }}>my_closet_2026-05-18.zip</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 4 }}>
                약 248 MB · 옷 {CLOSET.length}벌 + 코디 {OUTFITS.length}개
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{ marginTop: 18, fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700, color: T.ink3, textTransform:'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
            포함 항목
          </div>
          <div style={{ background: T.card, borderRadius: 18, padding: 4, boxShadow: CARD_SHADOW }}>
            {[
              { l:'옷 사진 (원본)',         d:'고해상도 JPEG',    on: true  },
              { l:'옷 메타데이터',         d:'카테고리·태그·횟수', on: true  },
              { l:'저장된 코디',           d:'JSON',             on: true  },
              { l:'캘린더 기록',           d:'CSV',              on: true  },
              { l:'AI 분류 학습 데이터',    d:'개인 식별 정보 제외', on: false },
            ].map((row, i, arr) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap: 12, padding:'12px 14px',
                borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600, color: T.ink }}>{row.l}</div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 1 }}>{row.d}</div>
                </div>
                {/* iOS-style toggle */}
                <div style={{
                  width: 42, height: 26, borderRadius: 13,
                  background: row.on ? T.mintInk : T.line,
                  position:'relative', transition:'background 200ms',
                }}>
                  <div style={{
                    position:'absolute', top: 2, left: row.on ? 18 : 2,
                    width: 22, height: 22, borderRadius: 11, background:'#fff',
                    boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transition:'left 200ms',
                  }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Format radio */}
          <div style={{ marginTop: 18, fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700, color: T.ink3, textTransform:'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
            형식
          </div>
          <div style={{ background: T.card, borderRadius: 18, padding: 4, boxShadow: CARD_SHADOW }}>
            {[
              { l:'ZIP (사진 + 데이터)', d:'다른 기기 복원용',   on: true  },
              { l:'JSON만',              d:'개발자용',           on: false },
              { l:'PDF 룩북',           d:'코디 별 인쇄용',     on: false },
            ].map((row, i, arr) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap: 12, padding:'12px 14px',
                borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 11,
                  border: row.on ? `6px solid ${T.peachInk}` : `1.5px solid ${T.line}`,
                  background:'#fff', flexShrink: 0,
                }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: row.on ? 700 : 500, color: T.ink }}>{row.l}</div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 1 }}>{row.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: 22 }}>
            <PrimaryBtn>
              <span style={{ display:'inline-flex', alignItems:'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v13M6 11l6 6 6-6" stroke={T.primaryInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 21h16" stroke={T.primaryInk} strokeWidth="2" strokeLinecap="round"/>
                </svg>
                ZIP 파일 만들기
              </span>
            </PrimaryBtn>
          </div>
          <div style={{ textAlign:'center', marginTop: 10, fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink3 }}>
            압축에 약 30초 정도 걸려요
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── §1 · 휴대폰 번호 변경 ───────────────────────────────────
function Tr_PhoneChange() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column' }}>
        <TSF/>

        <div style={{ padding:'8px 12px 6px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(22)}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>휴대폰 번호 변경</div>
          <div style={{ width: 40 }}/>
        </div>

        <div className="scroller" style={{ flex: 1, overflowY:'auto', padding:'14px 20px 30px' }}>
          {/* Current number */}
          <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink3, textTransform:'uppercase', letterSpacing: 0.4 }}>
            현재 등록된 번호
          </div>
          <div style={{
            marginTop: 8, background: T.bgSoft, borderRadius: 16, padding:'14px 16px',
            display:'flex', alignItems:'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12, background: T.card,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize: 18,
            }}>📱</div>
            <div style={{ flex: 1, fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink, letterSpacing: 0.4 }}>
              +82 010-1234-****
            </div>
            <div style={{
              padding:'4px 10px', borderRadius: 10, background: T.mint, color: T.mintInk,
              fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700,
            }}>인증됨</div>
          </div>

          {/* New number input */}
          <div style={{ marginTop: 22, fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink3, textTransform:'uppercase', letterSpacing: 0.4 }}>
            새 번호
          </div>
          <div style={{ marginTop: 8, display:'flex', gap: 8 }}>
            <div style={{
              background: T.card, borderRadius: 16, padding:'14px 16px', boxShadow: CARD_SHADOW,
              display:'flex', alignItems:'center', gap: 6,
              fontFamily:'var(--sans)', fontSize: 15, fontWeight: 600, color: T.ink,
            }}>
              🇰🇷 +82
            </div>
            <div style={{
              flex: 1, background: T.card, borderRadius: 16, padding:'14px 18px', boxShadow: CARD_SHADOW,
              fontFamily:'var(--sans)', fontSize: 17, fontWeight: 700, color: T.ink3, letterSpacing: 0.4,
            }}>
              010-0000-0000
            </div>
          </div>

          {/* Warning */}
          <div style={{
            marginTop: 18, background: T.peach, color: T.peachInk, borderRadius: 16,
            padding:'14px 16px', display:'flex', gap: 12, alignItems:'flex-start',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 12, background:'rgba(255,255,255,0.55)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0,
              fontFamily:'var(--sans)', fontSize: 13, fontWeight: 800,
            }}>!</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, lineHeight: 1.55 }}>
              번호 변경 시 새 번호로 SMS 인증을 다시 진행합니다. 변경 전까지는 기존 번호로 로그인할 수 있어요.
            </div>
          </div>

          {/* What stays */}
          <div style={{ marginTop: 18, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 800, color: T.ink, marginBottom: 8 }}>
            그대로 유지되는 것
          </div>
          <div style={{ background: T.card, borderRadius: 18, padding: 4, boxShadow: CARD_SHADOW }}>
            {[
              { l:'옷장 · 코디 · 캘린더', d:'전부 그대로' },
              { l:'PIN과 생체인식',       d:'변경 없음' },
              { l:'연결된 기기',          d:'2대 그대로' },
            ].map((row, i, arr) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap: 12, padding:'12px 14px',
                borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 11, background: T.mint,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke={T.mintInk} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink }}>{row.l}</div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 1 }}>{row.d}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22 }}>
            <PrimaryBtn>인증번호 받기</PrimaryBtn>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { Tr_ClosetEmoji, Tr_Sync, Tr_Export, Tr_PhoneChange });
