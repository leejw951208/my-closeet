// Shared closet data + helpers — light pastel palette rework.
// All clothing items are rendered as soft pastel color blocks with
// thin labels (placeholder photography).

const CLOSET = [
  { id: 'i01', name: 'Oversized Hoodie',  ko: '오버사이즈 후디', cat: 'TOP',    tone: '#E4DCC9', tag: '#3A4358', tags: ['#오트','#오버핏','#스트릿'],  season: '가을·겨울', wears: 14, brand: 'STUSSY'    },
  { id: 'i02', name: 'Boxy Tee',          ko: '박시 티셔츠',     cat: 'TOP',    tone: '#FFFFFF', tag: '#3A4358', tags: ['#화이트','#박시'],            season: '사계절',    wears: 22, brand: 'YAEGER'    },
  { id: 'i03', name: 'Crewneck Sweat',    ko: '크루넥 스웻',     cat: 'TOP',    tone: '#E9D9D2', tag: '#3A4358', tags: ['#피치','#베이직'],            season: '봄·가을',   wears: 9,  brand: 'CHAMPION'  },
  { id: 'i04', name: 'Denim Trucker',     ko: '데님 트러커',     cat: 'OUTER',  tone: '#B5C8DE', tag: '#FFFFFF', tags: ['#데님','#아우터'],            season: '봄·가을',   wears: 7,  brand: 'LEVI 70505'},
  { id: 'i05', name: 'Coach Jacket',      ko: '코치 자켓',       cat: 'OUTER',  tone: '#C6BFA8', tag: '#3A4358', tags: ['#세이지','#스트릿'],          season: '봄·가을',   wears: 5,  brand: 'NIKE SB'   },
  { id: 'i06', name: 'Cargo Pants',       ko: '카고 팬츠',       cat: 'BOTTOM', tone: '#C8D1B5', tag: '#3A4358', tags: ['#세이지','#와이드'],          season: '사계절',    wears: 11, brand: 'DICKIES'   },
  { id: 'i07', name: 'Indigo Denim',      ko: '인디고 데님',     cat: 'BOTTOM', tone: '#8FA4BD', tag: '#FFFFFF', tags: ['#인디고','#슬림'],            season: '사계절',    wears: 18, brand: 'ACNE'      },
  { id: 'i08', name: 'Wide Selvedge',     ko: '와이드 셀비지',   cat: 'BOTTOM', tone: '#ACBFD3', tag: '#FFFFFF', tags: ['#데님','#와이드'],            season: '봄·가을',   wears: 8,  brand: 'KAPITAL'   },
  { id: 'i09', name: 'Court Lo',          ko: '코트 스니커즈',   cat: 'SHOES',  tone: '#F0EAD9', tag: '#3A4358', tags: ['#크림','#로우'],              season: '사계절',    wears: 25, brand: 'ADIDAS'    },
  { id: 'i10', name: 'Chunky Runner',     ko: '청키 러너',       cat: 'SHOES',  tone: '#D6D3CB', tag: '#3A4358', tags: ['#그레이','#청키'],            season: '사계절',    wears: 6,  brand: 'NEW BAL'   },
  { id: 'i11', name: 'Canvas Hi',         ko: '캔버스 하이',     cat: 'SHOES',  tone: '#D8CEB3', tag: '#3A4358', tags: ['#카키','#하이'],              season: '봄·가을',   wears: 12, brand: 'CONVERSE'  },
  { id: 'i12', name: '6-Panel Cap',       ko: '6패널 캡',        cat: 'ACC',    tone: '#F2C8A3', tag: '#3A4358', tags: ['#피치','#캡'],                season: '사계절',    wears: 30, brand: 'CARHARTT'  },
  { id: 'i13', name: 'Knit Beanie',       ko: '니트 비니',       cat: 'ACC',    tone: '#D9B5A0', tag: '#3A4358', tags: ['#테라코타','#비니'],          season: '겨울',     wears: 4,  brand: 'PATAGONIA' },
  { id: 'i14', name: 'Tote Bag',          ko: '캔버스 토트',     cat: 'ACC',    tone: '#E9DEC8', tag: '#3A4358', tags: ['#베이지','#백'],              season: '사계절',    wears: 16, brand: 'MUJI'      },
  { id: 'i15', name: 'Cross Body',        ko: '크로스 바디',     cat: 'ACC',    tone: '#B6CFE6', tag: '#3A4358', tags: ['#파스텔블루','#백'],          season: '사계절',    wears: 9,  brand: 'PORTER'    },
];

