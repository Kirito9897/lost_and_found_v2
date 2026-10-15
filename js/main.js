/* main.js — motion system: preloader, split text, journey scroll, reveals */
(function(){
'use strict';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Preloader: counter + logo reveal + slide away ── */
const pre=document.querySelector('.preloader');
const count=document.getElementById('plCount');
const brand=pre.querySelector('.preloader-brand');
const meter=pre.querySelector('.preloader-meter');
const startedAt=Date.now();
const minVisible=1100;
let loaded=document.readyState==='complete';
let finished=false;
let p=0;
const iv=setInterval(()=>{
  const elapsed=Date.now()-startedAt;
  p=elapsed<240?0:(loaded?Math.min(100,p+5):Math.min(90,Math.floor(90*(1-Math.exp(-elapsed/700)))));
  count.textContent=`${p}%`;
  if(loaded&&p===100&&elapsed>=minVisible){clearInterval(iv);finish();}
},40);

function markLoaded(){loaded=true;}
if(!loaded) addEventListener('load',markLoaded,{once:true});
setTimeout(markLoaded,5000);

function finish(){
  if(finished)return;
  finished=true;
  pre.classList.add('is-ready');
  if(reduced||typeof gsap==='undefined'){
    setTimeout(()=>{pre.classList.add('done');heroIn();},300);
  }else{
    gsap.to(brand,{opacity:1,scale:1,duration:.8,ease:'power3.out'});
    gsap.to(meter,{opacity:1,y:0,duration:.8,delay:.2,ease:'power3.out'});
    setTimeout(()=>{pre.classList.add('done');heroIn();},900);
  }
  setTimeout(()=>pre.remove(),2000);
}

/* ── Hero headline reveal ── */
function heroIn(){
  const rows=document.querySelectorAll('.hero h1 .row span');
  if(!rows.length)return;
  if(reduced||typeof gsap==='undefined'){rows.forEach(r=>r.style.transform='none');return;}
  gsap.to(rows,{y:0,duration:1.2,stagger:.12,ease:'power3.out'});
  gsap.from('.hero-foot > *',{y:22,opacity:0,duration:.8,stagger:.08,delay:.45,ease:'power3.out'});
}

/* ── Scroll reveals (Intersection Observer) ── */
const io=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target;
    if(reduced||typeof gsap==='undefined'){el.style.opacity=1;el.style.transform='none';}
    else gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',delay:(+el.dataset.delay||0)});
    io.unobserve(el);
  });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ── Recovery journey progress line ── */
const track=document.querySelector('.journey-track');
if(track){
  const prog=track.querySelector('.journey-progress');
  const steps=[...track.querySelectorAll('.journey-step')];
  if(prog){prog.style.width='100%';}
  steps.forEach((s,i)=>s.classList.toggle('active',i===0 || i===1 || i===2 || i===3));
}
})();
