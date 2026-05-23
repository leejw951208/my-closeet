// ─────────────────────────────────────────────────────────────
// INTERACTIVE PROTOTYPE (Trendy direction)
// Reuses trendy.jsx primitives. Bottom-tab navigation, tap an
// item → detail, tap a slot → picker, save an outfit → log.
// ─────────────────────────────────────────────────────────────

function Prototype() {
  const [tab, setTab] = React.useState('home');
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [closet, setCloset] = React.useState(CLOSET);
  const [outfits, setOutfits] = React.useState(OUTFITS);
  const [cat, setCat] = React.useState('ALL');
  const [build, setBuild] = React.useState({ TOP:'i02', BOTTOM:'i06', SHOES:'i09', ACC:'i14' });
  const [openItem, setOpenItem] = React.useState(null);
  const [openOutfit, setOpenOutfit] = React.useState(null);
  const [openAdd, setOpenAdd] = React.useState(false);
  const [pickerCat, setPickerCat] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=>setToast(null), 1800);
  };

  if (!loggedIn) {
    return (
      <IOSDevice>
        <PrLogin onEnter={()=>{ setLoggedIn(true); showToast('환영해요, 지윤님 👋'); }}/>
      </IOSDevice>
    );
  }

  const isModalOpen = openItem || openOutfit || openAdd || pickerCat;

  return (
    <IOSDevice>
      <div style={{ height:'100%', background: T.bg, position:'relative', overflow:'hidden' }}>
        <TSF/>

        {/* Main tab content */}
        <div style={{ position:'absolute', inset:'54px 0 86px 0' }}>
          {tab==='home'   && <PrHome   {...{closet, outfits, setOpenOutfit, setTab, setCat, build, setBuild, setOpenItem, showToast}}/>}
          {tab==='closet' && <PrCloset {...{closet, cat, setCat, setOpenItem}}/>}
          {tab==='build'  && <PrBuild  {...{build, setPickerCat, onSave:(mood)=>{
            const items = ['TOP','BOTTOM','SHOES','ACC'].map(k=>build[k]).filter(Boolean);
            if (!items.length) { showToast('아이템을 골라주세요'); return; }
            const id = 'o' + (outfits.length+1);
            const today = new Date();
            const date = `2026·05·${String(today.getDate()).padStart(2,'0')}`;
            setOutfits(arr => [{ id, date, mood: mood || '오늘의 코디', items, temp:'18°', weather:'partly' }, ...arr]);
            showToast('오늘 입은 코디로 기록했어요 ✓');
            setTab('log');
          }}}/>}
          {tab==='log'    && <PrLog    {...{outfits, setOpenOutfit}}/>}
          {tab==='me'     && <PrMe     {...{closet, outfits, onLogout:()=>setLoggedIn(false)}}/>}
        </div>

        {/* Tab bar */}
        <PrTabs active={tab} onChange={(t)=>{
          if (t==='add') { setOpenAdd(true); return; }
          setTab(t);
        }}/>

        {/* Detail overlay */}
        {openItem && (
          <SlideUpOverlay onClose={()=>setOpenItem(null)}>
            <PrItem
              item={byIdInCloset(closet, openItem)}
              closet={closet}
              outfits={outfits}
              onClose={()=>setOpenItem(null)}
              onMake={()=>{
                const it = byIdInCloset(closet, openItem);
                setBuild(b => ({ ...b, [it.cat]: it.id }));
                setOpenItem(null);
                setTab('build');
                showToast(`${it.ko}을(를) 슬롯에 넣었어요`);
              }}
              onSetOpenItem={setOpenItem}
            />
          </SlideUpOverlay>
        )}

        {/* Outfit detail overlay */}
        {openOutfit && (
          <SlideUpOverlay onClose={()=>setOpenOutfit(null)}>
            <PrOutfit
              outfit={openOutfit}
              closet={closet}
              onClose={()=>setOpenOutfit(null)}
              onWearAgain={()=>{
                const id = 'o' + (outfits.length+1);
                const today = new Date();
                const date = `2026·05·${String(today.getDate()).padStart(2,'0')}`;
                setOutfits(arr => [{ ...openOutfit, id, date }, ...arr]);
                setOpenOutfit(null);
                showToast('오늘 다시 입었어요 ✓');
              }}
            />
          </SlideUpOverlay>
        )}

        {/* Add new item overlay */}
        {openAdd && (
          <SlideUpOverlay onClose={()=>setOpenAdd(false)}>
            <PrAdd
              onClose={()=>setOpenAdd(false)}
              onSave={(item)=>{
                setCloset(c => [item, ...c]);
                setOpenAdd(false);
                showToast('옷장에 추가했어요 ✓');
              }}
            />
          </SlideUpOverlay>
        )}

        {/* Slot picker */}
        {pickerCat && (
          <PrPicker
            cat={pickerCat}
            closet={closet}
            current={build[pickerCat]}
            onPick={(id)=>{ setBuild(b => ({ ...b, [pickerCat]: id })); setPickerCat(null); }}
            onClose={()=>setPickerCat(null)}
          />
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position:'absolute', left:'50%', bottom: 110, transform:'translateX(-50%)',
            background: T.ink, color: T.card, padding:'12px 18px', borderRadius: 22,
            fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600, zIndex: 100,
            boxShadow: ELEVATE_SHADOW, whiteSpace:'nowrap',
          }}>{toast}</div>
        )}

        <style>{`
          @keyframes prSlideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes prFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>
    </IOSDevice>
  );
}

function byIdInCloset(closet, id) { return closet.find(it => it.id === id); }

// ─── Overlay wrapper ──────────────────────────────────────────
function SlideUpOverlay({ children, onClose }) {
  return (
    <div style={{
      position:'absolute', inset: 0, background: T.bg, zIndex: 50,
      animation: 'prSlideUp 280ms cubic-bezier(.2,.7,.2,1)',
    }}>
      {children}
    </div>
  );
}

// ─── Login (PIN entry) ────────────────────────────────────────
function PrLogin({ onEnter }) {
  const [pin, setPin] = React.useState('');
  const [shake, setShake] = React.useState(false);

  const handleDigit = (d) => {
    if (pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 6) {
      // Demo: any 6 digits unlocks. Real app would verify here.
      setTimeout(() => onEnter(), 220);
    }
  };
  const handleDelete = () => setPin(p => p.slice(0, -1));
  const handleBio = () => {
    // Demo biometric — quick shake to show "wrong", then unlock.
    setShake(true);
    setTimeout(() => { setShake(false); onEnter(); }, 360);
  };

  return (
    <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column', padding:'0 24px' }}>
      <div style={{ height: 54 }}/>

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
      <div style={{ marginTop: 36, marginBottom:'auto' }}>
        <PinDots length={pin.length} shake={shake}/>
      </div>

      {/* NumPad */}
      <div style={{ paddingBottom: 24 }}>
        <NumPad onDigit={handleDigit} onDelete={handleDelete} onBio={handleBio}/>
        <div style={{ marginTop: 18, textAlign:'center' }}>
          <button onClick={onEnter} style={{
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
  );
}

// ─── Home (interactive) ───────────────────────────────────────
function PrHome({ closet, outfits, setOpenOutfit, setTab, setCat, build, setBuild, setOpenItem, showToast }) {
  const wearOutfit = (items, label) => {
    const slots = { TOP: null, BOTTOM: null, SHOES: null, ACC: null };
    items.forEach(id => {
      const it = byIdInCloset(closet, id);
      if (!it) return;
      if (it.cat === 'OUTER') slots.TOP = slots.TOP || id;
      else if (it.cat in slots) slots[it.cat] = id;
    });
    setBuild(slots);
    setTab('build');
    showToast && showToast(`${label} 코디를 골랐어요`);
  };
  return (
    <div className="scroller" style={{ height:'100%', overflowY:'auto', paddingBottom: 16 }}>
      <div style={{ padding:'8px 20px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>지윤님, 안녕하세요</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 500, color: T.ink2, marginTop: 4, display:'inline-flex', alignItems:'center', gap: 6 }}>
            <WeatherGlyph kind="partly" size={16} color={T.peachDeep}/>
            오늘은 18°·구름 조금
          </div>
        </div>
        <div style={{
          width: 40, height: 40, background: T.card, borderRadius: 20,
          display:'flex', alignItems:'center', justifyContent:'center', boxShadow: CARD_SHADOW,
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
        <OutfitOption
          items={['i02','i06','i09','i14']}
          onSelect={()=>wearOutfit(['i02','i06','i09','i14'], '캐주얼')}
        />
        <OutfitOption
          items={['i03','i08','i11','i12']}
          onSelect={()=>wearOutfit(['i03','i08','i11','i12'], '편하게')}
        />
      </div>

      {/* Quick categories */}
      <div style={{ padding:'24px 20px 0' }}>
        <div style={{ fontFamily:'var(--sans)', fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 12 }}>빠르게 둘러보기</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 8 }}>
          {[
            { c:'TOP',    l:'상의',   color:'blue'     },
            { c:'BOTTOM', l:'하의',   color:'mint'     },
            { c:'OUTER',  l:'아우터', color:'lavender' },
            { c:'SHOES',  l:'신발',   color:'peach'    },
            { c:'ACC',    l:'잡화',   color:'blue'     },
          ].map(({c, l, color}) => (
            <button key={c} onClick={()=>{ setCat(c); setTab('closet'); }} style={{
              background:'transparent', border:'none', padding: 0, cursor:'pointer', textAlign:'center',
            }}>
              <div style={{
                width:'100%', aspectRatio:'1', borderRadius: 20,
                background: T[color], display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <div style={{ fontFamily:'var(--sans)', fontSize: 20, fontWeight: 800, color: T[color+'Ink'] }}>{closet.filter(it => it.cat===c).length}</div>
              </div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink, marginTop: 6 }}>{l}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent outfits */}
      <div style={{ padding:'24px 0 0 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', paddingRight: 20 }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 16, fontWeight: 800, color: T.ink }}>최근 코디</div>
          <button onClick={()=>setTab('log')} style={{ background:'transparent', border:'none', fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2, cursor:'pointer' }}>전체 보기</button>
        </div>
        <div style={{ display:'flex', gap: 12, overflowX:'auto', marginTop: 12, paddingBottom: 4, paddingRight: 20 }} className="scroller">
          {outfits.slice(0, 5).map(o => (
            <button key={o.id} onClick={()=>setOpenOutfit(o)} style={{
              flex:'0 0 auto', width: 140, background: T.card,
              borderRadius: 18, padding: 8, boxShadow: CARD_SHADOW,
              border:'none', cursor:'pointer', textAlign:'left',
            }}>
              <div style={{ aspectRatio:'1', borderRadius: 12, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 2 }}>
                {o.items.slice(0, 4).map(id => {
                  const it = byIdInCloset(closet, id);
                  return it ? <Garment key={id} item={it} showLabel={false} radius={0}/> : <div key={id} style={{background:T.bgSoft}}/>;
                })}
              </div>
              <div style={{ padding:'8px 4px 2px' }}>
                <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, lineHeight: 1.25 }}>{o.mood}</div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink3, marginTop: 2 }}>{o.date.replace(/·/g,'/')} · {o.temp}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 24 }}/>
    </div>
  );
}

// ─── Closet (interactive) ─────────────────────────────────────
function PrCloset({ closet, cat, setCat, setOpenItem }) {
  const items = cat === 'ALL' ? closet : closet.filter(it => it.cat === cat);
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'4px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>내 옷장</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 2 }}>{items.length}벌</div>
        </div>
        <div style={{
          width: 40, height: 40, background: T.card, borderRadius: 20,
          display:'flex', alignItems:'center', justifyContent:'center', boxShadow: CARD_SHADOW,
        }}>{I.search(20, T.ink)}</div>
      </div>

      <div style={{ display:'flex', gap: 8, padding:'4px 20px 14px', overflowX:'auto' }} className="scroller">
        {CATS.map(c => {
          const n = c.id==='ALL' ? closet.length : closet.filter(it => it.cat===c.id).length;
          const active = c.id === cat;
          return (
            <button key={c.id} onClick={()=>setCat(c.id)} style={{
              border:'none', background:'transparent', padding: 0, cursor:'pointer',
            }}>
              <Chip active={active} color="peach">{c.ko} <span style={{ marginLeft: 4, opacity: 0.7, fontWeight: 600 }}>{n}</span></Chip>
            </button>
          );
        })}
      </div>

      <div className="scroller" style={{ flex: 1, overflowY:'auto', padding:'0 20px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
          {items.map(it => (
            <PhotoCard key={it.id} item={it} badge={`×${it.wears}`} onClick={()=>setOpenItem(it.id)}/>
          ))}
        </div>
        {items.length === 0 && (
          <div style={{ padding:'40px 0', textAlign:'center', fontFamily:'var(--sans)', fontSize: 14, color: T.ink2 }}>
            이 카테고리에 옷이 없어요
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Item detail ──────────────────────────────────────────────
function PrItem({ item, closet, outfits, onClose, onMake, onSetOpenItem }) {
  if (!item) return null;
  const usedIn = outfits.filter(o => o.items.includes(item.id));
  return (
    <div style={{ height:'100%', background: T.bg, position:'relative' }}>
      <div style={{ height: 54 }}/>

      <div style={{
        position:'absolute', top: 54, left: 0, right: 0,
        display:'flex', justifyContent:'space-between', padding:'12px 20px', zIndex: 3,
      }}>
        <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 20, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer' }}>{I.back(20)}</button>
        <div style={{ display:'flex', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>{I.heart(20)}</div>
          <div style={{ width: 40, height: 40, borderRadius: 20, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>{I.more(20)}</div>
        </div>
      </div>

      <div style={{ position:'absolute', inset:'54px 0 0 0' }}>
        <div style={{ position:'relative', height: 360, background: item.tone }}>
          <div style={{ position:'absolute', inset: 0, opacity: 0.05, backgroundImage: `repeating-linear-gradient(135deg, transparent 0 8px, ${item.tag} 8px 8.5px)` }}/>
        </div>

        <div className="scroller" style={{
          position:'absolute', top: 320, left: 0, right: 0, bottom: 0,
          background: T.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding:'20px 22px 24px', overflowY:'auto',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2 }}>{item.brand}</div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, marginTop: 4, letterSpacing: -0.4 }}>{item.ko}</div>
            </div>
            <div style={{ background: T.peach, color: T.peachInk, padding:'5px 10px', borderRadius: 12, fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700 }}>×{item.wears}회</div>
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', gap: 6, marginTop: 14 }}>
            {item.tags.map(t => <Chip key={t}>{t}</Chip>)}
          </div>

          <div style={{ marginTop: 16, background: T.card, borderRadius: 20, padding: 16, boxShadow: CARD_SHADOW, display:'grid', gridTemplateColumns:'1fr 1fr 1fr' }}>
            {[
              ['시즌',  item.season],
              ['카테고리', CATS.find(c=>c.id===item.cat)?.ko || '—'],
              ['컬러', '—'],
            ].map(([k,v], i) => (
              <div key={k} style={{
                textAlign:'center',
                borderLeft: i>0 ? `1px solid ${T.line}` : 'none', padding:'2px 0',
              }}>
                <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink2 }}>{k}</div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 700, color: T.ink, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>

          {usedIn.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 10 }}>이 옷이 들어간 코디 · {usedIn.length}</div>
              <div style={{ display:'flex', gap: 10, overflowX:'auto' }} className="scroller">
                {usedIn.map(o => (
                  <div key={o.id} style={{
                    flex:'0 0 auto', width: 100, background: T.card,
                    borderRadius: 14, padding: 6, boxShadow: CARD_SHADOW,
                  }}>
                    <div style={{ aspectRatio:'1', borderRadius: 9, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 1 }}>
                      {o.items.slice(0, 4).map(id => {
                        const it = byIdInCloset(closet, id);
                        return it ? <Garment key={id} item={it} showLabel={false} radius={0}/> : <div key={id}/>;
                      })}
                    </div>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.ink, marginTop: 6, lineHeight: 1.2 }}>{o.mood}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 22 }}>
            <PrimaryBtn onClick={onMake}>이 옷으로 코디 만들기 →</PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Outfit detail ────────────────────────────────────────────
function PrOutfit({ outfit, closet, onClose, onWearAgain }) {
  return (
    <div style={{ height:'100%', background: T.bg, position:'relative' }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding:'8px 12px 4px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={onClose} style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer' }}>{I.back(22)}</button>
        <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>{outfit.mood}</div>
        <div style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center' }}>{I.more(22, T.ink)}</div>
      </div>

      <div className="scroller" style={{ height:'calc(100% - 110px)', overflowY:'auto', padding:'8px 20px 28px' }}>
        <div style={{
          background: T.card, borderRadius: 24, padding: 18, boxShadow: CARD_SHADOW,
          textAlign:'center',
        }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink2 }}>{outfit.date.replace(/·/g, '.')}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 24, fontWeight: 800, color: T.ink, marginTop: 6, letterSpacing: -0.4 }}>{outfit.mood}</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, marginTop: 4, display:'inline-flex', alignItems:'center', gap: 6 }}>
            <WeatherGlyph kind={outfit.weather} size={12} color={T.ink2}/> {outfit.temp} · {outfit.items.length}개
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginTop: 18 }}>
            {outfit.items.map(id => {
              const it = byIdInCloset(closet, id);
              if (!it) return null;
              return (
                <div key={id} style={{ aspectRatio:'3/4', borderRadius: 14, overflow:'hidden', position:'relative', background: it.tone }}>
                  <div style={{ position:'absolute', inset: 0, opacity: 0.05, backgroundImage: `repeating-linear-gradient(135deg, transparent 0 6px, ${it.tag} 6px 6.5px)` }}/>
                  <div style={{ position:'absolute', left: 8, bottom: 6, fontFamily:'var(--sans)', fontSize: 10, fontWeight: 700, color: it.tag, opacity: 0.85 }}>{it.ko}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <PrimaryBtn onClick={onWearAgain}>오늘 다시 입기</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Add item ─────────────────────────────────────────────────
function PrAdd({ onClose, onSave }) {
  const [step, setStep] = React.useState('photo');
  const [photoTaken, setPhotoTaken] = React.useState(false);
  const [name, setName] = React.useState('박시 스웻');
  const [brand, setBrand] = React.useState('CHAMPION');
  const [chosenCat, setChosenCat] = React.useState('TOP');
  const [tone, setTone] = React.useState('#E9D9D2');
  const item = {
    id: 'i'+(Math.floor(Math.random()*900)+100),
    ko: name, name, brand, cat: chosenCat, tone, tag: '#3A4358',
    tags:['#피치','#베이직'], season:'봄·가을', wears: 0,
  };

  return (
    <div style={{ height:'100%', background: T.bg, display:'flex', flexDirection:'column' }}>
      <div style={{ height: 54 }}/>
      <div style={{ padding:'8px 12px 4px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={onClose} style={{ width: 40, height: 40, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer' }}>{I.close(22)}</button>
        <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink }}>옷 등록하기</div>
        {step === 'details' ? (
          <button onClick={()=>onSave(item)} style={{ background:'transparent', border:'none', fontFamily:'var(--sans)', fontSize: 14, fontWeight: 700, color: T.peachInk, cursor:'pointer', padding:'0 12px' }}>저장</button>
        ) : (<div style={{ width: 64 }}/>)}
      </div>

      <div className="scroller" style={{ flex: 1, overflowY:'auto', padding:'12px 20px 30px' }}>
        {step === 'photo' && (
          <>
            <button onClick={()=>setPhotoTaken(p=>!p)} style={{
              width:'100%', aspectRatio:'4/5', borderRadius: 24,
              background: photoTaken ? tone : T.card, boxShadow: CARD_SHADOW,
              border:'none', cursor:'pointer', position:'relative', overflow:'hidden',
              backgroundImage: photoTaken ? 'none' : `radial-gradient(circle at 50% 50%, ${T.bgSoft} 0%, ${T.card} 70%)`,
            }}>
              {!photoTaken && (
                <>
                  <div style={{ position:'absolute', inset: 20, border:`1.5px dashed ${T.ink3}`, borderRadius: 16 }}/>
                  <div style={{ position:'absolute', inset: 0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 8 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 32, background: T.primary, display:'flex', alignItems:'center', justifyContent:'center', boxShadow: ELEVATE_SHADOW }}>{I.camera(28, T.primaryInk)}</div>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink, marginTop: 6 }}>옷 사진 찍기</div>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2 }}>(데모 — 탭하면 색이 들어와요)</div>
                  </div>
                </>
              )}
              {photoTaken && (
                <>
                  <div style={{ position:'absolute', inset: 0, opacity: 0.06, backgroundImage:'repeating-linear-gradient(135deg, transparent 0 6px, #3A4358 6px 6.5px)' }}/>
                  <div style={{ position:'absolute', top: 14, left: 14, background: T.card, borderRadius: 12, padding:'4px 10px', fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, color: T.mintInk }}>✓ 배경 제거됨</div>
                </>
              )}
            </button>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
              {[
                { l:'카메라', icon: I.camera },
                { l:'앨범',   icon: I.album  },
                { l:'URL',    icon: (s,c)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M10 14a4 4 0 005.7 0L18 12a4 4 0 00-5.7-5.7L11 7.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M14 10a4 4 0 00-5.7 0L6 12.3A4 4 0 0011.7 18l1.3-1.3" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg> },
              ].map(({l, icon}) => (
                <button key={l} onClick={()=>setPhotoTaken(true)} style={{
                  background: T.card, borderRadius: 16, padding:'12px 0',
                  boxShadow: CARD_SHADOW, display:'flex', flexDirection:'column',
                  alignItems:'center', gap: 4, border:'none', cursor:'pointer',
                }}>
                  {icon(20, T.ink2)}
                  <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink }}>{l}</div>
                </button>
              ))}
            </div>

            <PrimaryBtn style={{ marginTop: 22, opacity: photoTaken ? 1 : 0.45 }} onClick={()=>photoTaken && setStep('details')}>다음 — 정보 입력</PrimaryBtn>
          </>
        )}

        {step === 'details' && (
          <>
            <div style={{ aspectRatio:'4/3', borderRadius: 20, background: tone, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset: 0, opacity: 0.06, backgroundImage:'repeating-linear-gradient(135deg, transparent 0 6px, #3A4358 6px 6.5px)' }}/>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>이름</div>
              <input value={name} onChange={e=>setName(e.target.value)} style={{
                width:'100%', background: T.card, border:'none', boxShadow: CARD_SHADOW,
                borderRadius: 16, padding:'14px 16px',
                fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600, color: T.ink, outline:'none',
              }}/>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>브랜드</div>
              <input value={brand} onChange={e=>setBrand(e.target.value)} style={{
                width:'100%', background: T.card, border:'none', boxShadow: CARD_SHADOW,
                borderRadius: 16, padding:'14px 16px',
                fontFamily:'var(--sans)', fontSize: 14, fontWeight: 600, color: T.ink, outline:'none',
              }}/>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>카테고리</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap: 6 }}>
                {CATS.slice(1).map(c => (
                  <button key={c.id} onClick={()=>setChosenCat(c.id)} style={{ background:'transparent', border:'none', padding: 0, cursor:'pointer' }}>
                    <Chip active={chosenCat===c.id} color="blue">{c.ko}</Chip>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>컬러</div>
              <div style={{ display:'flex', gap: 10 }}>
                {['#E9D9D2','#E4DCC9','#C8D1B5','#B5C8DE','#F2C8A3','#B6CFE6','#D9B5A0'].map(c => (
                  <button key={c} onClick={()=>setTone(c)} style={{
                    width: 36, height: 36, borderRadius: 18, background: c, cursor:'pointer', padding: 0,
                    border: c===tone ? `3px solid ${T.primaryInk}` : `1px solid ${T.line}`,
                  }}/>
                ))}
              </div>
            </div>

            <PrimaryBtn style={{ marginTop: 26 }} onClick={()=>onSave(item)}>옷장에 추가하기</PrimaryBtn>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Build (interactive) ──────────────────────────────────────
function PrBuild({ build, setPickerCat, onSave }) {
  const [mood, setMood] = React.useState('');
  const slots = [
    { key:'TOP',    l:'상의',   color:'blue'    },
    { key:'BOTTOM', l:'하의',   color:'mint'    },
    { key:'SHOES',  l:'신발',   color:'peach'   },
    { key:'ACC',    l:'잡화',   color:'lavender'},
  ];
  return (
    <div style={{ height:'100%', position:'relative' }}>
      <div style={{ padding:'4px 20px 4px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>오늘의 코디</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 2 }}>슬롯을 탭해서 옷을 골라요</div>
        </div>
      </div>

      <div className="scroller" style={{ height:'calc(100% - 80px)', overflowY:'auto', padding:'16px 20px 110px' }}>
        <div style={{
          background: T.card, borderRadius: 24, padding: 14,
          boxShadow: CARD_SHADOW, display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10,
        }}>
          {slots.map(s => {
            const it = build[s.key] ? byId(build[s.key]) : null;
            return (
              <button key={s.key} onClick={()=>setPickerCat(s.key)} style={{
                position:'relative', background:'transparent', border:'none', padding: 0, cursor:'pointer', textAlign:'left',
              }}>
                <div style={{
                  position:'absolute', top: 8, left: 8,
                  background: T[s.color], color: T[s.color+'Ink'], borderRadius: 11,
                  padding:'3px 9px', fontFamily:'var(--sans)', fontSize: 11, fontWeight: 700, zIndex: 2,
                }}>{s.l}</div>
                <div style={{ aspectRatio:'3/4', borderRadius: 14, overflow:'hidden', background: it ? it.tone : T.bgSoft, position:'relative' }}>
                  {it ? (
                    <div style={{ position:'absolute', inset: 0, opacity: 0.05, backgroundImage:`repeating-linear-gradient(135deg, transparent 0 7px, ${it.tag} 7px 7.5px)` }}/>
                  ) : (
                    <div style={{
                      position:'absolute', inset: 0, display:'flex', alignItems:'center', justifyContent:'center',
                      color: T.ink3, fontFamily:'var(--sans)', fontSize: 28, fontWeight: 300,
                    }}>+</div>
                  )}
                </div>
                {it && (
                  <div style={{ padding:'8px 4px 2px' }}>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 700, color: T.ink }}>{it.ko}</div>
                    <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink3 }}>{it.brand}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 14, background: T.card, borderRadius: 18, padding: 16,
          boxShadow: CARD_SHADOW,
        }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2 }}>오늘의 무드</div>
          <input value={mood} onChange={e=>setMood(e.target.value)} placeholder="예) 비 오는 화요일 ☔" style={{
            width:'100%', background:'transparent', border:'none', outline:'none',
            fontFamily:'var(--sans)', fontSize: 15, fontWeight: 700, color: T.ink, marginTop: 4, padding: 0,
          }}/>
        </div>

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

      <div style={{
        position:'absolute', left: 0, right: 0, bottom: 0,
        padding:'12px 20px 16px', background:`linear-gradient(0deg, ${T.bg} 65%, rgba(255,255,255,0) 100%)`,
        display:'flex', gap: 8, zIndex: 4,
      }}>
        <GhostBtn style={{ flex: 1 }}>저장만</GhostBtn>
        <PrimaryBtn style={{ flex: 1.4 }} onClick={()=>onSave(mood)}>입었어요 ✓</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Slot picker ──────────────────────────────────────────────
function PrPicker({ cat, closet, current, onPick, onClose }) {
  const items = closet.filter(it => it.cat === cat);
  const label = CATS.find(c=>c.id===cat)?.ko || cat;
  return (
    <div onClick={onClose} style={{
      position:'absolute', inset: 0, zIndex: 80,
      background:'rgba(0,0,0,0.32)', animation:'prFadeIn 180ms ease',
      display:'flex', flexDirection:'column', justifyContent:'flex-end',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background: T.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding:'14px 20px 28px', maxHeight:'72%', display:'flex', flexDirection:'column',
        animation:'prSlideUp 220ms cubic-bezier(.2,.7,.2,1)',
      }}>
        <div style={{ width: 40, height: 4, background: T.line, borderRadius: 2, margin:'0 auto 14px' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 600, color: T.ink2 }}>슬롯 · {cat}</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 20, fontWeight: 800, color: T.ink, marginTop: 2 }}>{label} 고르기</div>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', padding: 8 }}>{I.close(22, T.ink2)}</button>
        </div>
        <div className="scroller" style={{ overflowY:'auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 10 }}>
            {current && (
              <button onClick={()=>onPick(null)} style={{
                aspectRatio:'3/4', borderRadius: 14, background: T.card,
                boxShadow: `inset 0 0 0 1px ${T.line}`,
                display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap: 4,
                fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T.ink2, cursor:'pointer', border:'none',
              }}>
                <div style={{ fontSize: 18 }}>−</div>비우기
              </button>
            )}
            {items.map(it => (
              <button key={it.id} onClick={()=>onPick(it.id)} style={{
                background:'transparent', border:'none', padding: 0, cursor:'pointer', textAlign:'left', borderRadius: 14, overflow:'hidden',
              }}>
                <div style={{
                  aspectRatio:'3/4', position:'relative', borderRadius: 14, overflow:'hidden',
                  outline: it.id === current ? `3px solid ${T.primary}` : 'none', outlineOffset: -1,
                  background: it.tone,
                }}>
                  <div style={{ position:'absolute', inset: 0, opacity: 0.05, backgroundImage:`repeating-linear-gradient(135deg, transparent 0 6px, ${it.tag} 6px 6.5px)` }}/>
                  {it.id === current && (
                    <div style={{
                      position:'absolute', top: 6, right: 6, background: T.primary, color: T.primaryInk,
                      borderRadius: 11, padding:'3px 8px', fontFamily:'var(--sans)', fontSize: 10, fontWeight: 700,
                    }}>선택</div>
                  )}
                </div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 700, color: T.ink, marginTop: 6 }}>{it.ko}</div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 10, fontWeight: 500, color: T.ink3 }}>{it.brand}</div>
              </button>
            ))}
            {items.length === 0 && (
              <div style={{ gridColumn:'1 / -1', padding:'30px 0', textAlign:'center', fontFamily:'var(--sans)', fontSize: 13, color: T.ink2 }}>
                이 카테고리에 옷이 없어요
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Log (interactive) ────────────────────────────────────────
function PrLog({ outfits, setOpenOutfit }) {
  const outfitDates = outfits.map(o => parseInt(o.date.split('·')[2]));
  const weeks = [];
  let day = -3;
  for (let r=0; r<5; r++) {
    const row = [];
    for (let c=0; c<7; c++) { day++; row.push(day>=1 && day<=31 ? day : null); }
    weeks.push(row);
  }
  return (
    <div className="scroller" style={{ height:'100%', overflowY:'auto', paddingBottom: 16 }}>
      <div style={{ padding:'4px 20px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>코디 기록</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 13, fontWeight: 500, color: T.ink2, marginTop: 2 }}>2026년 5월 · {outfits.length}번</div>
        </div>
        <div style={{
          width: 40, height: 40, background: T.card, borderRadius: 20,
          display:'flex', alignItems:'center', justifyContent:'center', boxShadow: CARD_SHADOW,
          fontFamily:'var(--sans)', fontSize: 16, fontWeight: 800, color: T.ink,
        }}>5</div>
      </div>

      <div style={{ padding:'0 20px' }}>
        <div style={{ background: T.card, borderRadius: 24, padding: 18, boxShadow: CARD_SHADOW }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 4, fontFamily:'var(--sans)', fontSize: 11, fontWeight: 600, color: T.ink3, textAlign:'center', marginBottom: 6 }}>
            {['일','월','화','수','목','금','토'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 4 }}>
            {weeks.flat().map((d, i) => {
              const has = d && outfitDates.includes(d);
              const o = has ? outfits.find(o => parseInt(o.date.split('·')[2])===d) : null;
              const today = d === 18;
              return (
                <button key={i} onClick={()=>{ if (o) setOpenOutfit(o); }} style={{
                  aspectRatio:'1', position:'relative',
                  background: has ? T.bgSoft : 'transparent',
                  borderRadius: 12,
                  border: today ? `2px solid ${T.primary}` : 'none',
                  overflow:'hidden', padding: 0, cursor: o ? 'pointer' : 'default',
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
                      {o.items.slice(0,4).map(id => {
                        const it = byId(id);
                        return it ? <Garment key={id} item={it} showLabel={false} radius={0}/> : <div key={id}/>;
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 18, marginBottom: 6, fontFamily:'var(--sans)', fontSize: 15, fontWeight: 800, color: T.ink }}>
          이 달의 코디
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
          {outfits.map(o => (
            <button key={o.id} onClick={()=>setOpenOutfit(o)} style={{
              background: T.card, borderRadius: 20, padding: 12, boxShadow: CARD_SHADOW,
              display:'flex', gap: 12, alignItems:'center',
              border:'none', cursor:'pointer', textAlign:'left',
            }}>
              <div style={{ width: 72, aspectRatio:'1', borderRadius: 12, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 1, flexShrink: 0 }}>
                {o.items.slice(0,4).map(id => {
                  const it = byId(id);
                  return it ? <Garment key={id} item={it} showLabel={false} radius={0}/> : <div key={id}/>;
                })}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily:'var(--sans)', fontSize: 14, fontWeight: 700, color: T.ink }}>{o.mood}</div>
                <div style={{ fontFamily:'var(--sans)', fontSize: 11, fontWeight: 500, color: T.ink2, marginTop: 3, display:'inline-flex', alignItems:'center', gap: 6 }}>
                  <WeatherGlyph kind={o.weather} size={11} color={T.ink2}/> {o.date.replace(/·/g, '/')} · {o.temp}
                </div>
              </div>
              <div style={{ fontFamily:'var(--sans)', fontSize: 16, fontWeight: 700, color: T.ink3, marginRight: 4 }}>›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Me (interactive) ─────────────────────────────────────────
function PrMe({ closet, outfits, onLogout }) {
  const totalWears = closet.reduce((a,b)=>a+b.wears, 0);
  const ranked = [...closet].sort((a,b)=>b.wears-a.wears).slice(0,4);
  return (
    <div className="scroller" style={{ height:'100%', overflowY:'auto', paddingBottom: 16 }}>
      <div style={{ padding:'8px 20px 18px', display:'flex', alignItems:'center', gap: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: T.peach, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--sans)', fontSize: 24, fontWeight: 800, color: T.peachInk }}>지</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily:'var(--sans)', fontSize: 18, fontWeight: 800, color: T.ink }}>지윤님</div>
          <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 500, color: T.ink2, marginTop: 2 }}>옷장 시작한 지 35일째 · {outfits.length}번 코디</div>
        </div>
      </div>

      <div style={{ padding:'0 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
        {[
          ['옷장 속 옷', closet.length+'벌',  'blue'    ],
          ['저장한 코디', outfits.length+'개', 'mint'    ],
          ['총 입은 횟수', totalWears+'회',    'peach'   ],
          ['이번 달',     outfits.length+'회', 'lavender'],
        ].map(([l, v, color]) => (
          <div key={l} style={{ background: T[color], borderRadius: 20, padding: 16 }}>
            <div style={{ fontFamily:'var(--sans)', fontSize: 12, fontWeight: 600, color: T[color+'Ink'] }}>{l}</div>
            <div style={{ fontFamily:'var(--sans)', fontSize: 28, fontWeight: 800, color: T[color+'Ink'], marginTop: 6, letterSpacing: -0.5 }}>{v}</div>
          </div>
        ))}
      </div>

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
              <div style={{ width: 22, fontFamily:'var(--sans)', fontSize: 13, fontWeight: 800, color: i === 0 ? T.peachInk : T.ink3 }}>{i+1}</div>
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

      <div style={{ padding:'24px 20px 0' }}>
        <div style={{ background: T.card, borderRadius: 20, padding: 4, boxShadow: CARD_SHADOW }}>
          {['알림 설정', '테마', '데이터 백업', '도움말'].map((l, i, arr) => (
            <div key={l} style={{
              display:'flex', alignItems:'center', padding:'14px 16px',
              borderBottom: i < arr.length ? `1px solid ${T.line}` : 'none',
              fontFamily:'var(--sans)', fontSize: 14, fontWeight: 500, color: T.ink,
            }}>
              <div style={{ flex: 1 }}>{l}</div>
              <div style={{ color: T.ink3, fontSize: 16 }}>›</div>
            </div>
          ))}
          <button onClick={onLogout} style={{
            display:'flex', alignItems:'center', padding:'14px 16px', width:'100%',
            background:'transparent', border:'none', cursor:'pointer',
            fontFamily:'var(--sans)', fontSize: 14, fontWeight: 500, color: T.peachInk, textAlign:'left',
          }}>로그아웃</button>
        </div>
      </div>
    </div>
  );
}

// ─── Bottom tab nav ───────────────────────────────────────────
function PrTabs({ active, onChange }) {
  const tabs = [
    { id:'home',   l:'홈',   icon: I.tHome },
    { id:'closet', l:'옷장', icon: I.tCloset },
    { id:'add',    l:'',     plus: true },
    { id:'log',    l:'기록', icon: I.tLog },
    { id:'me',     l:'마이', icon: I.tMe },
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
            <button key={t.id} onClick={()=>onChange(t.id)} style={{
              background:'transparent', border:'none', padding: 0, cursor:'pointer',
              display:'flex', justifyContent:'center', alignItems:'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 24, background: T.primary, color: T.primaryInk,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: ELEVATE_SHADOW, marginTop: -16,
              }}>{I.plus(22, T.primaryInk)}</div>
            </button>
          );
        }
        const on = active === t.id;
        const c = on ? T.ink : T.ink3;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} style={{
            background:'transparent', border:'none', cursor:'pointer', padding: 0,
            display:'flex', flexDirection:'column', alignItems:'center', gap: 4,
            color: c, fontFamily:'var(--sans)', fontSize: 11, fontWeight: on ? 700 : 500,
          }}>
            {t.icon(22, c, on)}
            <span>{t.l}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { Prototype });
