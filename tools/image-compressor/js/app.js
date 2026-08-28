const $ = id => document.getElementById(id);
let targetKB = 100, file = null, img = null;
let origURL = null, outURL = null, extraScale = 1, lastQuality = null;
let resetArmed = false, resetTimer = null;

const drop=$('drop'), dropTitle=$('dropTitle'), fileInput=$('file');
const err=$('err'), notice=$('notice'), status=$('status'), result=$('result');
const customKb=$('customKb'), customErr=$('customErr'), customWarn=$('customWarn');
const formatSel=$('formatSel'), maxWIn=$('maxWIn'), manualQ=$('manualQ'), qRange=$('qRange'), qVal=$('qVal');
const feedback=$('feedback'), fmtNote=$('fmtNote'), tStatus=$('tStatus'), tStatusText=$('tStatusText');
const okIcon=$('okIcon'), warnIcon=$('warnIcon'), retryBtn=$('retryBtn');
const DEFAULT_TITLE='ছবি এখানে টেনে আনুন';
const nextFrame = () => new Promise(r => setTimeout(r, 30));

/* ---------- target selection ---------- */
document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
  document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
  c.classList.add('active');
  targetKB = parseInt(c.dataset.kb,10);
  customKb.value=''; customErr.hidden=true; customWarn.hidden=true;
  extraScale=1; run();
}));
customKb.addEventListener('input', () => {
  const v = parseInt(customKb.value,10);
  if (!customKb.value) { customErr.hidden=true; customWarn.hidden=true; return; }
  if (!Number.isInteger(v) || v<5 || v>10240) { customErr.hidden=false; customWarn.hidden=true; return; }
  customErr.hidden=true;
  customWarn.hidden = v<=2048;
  document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
  targetKB=v; extraScale=1; run();
});

/* ---------- advanced ---------- */
$('advBtn').addEventListener('click', ()=>{ const open=$('advPanel').hidden; $('advPanel').hidden=!open; $('advBtn').setAttribute('aria-expanded', open); });
formatSel.addEventListener('change', run);
maxWIn.addEventListener('input', run);
manualQ.addEventListener('change', run);
qRange.addEventListener('input', ()=>{ qVal.textContent=qRange.value+'%'; if(manualQ.checked) run(); });

