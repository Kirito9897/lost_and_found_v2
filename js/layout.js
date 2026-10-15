/* layout.js — shared chrome: header, footer, preloader, cursor, toast */
(function(){
'use strict';

/* ── Preloader ── */
let pre = document.querySelector('.preloader');
if (!pre) {
  pre = document.createElement('div');
  pre.className = 'preloader';
  pre.setAttribute('aria-hidden', 'true');
  pre.innerHTML = `
    <div class="preloader-brand"><span>LOST<em>/</em>FOUND</span></div>
    <div class="preloader-meter">
      <span class="preloader-count" id="plCount">0%</span>
      <span class="preloader-text">loading...</span>
      <i></i>
    </div>`;
  document.body.prepend(pre);
}

/* ── Custom cursor ── */
const dot = document.createElement('div'); dot.className='cursor-dot';
const lbl = document.createElement('div'); lbl.className='cursor-label';
document.body.append(dot,lbl);
let mx=innerWidth/2,my=innerHeight/2,dx=mx,dy=my;
addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
(function loop(){
  dx+=(mx-dx)*.2; dy+=(my-dy)*.2;
  dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
  lbl.style.transform=`translate(${dx}px,${dy}px) translate(-50%,-140%)`;
  requestAnimationFrame(loop);
})();
window.setCursorLabel = t => { lbl.textContent=t; lbl.classList.toggle('on',!!t); };
document.addEventListener('mouseover',e=>{
  const t=e.target.closest('[data-cursor]');
  window.setCursorLabel(t?t.dataset.cursor:'');
});

/* ── Toast ── */
const toast=document.createElement('div');toast.className='toast';
toast.innerHTML='<span class="tdot"></span><span id="toastMsg"></span>';
document.body.appendChild(toast);
window.toast = msg=>{
  document.getElementById('toastMsg').textContent=msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t=setTimeout(()=>toast.classList.remove('show'),2800);
};

/* ── Header / Footer injection ── */
const page = document.body.dataset.page || '';
const auth = JSON.parse(localStorage.getItem('lf_auth')||'null');
const navItem=(id,label,href)=>`<a href="${href}" class="${page===id?'active':''}">${label}</a>`;

document.body.insertAdjacentHTML('afterbegin',`
<header class="site-header" id="siteHeader">
  <a class="brand" href="index.html">LOST<em>/</em>FOUND<span class="brand-sub">CAMPUS&nbsp;OBJECT&nbsp;ARCHIVE</span></a>
  <nav class="nav" id="mainNav">
    ${navItem('browse','Browse','browse.html')}
    ${navItem('how','How It Works','index.html#journey')}
    ${navItem('contact','Contact','contact.html')}
    ${auth
      ? (auth.role==='admin'
          ? navItem('admin','Admin','admin.html')
          : navItem('dashboard','My Account','dashboard.html'))
      : navItem('login','Sign In','login.html')}
  </nav>
  <div class="header-actions">
    <a class="btn btn-lime btn-sm" href="report-lost.html">Report an Item</a>
    <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
  </div>
</header>`);

document.body.insertAdjacentHTML('beforeend',`
<footer class="footer">
  <a class="footer-big" href="browse.html" data-cursor="Browse">BRING IT BACK</a>
  <div class="footer-grid">
    <div>
      <h5>LOST/FOUND</h5>
      <p>A campus object archive. Everyday things have stories — we help them find their way home.</p>
    </div>
    <div>
      <h5>Archive</h5>
      <a href="browse.html">Browse items</a>
      <a href="report-lost.html">Report lost</a>
      <a href="report-found.html">Report found</a>
    </div>
    <div>
      <h5>Account</h5>
      ${auth
        ? `<a href="${auth.role==='admin'?'admin.html':'dashboard.html'}">${auth.role==='admin'?'Admin workspace':'My dashboard'}</a><a href="#" id="footLogout">Sign out</a>`
        : `<a href="login.html">Sign in</a><a href="register.html">Register</a>`}
    </div>
    <div>
      <h5>Help</h5>
      <a href="contact.html">Contact us</a>
      <a href="contact.html#privacy">Privacy</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Campus Lost &amp; Found Portal</span>
    <span>LOST → DISCOVERED → VERIFIED → RETURNED</span>
  </div>
</footer>`);

/* header scroll + burger */
addEventListener('scroll',()=>{
  document.getElementById('siteHeader').classList.toggle('scrolled',scrollY>30);
},{passive:true});
const burger=document.getElementById('burger'),nav=document.getElementById('mainNav');
burger.addEventListener('click',()=>{burger.classList.toggle('open');nav.classList.toggle('open');});
const footOut=document.getElementById('footLogout');
if(footOut) footOut.addEventListener('click',e=>{e.preventDefault();window.LFAuth&&LFAuth.logout();});
})();
