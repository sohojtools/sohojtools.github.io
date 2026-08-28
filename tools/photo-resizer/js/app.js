const $ = id => document.getElementById(id);
const PRESETS = { photo:{w:300,h:300}, sign:{w:300,h:80} };
let mode='photo', targetW=300, targetH=300;
let cropper=null, lastCanvas=null, lastURL=null, origURL=null;
let baseRatio=1, resetArmed=false, resetTimer=null;

const drop=$('drop'), dropTitle=$('dropTitle'), fileInput=$('file');
const err=$('err'), notice=$('notice'), dimErr=$('dimErr');
const cropWrap=$('cropWrap'), cropImg=$('cropImg'), result=$('result');
const zoomRange=$('zoomRange'), advPanel=$('advPanel'), advBtn=$('advBtn');
const widthIn=$('widthIn'), heightIn=$('heightIn'), lockToggle=$('lockToggle');
const formatSel=$('formatSel'), qualityRange=$('qualityRange'), qualityVal=$('qualityVal'), targetIn=$('targetIn');
const feedback=$('feedback'), sizeWarn=$('sizeWarn');
const DEFAULT_TITLE='ছবি এখানে টেনে আনুন';

/* ---------- preset / custom ---------- */
document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => setMode(c.dataset.mode)));
function setMode(m){
  mode=m;
  document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c.dataset.mode===m));
  if(m==='custom'){ openAdv(true); applyCustom(); }
  else { targetW=PRESETS[m].w; targetH=PRESETS[m].h; dimErr.hidden=true; }
  if(cropper) cropper.setAspectRatio(targetW/targetH);
}
function validDim(v){ return Number.isInteger(v) && v>=10 && v<=4000; }
function applyCustom(){
  if(mode!=='custom') return;
  const w=parseInt(widthIn.value,10), h=parseInt(heightIn.value,10);
  if(validDim(w)&&validDim(h)){ targetW=w; targetH=h; dimErr.hidden=true; if(cropper) cropper.setAspectRatio(w/h); }
  else dimErr.hidden=false;
}
lockToggle.addEventListener('change', ()=>{ if(lockToggle.checked){ const w=parseInt(widthIn.value,10)||targetW, h=parseInt(heightIn.value,10)||targetH; baseRatio=w/h; } applyCustom(); });
widthIn.addEventListener('input', ()=>{ if(lockToggle.checked){ const w=parseInt(widthIn.value,10); if(w>=10) heightIn.value=Math.min(4000,Math.max(10,Math.round(w/baseRatio))); } applyCustom(); });
heightIn.addEventListener('input', applyCustom);

/* ---------- advanced panel ---------- */
advBtn.addEventListener('click', ()=> openAdv(advPanel.hidden));
function openAdv(open){ advPanel.hidden=!open; advBtn.setAttribute('aria-expanded', open); }

