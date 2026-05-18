// ─────────────────────────────────────────────────────────────
// TRENDY KOREAN APP DIRECTION
// Warm cream base, soft pastel pills, white cards with gentle
// shadow. Reads like acloset / Toss / Musinsa: friendly Korean
// copy, no editorial markers, photo-first layouts.
// ─────────────────────────────────────────────────────────────

const T = {
  bg:        '#FFFFFF',
  bgSoft:    '#F6F4EE',
  card:      '#FFFFFF',
  ink:       '#1A1A18',
  ink2:      '#737067',
  ink3:      '#B5B2A8',
  line:      '#EEEAE2',
  // Pastel chip palette
  peach:     '#FBCFA8', peachDeep: '#F4B381', peachInk:  '#7A4119',
  blue:      '#CFDEEF', blueDeep:  '#A7C4E0', blueInk:   '#2D4F7B',
  mint:      '#D9E8DC', mintDeep:  '#B6D2BB', mintInk:   '#3D6E50',
  lavender:  '#E3DCEF', lavenderInk:'#5C4080',
  // Primary CTA = peach (warm, on-brand, not gothic)
  primary:   '#FBCFA8',
  primaryInk:'#7A4119',
};

const CARD_SHADOW    = '0 2px 14px rgba(40,32,20,0.05), 0 1px 3px rgba(40,32,20,0.04)';
const ELEVATE_SHADOW = '0 8px 28px rgba(40,32,20,0.10), 0 2px 6px rgba(40,32,20,0.05)';

