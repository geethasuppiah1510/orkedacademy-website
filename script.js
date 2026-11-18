const video=document.querySelector('#orchid-video');
const toggle=document.querySelector('.motion-toggle');
const symbol=toggle.querySelector('.motion-symbol');
const label=toggle.querySelector('.motion-label');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let pausedByUser=false;
function reflectMotion(){const paused=video.paused;symbol.textContent=paused?'▶':'Ⅱ';label.textContent=paused?'Play motion':'Pause motion';toggle.setAttribute('aria-label',paused?'Play orchid animation':'Pause orchid animation');}
async function playVideo(){try{await video.play();video.classList.add('is-ready');}catch{video.classList.remove('is-ready');}reflectMotion();}
toggle.addEventListener('click',()=>{if(video.paused){pausedByUser=false;playVideo();}else{pausedByUser=true;video.pause();}});
video.addEventListener('play',reflectMotion);video.addEventListener('pause',reflectMotion);
if(!reduced.matches)playVideo();
reduced.addEventListener('change',()=>{if(reduced.matches)video.pause();else if(!pausedByUser)playVideo();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else if(!reduced.matches&&!pausedByUser)playVideo();});
const menu=document.querySelector('.menu-toggle');const nav=document.querySelector('#main-nav');
function closeMenu(){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('is-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.querySelector('#year').textContent=new Date().getFullYear();

// Restrained reveals, inspired by The Vocabulary of Motion.
// Content stays visible if JavaScript or the animation library is unavailable.
const motion=window.Motion;
const activeAnimations=new Set();
function animateElement(element,keyframes,options){
  if(!motion||reduced.matches)return null;
  const animation=motion.animate(element,keyframes,options);
  activeAnimations.add(animation);
  animation.then(()=>activeAnimations.delete(animation));
  return animation;
}
if(motion&&!reduced.matches){
  const reveals=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      animateElement(entry.target,{opacity:[.25,1],y:[16,0]},{duration:.5,ease:[.22,1,.36,1]});
      reveals.unobserve(entry.target);
    }
  },{threshold:.12});
  document.querySelectorAll('[data-reveal]').forEach(el=>reveals.observe(el));
  reduced.addEventListener('change',()=>{if(reduced.matches){reveals.disconnect();for(const animation of activeAnimations)animation.complete();activeAnimations.clear();}});
}

// Native details remain usable without JS; animate only their size when available.
for(const details of document.querySelectorAll('.learning-details')){
  const summary=details.querySelector('summary');
  let animation=null;
  let intendedOpen=details.open;
  summary.addEventListener('click',event=>{
    if(!motion||reduced.matches)return;
    event.preventDefault();
    const start=details.getBoundingClientRect().height;
    if(animation)animation.stop();
    intendedOpen=!intendedOpen;
    details.style.height='auto';
    details.open=true;
    const end=intendedOpen?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+2;
    details.style.height=start+'px';
    const current=animateElement(details,{height:[start,end]},{duration:.32,ease:[.22,1,.36,1]});
    animation=current;
    current.then(()=>{if(animation!==current)return;details.open=intendedOpen;details.style.height='';animation=null;});
  });
  details.addEventListener('toggle',()=>{if(!animation)intendedOpen=details.open;});
}

// Accessible, keyboard-operable examples of the situations this programme covers.
const tabs=Array.from(document.querySelectorAll('.scenario-tabs [role="tab"]'));
function selectScenario(tab,focus=false){
  moveScenarioIndicator(tab);
  tabs.forEach(item=>{
    const selected=item===tab;
    item.setAttribute('aria-selected',String(selected));
    item.tabIndex=selected?0:-1;
    document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;
  });
  if(focus)tab.focus();
  const panel=document.getElementById(tab.getAttribute('aria-controls'));
  animateElement(panel,{opacity:[.3,1],y:[7,0]},{duration:.3,ease:[.22,1,.36,1]});
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectScenario(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next!==undefined){event.preventDefault();selectScenario(tabs[next],true);}
  });
});

// Tap travel adapted from React Bits Rubber Segment by David Haz.
// Leading/trailing edges dilate then settle, with reduced stretch for Orked.
// Source and MIT + Commons Clause notice: assets/vendor/REACT-BITS-LICENSE.md.
const scenarioTrack=document.querySelector('.scenario-tabs');
const scenarioIndicator=document.createElement('span');
scenarioIndicator.className='scenario-indicator';
scenarioIndicator.setAttribute('aria-hidden','true');
let indicatorAnimation=null;
function moveScenarioIndicator(tab,instant=false){
  if(!scenarioIndicator.isConnected)return;
  const x=tab.offsetLeft;
  const width=tab.offsetWidth;
  if(indicatorAnimation)indicatorAnimation.stop();
  if(instant||reduced.matches||!motion){scenarioIndicator.style.left=x+'px';scenarioIndicator.style.width=width+'px';return;}
  const startX=parseFloat(scenarioIndicator.style.left)||x;
  const startW=parseFloat(scenarioIndicator.style.width)||width;
  const stretchLeft=Math.min(startX,x);
  const stretchRight=Math.max(startX+startW,x+width);
  indicatorAnimation=animateElement(scenarioIndicator,{
    left:[startX,x+(stretchLeft-x)*.22,x],
    width:[startW,width+(stretchRight-stretchLeft-width)*.22,width]
  },{duration:.38,times:[0,.43,1],ease:[.23,1,.32,1]});
}
scenarioTrack.append(scenarioIndicator);
scenarioTrack.classList.add('has-indicator');
const measureIndicator=()=>moveScenarioIndicator(tabs.find(t=>t.getAttribute('aria-selected')==='true'),true);
new ResizeObserver(measureIndicator).observe(scenarioTrack);
document.fonts.ready.then(measureIndicator);
measureIndicator();