/* ---------- upload ---------- */
drop.addEventListener('click', ()=>fileInput.click());
fileInput.addEventListener('change', ()=>{ if(fileInput.files[0]) startCrop(fileInput.files[0]); });
['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.add('drag'); dropTitle.textContent='এখানে ছবি ছেড়ে দিন'; }));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.remove('drag'); dropTitle.textContent=DEFAULT_TITLE; }));
drop.addEventListener('drop', e=>{ const f=e.dataTransfer.files[0]; if(f) startCrop(f); });
window.addEventListener('paste', e=>{
  const items=e.clipboardData && e.clipboardData.items; if(!items) return;
  for(const it of items){ if(it.type && it.type.startsWith('image/')){ const f=it.getAsFile(); if(f) startCrop(f); break; } }
});

function startCrop(file){
  err.hidden=true;
  if(file.type!=='image/jpeg' && file.type!=='image/png'){ err.textContent='এই ফাইলটি সমর্থিত নয়। JPG বা PNG ফাইল নির্বাচন করুন।'; err.hidden=false; return; }
  if(file.size>25*1024*1024){ err.textContent='ছবিটি অনেক বড়। 25MB-এর কম ফাইল নির্বাচন করুন।'; err.hidden=false; return; }
  notice.hidden = file.size <= 8*1024*1024;
  if(origURL) URL.revokeObjectURL(origURL);
  origURL=URL.createObjectURL(file);
  cropImg.src=origURL;
  drop.hidden=true; result.hidden=true; cropWrap.hidden=false; feedback.textContent='';
  if(cropper) cropper.destroy();
  cropper=new Cropper(cropImg,{ aspectRatio:targetW/targetH, viewMode:1, dragMode:'move', autoCropArea:1, background:false, ready(){ zoomRange.value=1; } });
}
cropImg.addEventListener('zoom', e=>{ zoomRange.value=Math.min(3,Math.max(0.1,e.detail.ratio)); });

/* ---------- crop toolbar ---------- */
zoomRange.addEventListener('input', ()=>{ if(cropper) cropper.zoomTo(parseFloat(zoomRange.value)); });
$('zoomInBtn').addEventListener('click', ()=>cropper&&cropper.zoom(0.1));
$('zoomOutBtn').addEventListener('click', ()=>cropper&&cropper.zoom(-0.1));
$('resetCropBtn').addEventListener('click', ()=>{ if(cropper){ cropper.reset(); zoomRange.value=1; } });
$('rotateBtn').addEventListener('click', ()=>cropper&&cropper.rotate(90));
$('flipHBtn').addEventListener('click', ()=>{ if(cropper){ const s=cropper.getData(); cropper.scaleX(-(cropper.getImageData().scaleX||1)); } });
$('flipVBtn').addEventListener('click', ()=>{ if(cropper){ cropper.scaleY(-(cropper.getImageData().scaleY||1)); } });

/* keyboard */
document.addEventListener('keydown', e=>{
  if(cropWrap.hidden || !cropper) return;
  const t=e.target; if(t && ['INPUT','SELECT','TEXTAREA','BUTTON'].includes(t.tagName)) return;
  if(e.key==='ArrowLeft'){cropper.move(-2,0);e.preventDefault();}
  else if(e.key==='ArrowRight'){cropper.move(2,0);e.preventDefault();}
  else if(e.key==='ArrowUp'){cropper.move(0,-2);e.preventDefault();}
  else if(e.key==='ArrowDown'){cropper.move(0,2);e.preventDefault();}
  else if(e.key==='+'||e.key==='=') cropper.zoom(0.1);
  else if(e.key==='-') cropper.zoom(-0.1);
  else if(e.key==='r'||e.key==='R') cropper.rotate(90);
});

/* ---------- output ---------- */
$('applyBtn').addEventListener('click', async ()=>{
  if(!cropper) return;
  lastCanvas=cropper.getCroppedCanvas({width:targetW,height:targetH,imageSmoothingQuality:'high'});
  await renderOutput();
  cropWrap.hidden=true; result.hidden=false;
});
$('recropBtn').addEventListener('click', ()=>{ result.hidden=true; cropWrap.hidden=false; });

async function renderOutput(){
  const mime = formatSel.value==='png' ? 'image/png' : 'image/jpeg';
  let q = parseInt(qualityRange.value,10)/100;
  let blob = await toBlob(lastCanvas, mime, q);
  const target = parseInt(targetIn.value,10);
  let note='';
  if(target>0){
    if(mime==='image/jpeg'){
      while(blob.size>target*1024 && q>0.3){ q-=0.05; blob=await toBlob(lastCanvas,mime,q); }
      if(blob.size>target*1024) note='লক্ষ্য সাইজের মধ্যে আনা যায়নি — আনুমানিক চেষ্টা করা হয়েছে।';
    } else if(blob.size>target*1024){
      note='PNG-তে সাইজ কমানো কঠিন — JPG ফরম্যাট ব্যবহার করে দেখুন।';
    }
  }
  if(lastURL) URL.revokeObjectURL(lastURL);
  lastURL=URL.createObjectURL(blob);
  $('origImg').src=origURL;
  $('finalImg').src=lastURL;
  $('infoDims').textContent=targetW+' × '+targetH+' px';
  $('infoFormat').textContent=formatSel.value.toUpperCase();
  $('infoSize').textContent=fmtKB(blob.size);
  sizeWarn.textContent=note; sizeWarn.hidden=!note;
  const dl=$('downloadBtn'); dl.href=lastURL; dl.download=filename();
}
formatSel.addEventListener('change', refresh);
qualityRange.addEventListener('input', ()=>{ qualityVal.textContent=qualityRange.value+'%'; refresh(); });
targetIn.addEventListener('input', refresh);
function refresh(){ if(lastCanvas && !result.hidden) renderOutput(); }

function filename(){
  const key = mode==='photo'?'photo':mode==='sign'?'signature':'image';
  return 'sohojtools-'+key+'-'+targetW+'x'+targetH+'.'+(formatSel.value==='png'?'png':'jpg');
}
function fmtKB(b){ return b>=1024*1024 ? (b/1024/1024).toFixed(2)+' MB' : (b/1024).toFixed(1)+' KB'; }
function toBlob(canvas,mime,q){ return new Promise(res=>canvas.toBlob(b=>res(b),mime,q)); }

/* ---------- actions ---------- */
$('downloadBtn').addEventListener('click', ()=>{
  const dl=$('downloadBtn'); if(dl.getAttribute('disabled')) return;
  dl.setAttribute('disabled','1'); feedback.textContent='ডাউনলোড হচ্ছে...';
  setTimeout(()=>{ feedback.textContent='ছবি ডাউনলোড হয়েছে।'; },400);
  setTimeout(()=>{ dl.removeAttribute('disabled'); },1500);
});
$('copyDimsBtn').addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText(targetW+' × '+targetH+' px'); feedback.textContent='মাপ কপি হয়েছে।'; }
  catch(e){ feedback.textContent='কপি করা যায়নি।'; }
});
$('replaceBtn').addEventListener('click', ()=>{ fileInput.value=''; fileInput.click(); });
$('resetAllBtn').addEventListener('click', ()=>{
  const btn=$('resetAllBtn');
  if(!resetArmed){ resetArmed=true; btn.textContent='নিশ্চিত? আবার চাপুন'; clearTimeout(resetTimer); resetTimer=setTimeout(()=>{resetArmed=false;btn.textContent='সব রিসেট করুন';},3000); return; }
  resetArmed=false; btn.textContent='সব রিসেট করুন';
  if(cropper){ cropper.destroy(); cropper=null; }
  lastCanvas=null; if(lastURL) URL.revokeObjectURL(lastURL); lastURL=null; if(origURL) URL.revokeObjectURL(origURL); origURL=null;
  mode='photo'; targetW=300; targetH=300;
  document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c.dataset.mode==='photo'));
  widthIn.value=''; heightIn.value=''; lockToggle.checked=false;
  formatSel.value='jpg'; qualityRange.value=90; qualityVal.textContent='90%'; targetIn.value='';
  openAdv(false);
  cropWrap.hidden=true; result.hidden=true; drop.hidden=false; err.hidden=true; notice.hidden=true; feedback.textContent=''; fileInput.value='';
});