// ─── Tiny icon helpers ─────────────────────────────────────────
const I = {
  search: (s=20, c=T.ink) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke={c} strokeWidth="1.8"/><path d="M16 16l4 4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  bell:   (s=20, c=T.ink) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/><path d="M10 20a2 2 0 004 0" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  heart:  (s=20, c=T.ink, fill='none') => <svg width={s} height={s} viewBox="0 0 24 24" fill={fill}><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  back:   (s=20, c=T.ink) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 6l-6 6 6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  more:   (s=20, c=T.ink) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>,
  plus:   (s=20, c=T.ink) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  close:  (s=20, c=T.ink) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  camera: (s=22, c=T.ink) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke={c} strokeWidth="1.8"/><circle cx="12" cy="13" r="4" stroke={c} strokeWidth="1.8"/></svg>,
  album:  (s=22, c=T.ink) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke={c} strokeWidth="1.8"/><circle cx="9" cy="11" r="1.8" fill={c}/><path d="M5 17l4-4 3 3 3-3 4 4" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  // Tab icons
  tHome:    (s=22, c, fill=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={fill?c:'none'}><path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  tCloset:  (s=22, c, fill=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={fill?c:'none'}><rect x="4" y="5" width="16" height="14" rx="2" stroke={c} strokeWidth="1.7"/><path d="M4 11h16M12 5v14" stroke={c} strokeWidth="1.7"/></svg>,
  tBuild:   (s=22, c, fill=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={fill?c:'none'}><circle cx="8" cy="8" r="3.5" stroke={c} strokeWidth="1.7"/><rect x="13" y="4" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.7"/><rect x="4" y="14" width="7" height="6" rx="1.5" stroke={c} strokeWidth="1.7"/><circle cx="17" cy="17" r="3" stroke={c} strokeWidth="1.7"/></svg>,
  tLog:     (s=22, c, fill=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={fill?c:'none'}><rect x="4" y="5" width="16" height="15" rx="2" stroke={c} strokeWidth="1.7"/><path d="M4 10h16M9 3v4M15 3v4" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></svg>,
  tMe:      (s=22, c, fill=false) => <svg width={s} height={s} viewBox="0 0 24 24" fill={fill?c:'none'}><circle cx="12" cy="9" r="3.5" stroke={c} strokeWidth="1.7"/><path d="M5 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></svg>,
  weather: WeatherGlyph,
};

// Status bar spacer for iOS frame
function TSF() { return <div style={{ height: 54 }}/>; }

// Bottom tab bar (visual only — see Prototype for interactive)
function TTabs({ active = 'home' }) {
  const tabs = [
    { id:'home',   label:'홈',   icon: I.tHome },
    { id:'closet', label:'옷장', icon: I.tCloset },
    { id:'add',    label:'',     icon: null, plus: true },
    { id:'log',    label:'기록', icon: I.tLog },
    { id:'me',     label:'마이', icon: I.tMe },
  ];
  return (
    <div style={{
      position:'absolute', left: 0, right: 0, bottom: 0,
      background: T.card, paddingBottom: 22, paddingTop: 8,
      display:'grid', gridTemplateColumns:'repeat(5, 1fr)',
      borderTop: `0.5px solid ${T.line}`, zIndex: 5,
    }}>
      {tabs.map(t => {
        if (t.plus) {
          return (
            <div key={t.id} style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 24,
                background: T.primary, color: T.primaryInk,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: ELEVATE_SHADOW, marginTop: -16,
              }}>{I.plus(22, T.primaryInk)}</div>
            </div>
          );
        }
        const on = active === t.id;
        const c = on ? T.ink : T.ink3;
        return (
          <div key={t.id} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap: 4,
            color: c, fontFamily:'var(--sans)', fontSize: 11, fontWeight: on ? 700 : 500,
          }}>
            {t.icon(22, c, on)}
            <span>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Pill chip (used for filter tabs, tags)
function Chip({ children, active, color = 'blue', style = {} }) {
  const fill   = active ? T[color]      : T.card;
  const fg     = active ? T[color+'Ink']: T.ink2;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', height: 34,
      padding: '0 14px', borderRadius: 17,
      background: fill, color: fg,
      fontFamily:'var(--sans)', fontSize: 13, fontWeight: active ? 700 : 500,
      whiteSpace:'nowrap', boxShadow: active ? 'none' : `inset 0 0 0 1px ${T.line}`,
      ...style,
    }}>{children}</span>
  );
}

// Photo card — used in closet grids and detail
function PhotoCard({ item, onClick, badge, big=false, ratio='3/4' }) {
  if (!item) return null;
  return (
    <div onClick={onClick} style={{
      background: T.card, borderRadius: 20, padding: 8,
      boxShadow: CARD_SHADOW, cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ position:'relative', aspectRatio: ratio, borderRadius: 14, overflow:'hidden', background: item.tone }}>
        <div style={{
          position:'absolute', inset: 0, opacity: 0.05,
          backgroundImage: `repeating-linear-gradient(135deg, transparent 0 7px, ${item.tag} 7px 7.5px)`,
        }}/>
        {badge && (
          <div style={{
            position:'absolute', top: 8, right: 8,
            background: T.card, color: T.ink, padding: '3px 8px', borderRadius: 12,
            fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>{badge}</div>
        )}
      </div>
      <div style={{ padding: '8px 2px 4px' }}>
        <div style={{ fontFamily:'var(--sans)', fontSize: big ? 15 : 14, fontWeight: 700, color: T.ink, lineHeight: 1.25 }}>{item.ko}</div>
        <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink3, marginTop: 2 }}>{item.brand}</div>
      </div>
    </div>
  );
}

// Primary pill button
function PrimaryBtn({ children, style = {}, onClick }) {
  return (
    <button onClick={onClick} style={{
      border:'none', background: T.primary, color: T.primaryInk,
      fontFamily:'var(--sans)', fontWeight: 700, fontSize: 15,
      height: 52, borderRadius: 26, padding: '0 22px',
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
      width:'100%', cursor:'pointer', whiteSpace:'nowrap',
      ...style,
    }}>{children}</button>
  );
}
function GhostBtn({ children, style = {}, onClick }) {
  return (
    <button onClick={onClick} style={{
      border:'none', background: T.card, color: T.ink,
      boxShadow: `inset 0 0 0 1px ${T.line}`,
      fontFamily:'var(--sans)', fontWeight: 600, fontSize: 15,
      height: 52, borderRadius: 26, padding: '0 22px',
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 6,
      cursor:'pointer', whiteSpace:'nowrap', ...style,
    }}>{children}</button>
  );
}

// Outfit recommendation card — flat-lay style. Items appear inside a
// clean white card like product cutouts on a tabletop (no per-item
// backdrop). Use multiple cards side-by-side as horizontal options.
function OutfitOption({ items, onSelect }) {
  const layout = [
    { left:  8, top:  6, width: 38, height: 40 },  // 0: TOP — vertical
    { left:  6, top: 48, width: 36, height: 46 },  // 1: BOTTOM — taller vertical
    { left: 50, top:  8, width: 44, height: 42 },  // 2: OUTER / upper-right
    { left: 56, top: 56, width: 36, height: 34 },  // 3: SHOES or ACC — lower-right
  ];
  return (
    <div onClick={onSelect} style={{
      background: T.card, borderRadius: 24, padding: 10,
      boxShadow: CARD_SHADOW, cursor: onSelect ? 'pointer' : 'default',
    }}>
      <div style={{ position:'relative', aspectRatio:'1/1', borderRadius: 16, overflow:'hidden' }}>
        {items.slice(0, 4).map((id, i) => {
          const it = byId(id);
          if (!it) return null;
          const p = layout[i] || layout[0];
          return (
            <div key={id} style={{
              position:'absolute',
              left: `${p.left}%`, top: `${p.top}%`,
              width: `${p.width}%`, height: `${p.height}%`,
              borderRadius: 6, background: it.tone, overflow: 'hidden',
            }}>
              <div style={{
                position:'absolute', inset: 0, opacity: 0.06,
                backgroundImage:`repeating-linear-gradient(135deg, transparent 0 5px, ${it.tag} 5px 5.5px)`,
              }}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Login (PIN entry) ────────────────────────────────────────
// Shared PIN UI primitives — also reused by the interactive prototype.

function PinDots({ length, max = 6, shake = false }) {
  return (
    <div style={{
      display:'flex', gap: 16, justifyContent:'center',
      animation: shake ? 'pinShake 360ms cubic-bezier(.36,.07,.19,.97)' : 'none',
    }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < length;
        return (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 8,
            background: filled ? T.primaryInk : 'transparent',
            boxShadow: `inset 0 0 0 1.5px ${filled ? T.primaryInk : T.line}`,
            transition: 'background 140ms ease, box-shadow 140ms ease, transform 140ms',
            transform: filled ? 'scale(1.0)' : 'scale(0.95)',
          }}/>
        );
      })}
    </div>
  );
}

function NumKey({ children, onTap, dim }) {
  return (
    <button onClick={onTap} style={{
      width: 68, height: 68, borderRadius: 34,
      background:'transparent', border:'none', cursor:'pointer',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--sans)', fontSize: 28, fontWeight: 500, color: dim ? T.ink2 : T.ink,
      transition:'background 120ms',
    }}
    onMouseDown={e => e.currentTarget.style.background = T.bgSoft}
    onMouseUp={e => e.currentTarget.style.background = 'transparent'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
  );
}

function NumPad({ onDigit, onDelete, onBio }) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 6,
      justifyItems:'center', maxWidth: 280, margin:'0 auto',
    }}>
      {['1','2','3','4','5','6','7','8','9'].map(n => (
        <NumKey key={n} onTap={()=>onDigit(n)}>{n}</NumKey>
      ))}
      <NumKey dim onTap={onBio}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 4a8 8 0 00-8 8M20 12a8 8 0 00-3-6.2" stroke={T.ink2} strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M7 13a5 5 0 0110 0v3" stroke={T.ink2} strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M10 13a2 2 0 014 0v4M13 19v1M10 17v2" stroke={T.ink2} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </NumKey>
      <NumKey onTap={()=>onDigit('0')}>0</NumKey>
      <NumKey dim onTap={onDelete}>
        <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
          <path d="M9 2H22a2 2 0 012 2v12a2 2 0 01-2 2H9l-7-8 7-8z" stroke={T.ink2} strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M13 7l6 6m0-6l-6 6" stroke={T.ink2} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </NumKey>
    </div>
  );
}

function Tr_Login() {
  // Static demo: show 3 dots filled out of 6.
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column', padding:'0 24px' }}>
        <TSF/>

        {/* Brand mark */}
        <div style={{ marginTop: 28, display:'flex', flexDirection:'column', alignItems:'center', gap: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: T.primary,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: ELEVATE_SHADOW,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 6.5a2 2 0 11.5-3.9c.5.1.5.5.5.9v2" stroke={T.primaryInk} strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M12 8l-9 5.5c-.5.3-.7.5-.7 1 0 .8.5 1.5 1.5 1.5h16.4c1 0 1.5-.7 1.5-1.5 0-.5-.2-.7-.7-1L12 8z" stroke={T.primaryInk} strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ textAlign:'center', marginTop: 28 }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>
            지윤님, 다시 오셨어요
          </div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 500, color: T.ink2, marginTop: 8 }}>
            6자리 비밀번호를 입력해주세요
          </div>
        </div>

        {/* PIN dots */}
        <div style={{ marginTop: 36, marginBottom: 'auto' }}>
          <PinDots length={3}/>
        </div>

        {/* NumPad */}
        <div style={{ paddingBottom: 24 }}>
          <NumPad onDigit={()=>{}} onDelete={()=>{}} onBio={()=>{}}/>
          <div style={{ marginTop: 18, textAlign:'center' }}>
            <button style={{
              background:'transparent', border:'none',
              fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600, color: T.ink2, cursor:'pointer',
            }}>처음이신가요? <span style={{ color: T.peachInk, fontWeight: 700 }}>가입하기</span></button>
          </div>
        </div>

        <style>{`
          @keyframes pinShake {
            10%, 90% { transform: translateX(-2px); }
            20%, 80% { transform: translateX(3px); }
            30%, 50%, 70% { transform: translateX(-5px); }
            40%, 60% { transform: translateX(5px); }
          }
        `}</style>
      </div>
    </IOSDevice>
  );
}

