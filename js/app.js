/* app.js — page logic. Demo layer: swap LFStore/LFAuth calls with your Flask API. */
(function(){
'use strict';
const page=document.body.dataset.page;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
const CATS=['Electronics','Books / Stationery','Documents','Clothing','Accessories','Other'];

function statusPill(st){
  return `<span class="status-pill st-${esc(st)}">${esc(st)}</span>`;
}
function typeTag(t){
  return `<span class="tag ${t==='lost'?'tag-lost':'tag-found'}">${t}</span>`;
}
window.cellHTML=r=>`
  <div class="cell-top"><span>${esc(r.id)}</span><span>${fmt(r.date)}</span></div>
  ${typeTag(r.type)} <span class="tag tag-status">${esc(r.status)}</span>
  <h3>${esc(r.title)}</h3>
  <p class="cell-loc">${esc(r.location)}</p>
  ${r.image?`<img class="cell-img" src="${esc(r.image)}" alt="${esc(r.title)}" loading="lazy" onerror="this.remove()">`:''}`;

/* ── BROWSE ── */
if(page==='browse'){
  const grid=$('#browseGrid'), empty=$('#browseEmpty');
  const state={q:'',type:'all',cat:'all',sort:'new'};
  const params=new URLSearchParams(location.search);
  if(params.get('type')){state.type=params.get('type');syncChips('type');}
  if(params.get('cat')){state.cat=params.get('cat');syncChips('cat');}

  function syncChips(kind){
    $$(`[data-kind="${kind}"] .chip`).forEach(c=>
      c.classList.toggle('active',c.dataset.v===state[kind]));
  }
  $$('.chip').forEach(c=>c.addEventListener('click',()=>{
    state[c.closest('[data-kind]').dataset.kind]=c.dataset.v;
    c.parentElement.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
    c.classList.add('active'); render();
  }));
  $('#browseSearch').addEventListener('input',e=>{state.q=e.target.value.toLowerCase();render();});
  $('#browseSort').addEventListener('change',e=>{state.sort=e.target.value;render();});
  $('#browseReset').addEventListener('click',()=>{
    state.q='';state.type='all';state.cat='all';state.sort='new';
    $('#browseSearch').value='';$('#browseSort').value='new';
    syncChips('type');syncChips('cat');render();
  });

  function render(){
    let items=LFStore.all();
    if(state.type!=='all')items=items.filter(i=>i.type===state.type);
    if(state.cat!=='all')items=items.filter(i=>i.category===state.cat);
    if(state.q)items=items.filter(i=>(i.title+i.location+i.id+i.description).toLowerCase().includes(state.q));
    items.sort((a,b)=>state.sort==='old'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
    grid.innerHTML='';
    empty.style.display=items.length?'none':'block';
    items.forEach((r,idx)=>{
      const a=document.createElement('article');
      a.className='item-cell reveal';
      a.dataset.cursor='View →';
      a.innerHTML=cellHTML(r);
      a.style.transitionDelay=''; 
      a.addEventListener('click',()=>location.href='item.html?id='+encodeURIComponent(r.id));
      grid.appendChild(a);
      requestAnimationFrame(()=>{a.style.opacity=1;a.style.transform='none';a.style.transition='opacity .6s ease '+idx*40+'ms, transform .6s ease '+idx*40+'ms';});
    });
  }
  render();
}

/* ── ITEM DETAIL ── */
if(page==='item'){
  const id=new URLSearchParams(location.search).get('id');
  const r=id&&LFStore.get(id);
  const root=$('#detailRoot');
  if(!r){
    root.innerHTML=`<div class="empty-state"><h3>Report not found</h3>
      <p class="mono">ID ${esc(id||'—')} is not in the archive.</p>
      <br><a class="btn" href="browse.html">← Back to browse</a></div>`;
  }else{
    document.title=r.title+' — LOST/FOUND';
    root.innerHTML=`
    <div class="detail-grid">
      <div class="detail-img" data-cursor="Zoom">
        ${r.image?`<img src="${esc(r.image)}" alt="${esc(r.title)}">`:'<span class="mono">No image</span>'}
      </div>
      <div class="detail-info">
        <span class="mono">${esc(r.id)} · ARCHIVE ENTRY</span>
        <h1>${esc(r.title)}</h1>
        <div style="display:flex;gap:8px;margin-bottom:8px">${typeTag(r.type)} ${statusPill(r.status)}</div>
        <dl>
          <div class="detail-row"><dt>Category</dt><dd>${esc(r.category)}</dd></div>
          <div class="detail-row"><dt>Date ${r.type==='lost'?'lost':'found'}</dt><dd>${fmt(r.date)}</dd></div>
          <div class="detail-row"><dt>Location</dt><dd>${esc(r.location)}</dd></div>
          <div class="detail-row"><dt>Description</dt><dd>${esc(r.description)}</dd></div>
          <div class="detail-row"><dt>Next step</dt><dd>${r.type==='lost'
            ?'If you have seen this item, report it as found.'
            :'Sign in and describe the item to start the verification process.'}</dd></div>
        </dl>
        <div class="detail-actions">
          ${LFAuth.current()
            ? `<a class="btn btn-lime" href="contact.html?ref=${encodeURIComponent(r.id)}">I have information <span class="arr">→</span></a>`
            : `<a class="btn btn-lime" href="login.html?next=${encodeURIComponent('item.html?id='+r.id)}">Sign in to claim <span class="arr">→</span></a>`}
          <a class="btn" href="browse.html">← Back to browse</a>
        </div>
      </div>
    </div>`;
  }
}

/* ── REPORT FORMS (lost / found) ── */
if(page==='report'){
  const isLost=document.body.dataset.type==='lost';
  const form=$('#reportForm');
  const fileInput=$('#f_image'), fileInfo=$('#fileInfo');
  fileInput.addEventListener('change',()=>{
    const f=fileInput.files[0];
    if(!f){fileInfo.textContent='';return;}
    const okType=['image/jpeg','image/png','image/webp'].includes(f.type);
    const okSize=f.size<=2*1024*1024;
    if(!okType){fileInfo.textContent='Only JPG, PNG or WebP images.';fileInfo.style.color='#c0392b';fileInput.value='';return;}
    if(!okSize){fileInfo.textContent='Image must be under 2 MB.';fileInfo.style.color='#c0392b';fileInput.value='';return;}
    fileInfo.style.color='';fileInfo.textContent=f.name+' · '+(f.size/1024).toFixed(0)+' KB';
  });

  form.addEventListener('submit',e=>{
    e.preventDefault();
    /* basic duplicate guard: disable while submitting */
    const btn=$('#submitBtn'); btn.disabled=true;
    btn.innerHTML='<span class="spinner"></span> Submitting…';
    let valid=true;
    form.querySelectorAll('[required]').forEach(inp=>{
      const f=inp.closest('.field');
      const bad=!inp.value.trim()||(inp.type==='date'&&new Date(inp.value)>new Date());
      f.classList.toggle('invalid',bad); if(bad)valid=false;
    });
    if(!valid){btn.disabled=false;btn.textContent='Submit report';return;}

    const fd=new FormData(form);
    const item=LFStore.create({
      title:fd.get('title').trim(),
      category:fd.get('category'),
      description:fd.get('description').trim(),
      date:fd.get('date'),
      location:fd.get('location').trim(),
      type:isLost?'lost':'found',
      image:'' /* → upload to your Flask /upload route; store returned URL */
    });
    const a=LFAuth.current(); if(a)LFStore.markMine(a.email,item.id);

    /* ⚠ Never show success before the backend confirms — in the real
       integration this block moves into the fetch().then() handler. */
    setTimeout(()=>{
      form.style.display='none';
      $('#reportDone').style.display='block';
      $('#doneId').textContent=item.id;
      toast('Report '+item.id+' submitted');
    },700);
  });
  $('#reportAgain').addEventListener('click',()=>{form.reset();form.style.display='flex';$('#reportDone').style.display='none';const b=$('#submitBtn');b.disabled=false;b.textContent='Submit report';});
}

/* ── AUTH ── */
if(page==='login'||page==='register'){
  const isReg=page==='register';
  const form=$('#authForm');
  $$('.pw-toggle').forEach(t=>t.addEventListener('click',()=>{
    const i=t.parentElement.querySelector('input');
    i.type=i.type==='password'?'text':'password';
    t.textContent=i.type==='password'?'Show':'Hide';
  }));
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const email=$('#a_email').value.trim(), pw=$('#a_pw').value;
    const alert=$('#authAlert'); alert.className='form-alert';
    if(isReg){
      const name=$('#a_name').value.trim();
      if(name.length<2){alert.textContent='Please enter your name.';alert.classList.add('show');return;}
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){alert.textContent='Enter a valid email address.';alert.classList.add('show');return;}
      if(pw.length<8){alert.textContent='Password must be at least 8 characters.';alert.classList.add('show');return;}
      LFAuth.register(name,email);
      toast('Account created — welcome');
      const next=new URLSearchParams(location.search).get('next');
      location.href=next||'dashboard.html';
    }else{
      const admin=$('#a_admin')&&$('#a_admin').checked;
      const res=LFAuth.login(email,pw,admin?'admin':'user');
      if(!res.ok){alert.textContent=res.msg;alert.classList.add('show');return;}
      toast('Signed in');
      const next=new URLSearchParams(location.search).get('next');
      location.href=next||(admin?'admin.html':'dashboard.html');
    }
  });
}

