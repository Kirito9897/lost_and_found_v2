/* ═══════════════════════════════════════════════════════════
   data.js — DEMO DATA LAYER
   ⚠ SAMPLE RECORDS FOR FRONTEND DEVELOPMENT ONLY.
   Replace window.LFStore with calls to your Flask/PyMySQL API:
     e.g. fetch('/api/reports').then(...) etc.
   Field names below mirror the expected DB columns so the
   swap is mechanical. Keep public/private separation:
   public → title, category, type, date, location, status, image
   private → contact, verify questions (admin/owner only)
   ═══════════════════════════════════════════════════════════ */
(function(){
'use strict';

const SAMPLE_ITEMS = [
  {id:'LF-2026-001',title:'Silver Wristwatch',category:'Electronics',type:'lost',date:'2026-10-13',location:'New Building, Vijay Foundation',status:'pending',description:'Silver analog wristwatch with a metal strap. Left on a desk near the window.',image:'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=60&auto=format&fit=crop'},
  {id:'LF-2026-002',title:'Engineering Textbook',category:'Books / Stationery',type:'lost',date:'2026-10-23',location:'Classroom No. 302',status:'verified',description:'Hardcover thermodynamics textbook, name written on the first page.',image:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=60&auto=format&fit=crop'},
  {id:'LF-2026-003',title:'Black Water Bottle',category:'Other',type:'lost',date:'2026-10-01',location:'Main Campus Grounds',status:'pending',description:'Insulated steel bottle with minor dents and a campus sticker.',image:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=60&auto=format&fit=crop'},
  {id:'LF-2026-004',title:'Wireless Earbuds Case',category:'Electronics',type:'found',date:'2026-10-03',location:'Near Katraj Parking',status:'pending',description:'White earbuds charging case found on a bench. Case only, no buds.',image:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=60&auto=format&fit=crop'},
  {id:'LF-2026-005',title:'Scientific Calculator',category:'Books / Stationery',type:'lost',date:'2026-10-05',location:'Classroom No. 4',status:'returned',description:'FX-991 calculator in a grey pouch with initials on the back.',image:'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&q=60&auto=format&fit=crop'},
  {id:'LF-2026-006',title:'Blue Umbrella',category:'Other',type:'found',date:'2026-10-10',location:'Central Library, Ground Floor',status:'verified',description:'Foldable navy umbrella left near the reading tables.',image:'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=60&auto=format&fit=crop'},
  {id:'LF-2026-007',title:'Student ID Card',category:'Documents',type:'found',date:'2026-10-12',location:'Cafeteria, Block B',status:'pending',description:'Student ID found under a table. Name withheld for privacy — describe yours to claim.',image:'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=60&auto=format&fit=crop'},
  {id:'LF-2026-008',title:'Leather Wallet',category:'Other',type:'lost',date:'2026-10-14',location:'Sports Complex',status:'pending',description:'Brown bifold wallet. Contains cards and a small photo.',image:'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=60&auto=format&fit=crop'},
];

/* Demo store backed by localStorage */
const KEY='lf_reports_v1';
function load(){ try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]} }
function save(r){ localStorage.setItem(KEY,JSON.stringify(r)); }
if(!localStorage.getItem(KEY)) save(SAMPLE_ITEMS);

const pad=n=>String(n).padStart(3,'0');

window.LFStore = {
  all(){ return load(); },
  get(id){ return load().find(r=>r.id===id)||null; },
  /* → connect to Flask: POST /api/reports */
  create(data){
    const r=load();
    const item={
      id:'LF-2026-'+pad(r.length+1),
      status:'pending',
      ...data
    };
    r.unshift(item); save(r); return item;
  },
  /* → connect to Flask: PATCH /api/reports/:id (admin) */
  setStatus(id,status){
    const r=load(); const it=r.find(x=>x.id===id);
    if(it){it.status=status;save(r);} return it;
  },
  mine(email){
    /* → connect to Flask: GET /api/my-reports (session-authenticated) */
    const mine=JSON.parse(localStorage.getItem('lf_mine_'+email)||'[]');
    return load().filter(r=>mine.includes(r.id));
  },
  markMine(email,id){
    const k='lf_mine_'+email; const a=JSON.parse(localStorage.getItem(k)||'[]');
    if(!a.includes(id)){a.push(id);localStorage.setItem(k,JSON.stringify(a));}
  },
  /* Simple category-based match suggestions — mirrors existing suggestion logic */
  matches(id){
    const it=this.get(id); if(!it) return [];
    return load().filter(r=>r.id!==id && r.category===it.category && r.type!==it.type && r.status!=='returned');
  },
  resetDemo(){ save(SAMPLE_ITEMS); Object.keys(localStorage).filter(k=>k.startsWith('lf_mine_')).forEach(k=>localStorage.removeItem(k)); }
};

/* Demo auth — ⚠ REPLACE with your existing session-based auth.
   Never store plaintext passwords in production; this demo only
   keeps an in-memory flag. */
window.LFAuth = {
  register(name,email){
    localStorage.setItem('lf_auth',JSON.stringify({name,email,role:'user'}));
  },
  login(email,pw,role){
    /* → connect to Flask: POST /login (sets HttpOnly session cookie) */
    if(!email||!pw) return {ok:false,msg:'Email and password are required.'};
    const name=email.split('@')[0];
    localStorage.setItem('lf_auth',JSON.stringify({name,email,role:role||'user'}));
    return {ok:true};
  },
  logout(){ localStorage.removeItem('lf_auth'); location.href='index.html'; },
  current(){ return JSON.parse(localStorage.getItem('lf_auth')||'null'); },
  require(role){
    const a=this.current();
    if(!a){location.href='login.html';return null;}
    if(role&&a.role!==role){location.href='index.html';return null;}
    return a;
  }
};
})();