// ─── Home ─────────────────────────────────────────────────────
function Tr_Home() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative' }}>
        <TSF/>

        <div className="scroller" style={{ height:'calc(100% - 54px)', overflowY:'auto', paddingBottom: 90 }}>
          {/* Greeting */}
          <div style={{ padding: '8px 20px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>
                지윤님, 안녕하세요
              </div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 500, color: T.ink2, marginTop: 4, display:'inline-flex', alignItems:'center', gap: 6 }}>
                <WeatherGlyph kind="partly" size={16} color={T.peachDeep}/>
                오늘은 18°·구름 조금
              </div>
            </div>
            <div style={{
              width: 40, height: 40, background: T.card, borderRadius: 20,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: CARD_SHADOW,
            }}>{I.bell(20, T.ink)}</div>
          </div>

          {/* Outfit recommendations — two flat-lay cards side-by-side */}
          <div style={{ padding:'0 20px', display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 17, fontWeight: 800, color: T.ink }}>오늘 입을 만한 코디</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, marginTop: 2 }}>날씨에 맞춰 골라봤어요</div>
            </div>
            <span style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700, color: T.peachInk }}>↻ 다른 추천</span>
          </div>
          <div style={{ padding:'0 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
            <OutfitOption items={['i02','i06','i09','i14']}/>
            <OutfitOption items={['i03','i08','i11','i12']}/>
          </div>

          {/* Quick categories */}
          <div style={{ padding: '24px 20px 0' }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 12 }}>
              빠르게 둘러보기
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 8 }}>
              {[
                { c:'TOP',    l:'상의',   color:'blue'    },
                { c:'BOTTOM', l:'하의',   color:'mint'    },
                { c:'OUTER',  l:'아우터', color:'lavender'},
                { c:'SHOES',  l:'신발',   color:'peach'   },
                { c:'ACC',    l:'잡화',   color:'blue'    },
              ].map(({c, l, color}) => (
                <div key={c} style={{ textAlign:'center' }}>
                  <div style={{
                    width:'100%', aspectRatio:'1', borderRadius: 20,
                    background: T[color],
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <div style={{
                      fontFamily:'var(--sans)', fontSize: 20, fontWeight: 800, color: T[color+'Ink'],
                    }}>{byCat(c).length}</div>
                  </div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink, marginTop: 6 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent outfits */}
          <div style={{ padding: '24px 0 0 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', paddingRight: 20 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 16, fontWeight: 800, color: T.ink }}>최근 코디</div>
              <span style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2 }}>전체 보기</span>
            </div>
            <div style={{ display:'flex', gap: 12, overflowX:'auto', marginTop: 12, paddingBottom: 4, paddingRight: 20 }} className="scroller">
              {OUTFITS.slice(0, 4).map(o => (
                <div key={o.id} style={{
                  flex:'0 0 auto', width: 140, background: T.card,
                  borderRadius: 18, padding: 8, boxShadow: CARD_SHADOW,
                }}>
                  <div style={{ aspectRatio:'1', borderRadius: 12, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 2, background: T.bgSoft }}>
                    {o.items.slice(0, 4).map(id => (
                      <Garment key={id} item={byId(id)} showLabel={false} radius={0}/>
                    ))}
                  </div>
                  <div style={{ padding: '8px 4px 2px' }}>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, lineHeight: 1.25 }}>{o.mood}</div>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink3, marginTop: 2 }}>
                      {o.date.split('·').slice(1).join('/').replace(/·/g,'').trim()} · {o.temp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 12 }}/>
        </div>

        <TTabs active="home"/>
      </div>
    </IOSDevice>
  );
}