/* ---------- upload ---------- */
drop.addEventListener('click', ()=>fileInput.click());
fileInput.addEventListener('change', ()=>{ if(fileInput.files[0]) loadFile(fileInput.files[0]); });
['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.add('drag'); dropTitle.textContent='এখানে ছবি ছেড়ে দিন'; }));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.remove('drag'); dropTitle.textContent=DEFAULT_TITLE; }));
drop.addEventListener('drop', e=>{ const f=e.dataTransfer.files[0]; if(f) loadFile(f); });
window.addEventListener('paste', e=>{
  const items=e.clipboardData && e.clipboardData.items; if(!items) return;
  for(const it of items){ if(it.type && it.type.startsWith('image/')){ const f=it.getAsFile(); if(f) loadFile(f); break; } }
});

function loadFile(f){
  err.hidden=true;
  if(f.type!=='image/jpeg' && f.type!=='image/png'){ err.textContent='এই ফাইলটি সমর্থিত নয়। JPG বা PNG ফাইল নির্বাচন করুন।'; err.hidden=false; return; }
  if(f.size>25*1024*1024){ err.textContent='ছবিটি অনেক বড়। 25MB-এর কম ফাইল নির্বাচন করুন।'; err.hidden=false; return; }
  file=f; extraScale=1;
  notice.hidden = f.size<=8*1024*1024;
  if(origURL) URL.revokeObjectURL(origURL);
  origURL=URL.createObjectURL(f);
  const im=new Image();
  im.onload=()=>{ img=im; run(); };
  im.onerror=()=>{ err.textContent='ফাইলটি পড়া যায়নি। অন্য ছবি চেষ্টা করুন।'; err.hidden=true===false; err.hidden=false; };
  im.src=origURL;
}

/* ---------- compression ---------- */
async function run(){
  if(!file || !img) return;
  result.hidden=true; status.hidden=false;
  await nextFrame();
  const targetBytes=targetKB*1024;
  const fmt=formatSel.value;
  const sameType = (fmt==='jpg'&&file.type==='image/jpeg')||(fmt==='png'&&file.type==='image/png');

  // Rule 2: small image protection
  if(file.size<=targetBytes && (fmt==='auto'||sameType) && !manualQ.checked){
    showResult(file, {achieved:true, passthrough:true, w:img.naturalWidth, h:img.naturalHeight});
    return;
  }

  let outMime = fmt==='png' ? 'image/png' : 'image/jpeg';
  if(fmt==='auto') outMime='image/jpeg';

  const maxW=parseInt(maxWIn.value,10);
  let scale=extraScale;
  if(maxW>=50 && img.naturalWidth>maxW) scale*=maxW/img.naturalWidth;
  const w=Math.max(1,Math.round(img.naturalWidth*scale));
  const h=Math.max(1,Math.round(img.naturalHeight*scale));
  const canvas=document.createElement('canvas');
  canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(img,0,0,w,h);

  let blob, quality=null, achieved=false;
  if(outMime==='image/png'){
    blob=await toBlob(canvas,'image/png');
    achieved=blob.size<=targetBytes;
  } else if(manualQ.checked){
    quality=parseInt(qRange.value,10)/100;
    blob=await toBlob(canvas,outMime,quality);
    achieved=blob.size<=targetBytes;
  } else {
    // binary search: best quality that stays <= target
    let lo=0.2, hi=0.95, best=null;
    for(let i=0;i<6;i++){
      const mid=(lo+hi)/2;
      const b=await toBlob(canvas,outMime,mid);
      if(b.size<=targetBytes){ best=b; quality=mid; lo=mid; } else hi=mid;
    }
    if(best){ blob=best; achieved=true; }
    else { blob=await toBlob(canvas,outMime,0.2); quality=0.2; achieved=blob.size<=targetBytes; }
  }
  lastQuality=quality;
  canvas.width=canvas.height=0;
  showResult(blob,{achieved,passthrough:false,w,h,outMime});
}

async function showResult(blob, meta){
  if(outURL) URL.revokeObjectURL(outURL);
  outURL=URL.createObjectURL(blob);
  $('origImg').src=origURL;
  $('finalImg').src=outURL;
  const pct=Math.round((1-blob.size/file.size)*100);
  $('origSize').textContent=fmtSize(file.size);
  $('newSize').textContent=fmtSize(blob.size);
  $('stBefore').textContent=fmtSize(file.size);
  $('stAfter').textContent=fmtSize(blob.size);
  $('stSaved').textContent=(pct>0?pct+'%':'—');

  tStatus.className='tstatus';
  okIcon.hidden=false; warnIcon.hidden=true; retryBtn.hidden=true; fmtNote.hidden=true;

  if(meta.passthrough){
    tStatusText.textContent='ছবিটি ইতিমধ্যে '+targetKB+' KB-এর মধ্যে আছে। নতুন করে কমপ্রেস করার প্রয়োজন নেই।';
  } else if(meta.achieved){
    tStatusText.textContent='Target '+targetKB+' KB-এর মধ্যে সফলভাবে কমপ্রেস হয়েছে।';
    if(meta.outMime==='image/jpeg' && file.type==='image/png'){
      fmtNote.textContent='সাইজ কমাতে PNG থেকে JPG ফরম্যাটে রূপান্তর করা হয়েছে। JPG format-এ transparency সমর্থিত নয়।';
      fmtNote.hidden=false;
    }
    if(lastQuality!==null && lastQuality<=0.45){
      tStatus.classList.add('warn'); okIcon.hidden=true; warnIcon.hidden=false;
      tStatusText.textContent='Target-এর মধ্যে আনা হয়েছে, তবে এই target-এর জন্য ছবির মান কিছুটা কমেছে।';
    }
  } else {
    tStatus.classList.add('fail'); okIcon.hidden=true; warnIcon.hidden=false;
    tStatusText.textContent='এই ছবিকে '+targetKB+' KB-এর মধ্যে আনতে গেলে image quality উল্লেখযোগ্যভাবে কমে যেতে পারে।';
    retryBtn.hidden=false;
    if(meta.outMime==='image/png'){ fmtNote.textContent='PNG ফরম্যাটে সাইজ এত কমানো কঠিন — JPG ব্যবহার করে দেখুন।'; fmtNote.hidden=false; }
  }

  const dl=$('downloadBtn');
  dl.href=outURL;
  dl.download='sohojtools-'+targetKB+'kb.'+(blob.type==='image/png'?'png':'jpg');
  status.hidden=true;
  result.hidden=false;
}

retryBtn.addEventListener('click', ()=>{ extraScale*=0.75; run(); });

function toBlob(canvas,mime,q){ return new Promise(res=>canvas.toBlob(b=>res(b),mime,q)); }
function fmtSize(b){ return b>=1024*1024 ? (b/1024/1024).toFixed(2)+' MB' : (b/1024).toFixed(1)+' KB'; }

/* ---------- actions ---------- */
$('downloadBtn').addEventListener('click', ()=>{
  const dl=$('downloadBtn'); if(dl.hasAttribute('disabled')) return;
  dl.setAttribute('disabled','1'); feedback.textContent='ডাউনলোড হচ্ছে...';
  setTimeout(()=>{ feedback.textContent='ছবি ডাউনলোড হয়েছে।'; },400);
  setTimeout(()=>{ dl.removeAttribute('disabled'); },1500);
});
$('replaceBtn').addEventListener('click', ()=>{ fileInput.value=''; fileInput.click(); });
$('resetAllBtn').addEventListener('click', ()=>{
  const btn=$('resetAllBtn');
  if(!resetArmed){ resetArmed=true; btn.textContent='নিশ্চিত? আবার চাপুন'; clearTimeout(resetTimer); resetTimer=setTimeout(()=>{resetArmed=false;btn.textContent='সব রিসেট করুন';},3000); return; }
  resetArmed=false; btn.textContent='সব রিসেট করুন';
  file=null; img=null; extraScale=1; lastQuality=null;
  if(origURL) URL.revokeObjectURL(origURL); origURL=null;
  if(outURL) URL.revokeObjectURL(outURL); outURL=null;
  targetKB=100;
  document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active',c.dataset.kb==='100'));
  customKb.value=''; customErr.hidden=true; customWarn.hidden=true;
  formatSel.value='auto'; maxWIn.value=''; manualQ.checked=false; qRange.value=90; qVal.textContent='90%';
  $('advPanel').hidden=true; $('advBtn').setAttribute('aria-expanded','false');
  result.hidden=true; status.hidden=true; err.hidden=true; notice.hidden=true; feedback.textContent='';
  drop.hidden=false; fileInput.value='';
});