/* ── USER DASHBOARD ── */
if(page==='dashboard'){
  const a=LFAuth.require('user'); if(!a)throw'';
  $('#dashName').textContent=a.name;
  $('#signOut').addEventListener('click',e=>{e.preventDefault();LFAuth.logout();});
  let tab='all';
  function render(){
    const mine=LFStore.mine(a.email);
    const list=tab==='all'?mine:mine.filter(r=>r.status===tab);
    $('#dashEmpty').style.display=list.length?'none':'block';
    $('#dashTable tbody').innerHTML=list.map(r=>`
      <tr data-cursor="Open →" onclick="location.href='item.html?id=${encodeURIComponent(r.id)}'">
        <td class="mono">${esc(r.id)}</td>
        <td><strong>${esc(r.title)}</strong><br><span class="mono">${esc(r.category)}</span></td>
        <td>${typeTag(r.type)}</td>
        <td>${fmt(r.date)}</td>
        <td>${statusPill(r.status)}</td>
        <td>${r.status==='pending'?'Awaiting review by the archive team.'
            :r.status==='verified'?'Ownership verified — collection being arranged.'
            :'Returned to its owner. Thank you.'}</td>
      </tr>`).join('');
    $$('#dashTabs .chip').forEach(c=>c.classList.toggle('active',c.dataset.v===tab));
  }
  $$('#dashTabs .chip').forEach(c=>c.addEventListener('click',()=>{tab=c.dataset.v;render();}));
  render();
}