// ─── Closet ───────────────────────────────────────────────────
function Tr_Closet() {
  const cat = 'ALL';
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative' }}>
        <TSF/>
        <div style={{ padding:'4px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>내 옷장</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 2 }}>
              {CLOSET.length}벌 · 최근에 추가한 순
            </div>
          </div>
          <div style={{
            width: 40, height: 40, background: T.card, borderRadius: 20,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: CARD_SHADOW,
          }}>{I.search(20, T.ink)}</div>
        </div>

        {/* Category pills */}
        <div style={{ display:'flex', gap: 8, padding:'4px 20px 14px', overflowX:'auto' }} className="scroller">
          {CATS.map((c, i) => (
            <Chip key={c.id} active={i===0} color="peach">
              {c.ko} <span style={{ marginLeft: 5, opacity: 0.7, fontWeight: 600 }}>{byCat(c.id).length}</span>
            </Chip>
          ))}
        </div>

        {/* Grid */}
        <div className="scroller" style={{ height:'calc(100% - 230px)', overflowY:'auto', padding:'0 20px 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
            {CLOSET.map(it => (
              <PhotoCard key={it.id} item={it} badge={`×${it.wears}`}/>
            ))}
          </div>
          <div style={{ height: 90 }}/>
        </div>

        <TTabs active="closet"/>
      </div>
    </IOSDevice>
  );
}

// ─── Item Detail ──────────────────────────────────────────────
function Tr_Item() {
  const it = byId('i04');
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative' }}>
        <TSF/>
        {/* Top nav */}
        <div style={{
          position:'absolute', top: 54, left: 0, right: 0,
          display:'flex', justifyContent:'space-between', padding:'12px 20px', zIndex: 3,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>{I.back(20)}</div>
          <div style={{ display:'flex', gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>{I.heart(20)}</div>
            <div style={{ width: 40, height: 40, borderRadius: 20, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>{I.more(20)}</div>
          </div>
        </div>

        {/* Hero image — fills top, content card pulls up over it */}
        <div style={{ position:'absolute', inset:'54px 0 0 0' }}>
          <div style={{ position:'relative', height: 360, background: it.tone }}>
            <div style={{
              position:'absolute', inset: 0, opacity: 0.05,
              backgroundImage: `repeating-linear-gradient(135deg, transparent 0 8px, ${it.tag} 8px 8.5px)`,
            }}/>
          </div>

          <div className="scroller" style={{
            position:'absolute', top: 320, left: 0, right: 0, bottom: 0,
            background: T.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: '20px 22px 24px', overflowY:'auto',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2 }}>{it.brand}</div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, marginTop: 4, letterSpacing: -0.4 }}>{it.ko}</div>
              </div>
              <div style={{ background: T.peach, color: T.peachInk, padding:'5px 10px', borderRadius: 12, fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700 }}>
                ×{it.wears}회
              </div>
            </div>

            {/* Tags */}
            <div style={{ display:'flex', flexWrap:'wrap', gap: 6, marginTop: 14 }}>
              {it.tags.map(t => <Chip key={t} active={false}>{t}</Chip>)}
            </div>

            {/* Stats row */}
            <div style={{
              marginTop: 16, background: T.card, borderRadius: 20, padding: 16,
              boxShadow: CARD_SHADOW,
              display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 0,
            }}>
              {[
                ['시즌',   it.season],
                ['마지막', '5/12'],
                ['컬러',   '데님'],
              ].map(([k,v], i) => (
                <div key={k} style={{
                  textAlign:'center',
                  borderLeft: i>0 ? `1px solid ${T.line}` : 'none',
                  padding: '2px 0',
                }}>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink2 }}>{k}</div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 700, color: T.ink, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Used in outfits */}
            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 10 }}>
                이 옷이 들어간 코디
              </div>
              <div style={{ display:'flex', gap: 10, overflowX:'auto' }} className="scroller">
                {OUTFITS.filter(o => o.items.includes(it.id)).map(o => (
                  <div key={o.id} style={{
                    flex:'0 0 auto', width: 100, background: T.card,
                    borderRadius: 14, padding: 6, boxShadow: CARD_SHADOW,
                  }}>
                    <div style={{ aspectRatio:'1', borderRadius: 9, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 1 }}>
                      {o.items.slice(0, 4).map(id => <Garment key={id} item={byId(id)} showLabel={false} radius={0}/>)}
                    </div>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink, marginTop: 6, lineHeight: 1.2 }}>{o.mood}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <PrimaryBtn>이 옷으로 코디 만들기 →</PrimaryBtn>
            </div>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── Add Item ─────────────────────────────────────────────────
function Tr_Add() {
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column' }}>
        <TSF/>
        <div style={{ padding:'8px 12px 4px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.close(22)}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>옷 등록하기</div>
          <button style={{ border:'none', background:'transparent', fontFamily:'var(--sans)', fontSize: 14, fontWeight: 700, color: T.peachInk, cursor:'pointer', padding: '0 12px' }}>저장</button>
        </div>

        <div className="scroller" style={{ flex: 1, overflowY:'auto', padding:'12px 20px 30px' }}>
          {/* Photo capture */}
          <div style={{
            aspectRatio:'4/5', borderRadius: 24, background: T.card,
            boxShadow: CARD_SHADOW, position:'relative', overflow:'hidden',
            backgroundImage: `radial-gradient(circle at 50% 50%, ${T.bgSoft} 0%, ${T.card} 70%)`,
          }}>
            <div style={{ position:'absolute', inset: 20, border:`1.5px dashed ${T.ink3}`, borderRadius: 16 }}/>
            <div style={{
              position:'absolute', inset: 0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap: 8,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 32, background: T.primary,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: ELEVATE_SHADOW,
              }}>{I.camera(28, T.primaryInk)}</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink, marginTop: 6 }}>옷 사진 찍기</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2 }}>
                배경은 자동으로 지워드려요
              </div>
            </div>
          </div>

          {/* Source options */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            {[
              { l:'카메라', icon: I.camera },
              { l:'앨범',   icon: I.album  },
              { l:'URL',    icon: (s,c)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M10 14a4 4 0 005.7 0L18 12a4 4 0 00-5.7-5.7L11 7.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M14 10a4 4 0 00-5.7 0L6 12.3A4 4 0 0011.7 18l1.3-1.3" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg> },
            ].map(({l, icon}) => (
              <div key={l} style={{
                background: T.card, borderRadius: 16, padding:'12px 0',
                boxShadow: CARD_SHADOW, display:'flex', flexDirection:'column',
                alignItems:'center', gap: 4,
              }}>
                {icon(20, T.ink2)}
                <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Quick form fields */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>카테고리</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
              {CATS.slice(1).map((c, i) => (
                <Chip key={c.id} active={i===0} color="blue">{c.ko}</Chip>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>이름</div>
            <div style={{
              background: T.card, borderRadius: 16, padding: '14px 16px', boxShadow: CARD_SHADOW,
              fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600, color: T.ink,
            }}>오버사이즈 후디</div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>브랜드</div>
            <div style={{
              background: T.card, borderRadius: 16, padding: '14px 16px', boxShadow: CARD_SHADOW,
              fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600, color: T.ink,
            }}>STUSSY</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>태그</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
              {['#오트','#오버핏','#스트릿'].map(t => <Chip key={t} active>{t}</Chip>)}
              <Chip>+ 추가</Chip>
            </div>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── Outfit Builder ───────────────────────────────────────────
function Tr_Build() {
  const slots = [
    { key:'TOP',    l:'상의',   id:'i01', color:'blue'    },
    { key:'BOTTOM', l:'하의',   id:'i07', color:'mint'    },
    { key:'SHOES',  l:'신발',   id:'i11', color:'peach'   },
    { key:'ACC',    l:'잡화',   id:'i12', color:'lavender'},
  ];
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative' }}>
        <TSF/>
        <div style={{ padding:'4px 20px 4px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>오늘의 코디</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 2 }}>
              슬롯을 탭해서 옷을 골라요
            </div>
          </div>
        </div>

        <div className="scroller" style={{ height:'calc(100% - 120px)', overflowY:'auto', padding:'16px 20px 100px' }}>
          {/* 4 slot grid */}
          <div style={{
            background: T.card, borderRadius: 24, padding: 14,
            boxShadow: CARD_SHADOW,
            display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10,
          }}>
            {slots.map(s => {
              const it = byId(s.id);
              return (
                <div key={s.key} style={{ position:'relative' }}>
                  <div style={{
                    position:'absolute', top: 8, left: 8,
                    background: T[s.color], color: T[s.color+'Ink'], borderRadius: 11,
                    padding: '3px 9px', fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700,
                    zIndex: 2,
                  }}>{s.l}</div>
                  <div style={{ aspectRatio:'3/4', borderRadius: 14, overflow:'hidden', background: it.tone, position:'relative' }}>
                    <div style={{
                      position:'absolute', inset: 0, opacity: 0.05,
                      backgroundImage: `repeating-linear-gradient(135deg, transparent 0 7px, ${it.tag} 7px 7.5px)`,
                    }}/>
                  </div>
                  <div style={{ padding:'8px 4px 2px' }}>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, lineHeight: 1.25 }}>{it.ko}</div>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink3 }}>{it.brand}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mood */}
          <div style={{
            marginTop: 14, background: T.card, borderRadius: 18, padding: 16,
            boxShadow: CARD_SHADOW,
          }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2 }}>오늘의 무드</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink, marginTop: 4 }}>
              비 오는 화요일 ☔
            </div>
          </div>

          {/* Suggestions */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 800, color: T.ink }}>이런 조합은 어때요?</div>
              <span style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700, color: T.peachInk }}>↻ 다시</span>
            </div>
            <div style={{ display:'flex', gap: 10, overflowX:'auto' }} className="scroller">
              {[['i02','i06','i09','i14'], ['i03','i08','i10','i12'], ['i01','i07','i11','i15']].map((ids, k) => (
                <div key={k} style={{
                  flex:'0 0 auto', width: 130, background: T.card,
                  borderRadius: 18, padding: 8, boxShadow: CARD_SHADOW,
                }}>
                  <div style={{ aspectRatio:'1', borderRadius: 12, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 2 }}>
                    {ids.map(id => <Garment key={id} item={byId(id)} showLabel={false} radius={0}/>)}
                  </div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700, color: T.ink, marginTop: 6 }}>코디 {k+1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA bar */}
        <div style={{
          position:'absolute', left: 0, right: 0, bottom: 0,
          padding: '12px 20px 30px', background:`linear-gradient(0deg, ${T.bg} 65%, rgba(255,255,255,0) 100%)`,
          display:'flex', gap: 8, zIndex: 4,
        }}>
          <GhostBtn style={{ flex: 1 }}>저장만</GhostBtn>
          <PrimaryBtn style={{ flex: 1.4 }}>입었어요 ✓</PrimaryBtn>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── Calendar / Log ───────────────────────────────────────────
function Tr_Log() {
  const outfitDates = [2,5,8,10,12,14,17];
  const weeks = [];
  let day = -3;
  for (let r=0;r<5;r++) {
    const row = [];
    for (let c=0;c<7;c++) { day++; row.push(day>=1 && day<=31 ? day : null); }
    weeks.push(row);
  }
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative' }}>
        <TSF/>
        <div style={{ padding:'4px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>코디 기록</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 2 }}>2026년 5월 · 7번 입었어요</div>
          </div>
          <div style={{
            width: 40, height: 40, background: T.card, borderRadius: 20,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: CARD_SHADOW, fontFamily:'var(--sans)', fontSize: 16, fontWeight: 800, color: T.ink,
          }}>5</div>
        </div>

        <div className="scroller" style={{ height:'calc(100% - 160px)', overflowY:'auto', padding:'0 20px 20px' }}>
          {/* Calendar card */}
          <div style={{
            background: T.card, borderRadius: 24, padding: 18, boxShadow: CARD_SHADOW,
          }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 4, fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink3, textAlign:'center', marginBottom: 6 }}>
              {['일','월','화','수','목','금','토'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 4 }}>
              {weeks.flat().map((d, i) => {
                const has = d && outfitDates.includes(d);
                const o = has ? OUTFITS.find(o => parseInt(o.date.split('·')[2])===d) : null;
                const today = d === 18;
                return (
                  <div key={i} style={{
                    aspectRatio:'1', position:'relative',
                    background: has ? T.bgSoft : 'transparent',
                    borderRadius: 12,
                    border: today ? `2px solid ${T.primary}` : 'none',
                    overflow:'hidden',
                  }}>
                    {d && (
                      <div style={{
                        position:'absolute', top: 4, left: 6,
                        fontFamily:'var(--sans)', fontSize: 11, fontWeight: today ? 800 : 600,
                        color: today ? T.peachInk : (has ? T.ink : T.ink3), zIndex: 1,
                      }}>{d}</div>
                    )}
                    {o && (
                      <div style={{ position:'absolute', inset:'18px 4px 4px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 1, borderRadius: 8, overflow:'hidden' }}>
                        {o.items.slice(0,4).map(id => <Garment key={id} item={byId(id)} showLabel={false} radius={0}/>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent looks list */}
          <div style={{ marginTop: 18, marginBottom: 6, fontFamily:'var(--sans)', fontSize: 15, fontWeight: 800, color: T.ink }}>
            이 달의 코디
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
            {OUTFITS.map(o => (
              <div key={o.id} style={{
                background: T.card, borderRadius: 20, padding: 12, boxShadow: CARD_SHADOW,
                display:'flex', gap: 12, alignItems:'center',
              }}>
                <div style={{ width: 72, aspectRatio:'1', borderRadius: 12, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 1, flexShrink: 0 }}>
                  {o.items.slice(0,4).map(id => <Garment key={id} item={byId(id)} showLabel={false} radius={0}/>)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 700, color: T.ink }}>{o.mood}</div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 3, display:'inline-flex', alignItems:'center', gap: 6 }}>
                    <WeatherGlyph kind={o.weather} size={11} color={T.ink2}/> {o.date.replace(/·/g, '/')} · {o.temp}
                  </div>
                </div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink3 }}>›</div>
              </div>
            ))}
          </div>
        </div>

        <TTabs active="log"/>
      </div>
    </IOSDevice>
  );
}

// ─── Profile / Me ─────────────────────────────────────────────
function Tr_Me() {
  const totalWears = CLOSET.reduce((a,b)=>a+b.wears, 0);
  const ranked = [...CLOSET].sort((a,b)=>b.wears-a.wears).slice(0,4);
  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative' }}>
        <TSF/>

        <div className="scroller" style={{ height:'calc(100% - 54px)', overflowY:'auto', paddingBottom: 100 }}>
          {/* Profile header */}
          <div style={{ padding:'8px 20px 18px', display:'flex', alignItems:'center', gap: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 32, background: T.peach,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--sans)', fontSize: 24, fontWeight: 800, color: T.peachInk,
            }}>지</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 18, fontWeight: 800, color: T.ink }}>지윤님</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, marginTop: 2 }}>
                옷장 시작한 지 35일째 · 7번 코디
              </div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 18, background: T.card,
              display:'flex', alignItems:'center', justifyContent:'center', boxShadow: CARD_SHADOW,
            }}>{I.more(18, T.ink2)}</div>
          </div>

          {/* Stat cards */}
          <div style={{ padding:'0 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
            <div style={{ background: T.blue, borderRadius: 20, padding: 16 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.blueInk }}>옷장 속 옷</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 28, fontWeight: 800, color: T.blueInk, marginTop: 6, letterSpacing: -0.5 }}>{CLOSET.length}벌</div>
            </div>
            <div style={{ background: T.mint, borderRadius: 20, padding: 16 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.mintInk }}>저장한 코디</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 28, fontWeight: 800, color: T.mintInk, marginTop: 6, letterSpacing: -0.5 }}>{OUTFITS.length}개</div>
            </div>
            <div style={{ background: T.peach, borderRadius: 20, padding: 16 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.peachInk }}>총 입은 횟수</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 28, fontWeight: 800, color: T.peachInk, marginTop: 6, letterSpacing: -0.5 }}>{totalWears}회</div>
            </div>
            <div style={{ background: T.lavender, borderRadius: 20, padding: 16 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.lavenderInk }}>이번 달 활동</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 28, fontWeight: 800, color: T.lavenderInk, marginTop: 6, letterSpacing: -0.5 }}>7회</div>
            </div>
          </div>

          {/* Most worn */}
          <div style={{ padding:'24px 20px 0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 12 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 16, fontWeight: 800, color: T.ink }}>가장 많이 입은 옷</div>
              <span style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2 }}>이번 달</span>
            </div>
            <div style={{ background: T.card, borderRadius: 20, padding: 4, boxShadow: CARD_SHADOW }}>
              {ranked.map((it, i, arr) => (
                <div key={it.id} style={{
                  display:'flex', gap: 12, alignItems:'center', padding:'10px 12px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
                }}>
                  <div style={{
                    width: 22, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 800,
                    color: i === 0 ? T.peachInk : T.ink3,
                  }}>{i+1}</div>
                  <div style={{ width: 44, aspectRatio:'1', borderRadius: 10, overflow:'hidden', flexShrink: 0 }}>
                    <Garment item={it} showLabel={false} radius={0}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 700, color: T.ink }}>{it.ko}</div>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2 }}>{it.brand}</div>
                  </div>
                  <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink }}>×{it.wears}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings rows */}
          <div style={{ padding:'24px 20px 0' }}>
            <div style={{ background: T.card, borderRadius: 20, padding: 4, boxShadow: CARD_SHADOW }}>
              {['알림 설정','테마','데이터 백업','도움말','로그아웃'].map((l, i, arr) => (
                <div key={l} style={{
                  display:'flex', alignItems:'center', padding:'14px 16px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none',
                  fontFamily:'var(--sans)', fontSize: 14, fontWeight: 500,
                  color: i === arr.length - 1 ? T.peachInk : T.ink,
                }}>
                  <div style={{ flex: 1 }}>{l}</div>
                  {i < arr.length - 1 && <div style={{ color: T.ink3, fontSize: 16 }}>›</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <TTabs active="me"/>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { Tr_Login, Tr_Home, Tr_Closet, Tr_Item, Tr_Add, Tr_Build, Tr_Log, Tr_Me, T, CARD_SHADOW, ELEVATE_SHADOW, I, Chip, PhotoCard, PrimaryBtn, GhostBtn, TTabs, TSF, PinDots, NumPad, NumKey, OutfitOption });