const CATS = [
  { id: 'ALL',    ko: '전체',   en: 'ALL'    },
  { id: 'TOP',    ko: '상의',   en: 'TOPS'   },
  { id: 'OUTER',  ko: '아우터', en: 'OUTER'  },
  { id: 'BOTTOM', ko: '하의',   en: 'BOTTOM' },
  { id: 'SHOES',  ko: '신발',   en: 'SHOES'  },
  { id: 'ACC',    ko: '잡화',   en: 'ACC.'   },
];

const OUTFITS = [
  { id: 'o1', date: '2026·05·12', mood: '비 오는 화요일',   items: ['i01','i07','i11','i12'], temp: '14°', weather: 'rain'  },
  { id: 'o2', date: '2026·05·10', mood: '카페 미팅',        items: ['i02','i06','i09','i14'], temp: '21°', weather: 'sun'   },
  { id: 'o3', date: '2026·05·08', mood: '편한 주말',        items: ['i03','i08','i10'],        temp: '17°', weather: 'cloud' },
  { id: 'o4', date: '2026·05·05', mood: '데이트',           items: ['i04','i02','i07','i09'], temp: '19°', weather: 'sun'   },
  { id: 'o5', date: '2026·05·02', mood: '러닝 후 브런치',   items: ['i05','i06','i10','i12'], temp: '16°', weather: 'cloud' },
  { id: 'o6', date: '2026·04·28', mood: '공원 산책',        items: ['i02','i08','i09','i14'], temp: '20°', weather: 'sun'   },
];

const TODAY_WEATHER = { temp: 18, lo: 12, hi: 21, label: '구름 조금', icon: 'partly', rain: 10, wind: 'NW 3m/s', loc: '서울 · 마포구' };

const byId = (id) => CLOSET.find(it => it.id === id);
const byCat = (cat) => cat === 'ALL' ? CLOSET : CLOSET.filter(it => it.cat === cat);

// Soft pastel garment block. Light by default — labels stay legible against
// the muted backgrounds. Add a subtle inset hairline to give it shape on
// near-white backgrounds.
function Garment({ item, w='100%', h='100%', radius=14, showLabel=true, dim=false, plain=false, style={} }) {
  if (!item) return null;
  return (
    <div style={{
      width: w, height: h, borderRadius: radius, position: 'relative',
      background: item.tone, overflow: 'hidden',
      boxShadow: plain ? 'none' : 'inset 0 0 0 0.5px rgba(58,67,88,0.10)',
      ...style,
    }}>
      <div style={{
        position:'absolute', inset:0, opacity: dim ? 0.10 : 0.05,
        backgroundImage: `repeating-linear-gradient(135deg, transparent 0 6px, ${item.tag} 6px 6.5px)`,
      }}/>
      {showLabel && (
        <div style={{
          position:'absolute', left:8, bottom:6,
          fontFamily:'"JetBrains Mono", ui-monospace, monospace',
          fontSize: 8, letterSpacing: 0.6, color: item.tag,
          textTransform:'uppercase', opacity: 0.7,
        }}>{item.id.toUpperCase()} · {item.brand}</div>
      )}
    </div>
  );
}

function WeatherGlyph({ kind='partly', size=20, color='currentColor' }) {
  const s = { width: size, height: size, display: 'inline-block' };
  if (kind === 'sun')    return <svg style={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" fill={color}/><g stroke={color} strokeWidth="1.6" strokeLinecap="round">{[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180; const x=12+Math.cos(r)*8.5; const y=12+Math.sin(r)*8.5; const x2=12+Math.cos(r)*10.5; const y2=12+Math.sin(r)*10.5; return <line key={a} x1={x} y1={y} x2={x2} y2={y2}/>;})}</g></svg>;
  if (kind === 'rain')   return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M7 14h10a4 4 0 100-8 5 5 0 00-9.5-1A4 4 0 007 14z" fill={color}/><g stroke={color} strokeWidth="1.6" strokeLinecap="round"><line x1="9" y1="17" x2="8" y2="20"/><line x1="13" y1="17" x2="12" y2="20"/><line x1="17" y1="17" x2="16" y2="20"/></g></svg>;
  if (kind === 'cloud')  return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M7 16h10a4 4 0 100-8 5 5 0 00-9.5-1A4 4 0 007 16z" fill={color}/></svg>;
  /* partly */            return <svg style={s} viewBox="0 0 24 24" fill="none"><circle cx="8" cy="9" r="3.5" fill={color}/><path d="M9 18h9a3.5 3.5 0 100-7 4 4 0 00-7.5-.5A3.5 3.5 0 009 18z" fill={color}/></svg>;
}

Object.assign(window, { CLOSET, CATS, OUTFITS, TODAY_WEATHER, byId, byCat, Garment, WeatherGlyph });