/* ── ADMIN ── */
if(page==='admin'){
  const a=LFAuth.require('admin'); if(!a)throw'';
  $('#adminSignOut').addEventListener('click',e=>{e.preventDefault();LFAuth.logout();});
  let fType='all',fStatus='all';
  function render(){
    let items=LFStore.all();
    if(fType!=='all')items=items.filter(i=>i.type===fType);
    if(fStatus!=='all')items=items.filter(i=>i.status===fStatus);
    const all=LFStore.all();
    $('#stTotal').textContent=all.length;
    $('#stPending').textContent=all.filter(i=>i.status==='pending').length;
    $('#stVerified').textContent=all.filter(i=>i.status==='verified').length;
    $('#stReturned').textContent=all.filter(i=>i.status==='returned').length;
    $('#adminTable tbody').innerHTML=items.map(r=>`
      <tr>
        <td class="mono">${esc(r.id)}</td>
        <td><strong>${esc(r.title)}</strong><br><span class="mono">${esc(r.category)}</span></td>
        <td>${typeTag(r.type)}</td>
        <td>${fmt(r.date)}</td><td>${esc(r.location)}</td>
        <td>${statusPill(r.status)}</td>
        <td><div class="table-actions">
          <button class="btn btn-sm" data-s="verified" data-id="${esc(r.id)}">Verify</button>
          <button class="btn btn-sm btn-dark" data-s="returned" data-id="${esc(r.id)}">Return</button>
        </div></td>
      </tr>`).join('');
    $$('#adminTable [data-s]').forEach(b=>b.addEventListener('click',()=>{
      LFStore.setStatus(b.dataset.id,b.dataset.s);
      toast(b.dataset.id+' → '+b.dataset.s); render(); matches();
    }));
    $$('#adminFilters .chip').forEach(c=>c.classList.toggle('active',
      c.dataset.k==='type'?c.dataset.v===fType:c.dataset.v===fStatus));
  }
  $$('#adminFilters .chip').forEach(c=>c.addEventListener('click',()=>{
    if(c.dataset.k==='type')fType=c.dataset.v;else fStatus=c.dataset.v; render();
  }));
  function matches(){
    const all=LFStore.all().filter(r=>r.status==='pending');
    const out=[];
    all.forEach(r=>{LFStore.matches(r.id).forEach(m=>out.push([r,m]));});
    $('#matchList').innerHTML=out.length?out.map(([r,m])=>`
      <div class="admin-match">
        <p><span class="mono">Possible match</span><br>
        <strong>${esc(r.title)}</strong> (${r.id}, ${r.type}) ↔ <strong>${esc(m.title)}</strong> (${m.id}, ${m.type})<br>
        <span class="mono">${esc(r.category)}</span></p>
        <div class="table-actions">
          <button class="btn btn-sm" onclick="LFStore.setStatus('${r.id}','verified');toast('Verified');document.querySelector('[data-page=admin]')&&location.reload()">Mark verified</button>
        </div>
      </div>`).join('')
      :'<p class="mono">No pending matches right now.</p>';
  }
  /* CSV export — mirrors existing capability */
  $('#csvBtn').addEventListener('click',()=>{
    const rows=[['id','title','category','type','date','location','status']];
    LFStore.all().forEach(r=>rows.push([r.id,r.title,r.category,r.type,r.date,r.location,r.status]));
    const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
    const u=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    const l=document.createElement('a');l.href=u;l.download='lostfound-reports.csv';l.click();URL.revokeObjectURL(u);
    toast('CSV exported');
  });
  $('#resetDemo').addEventListener('click',()=>{LFStore.resetDemo();toast('Demo data reset');render();matches();});
  render(); matches();
}

/* ── CONTACT ── */
if(page==='contact'){
  const form=$('#contactForm');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const btn=$('#cSubmit');btn.disabled=true;btn.innerHTML='<span class="spinner"></span> Sending…';
    setTimeout(()=>{form.style.display='none';$('#contactDone').style.display='block';toast('Message sent');},700);
  });
}
})();
