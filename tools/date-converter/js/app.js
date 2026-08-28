const $ = id => document.getElementById(id);
const DC = window.DateConvert;
let mode = 'en';
let lastResult = null;

for (let i = 1; i <= 31; i++) $('bnDay').add(new Option(i, i));
DC.BN_MONTHS.forEach((m, i) => $('bnMonth').add(new Option(m, i + 1)));

function setMode(m){
  mode = m;
  $('tabEn').classList.toggle('active', m === 'en');
  $('tabBn').classList.toggle('active', m === 'bn');
  $('tabEn').setAttribute('aria-selected', m === 'en');
  $('tabBn').setAttribute('aria-selected', m === 'bn');
  $('panelEn').hidden = m !== 'en';
  $('panelBn').hidden = m !== 'bn';
}
$('tabEn').addEventListener('click', () => setMode('en'));
$('tabBn').addEventListener('click', () => setMode('bn'));
$('swapBtn').addEventListener('click', () => setMode(mode === 'en' ? 'bn' : 'en'));

function todayStr(){
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
$('todayBtn').addEventListener('click', () => { $('enDate').value = todayStr(); convertEn(); });
$('todayBnBtn').addEventListener('click', () => {
  const p = DC.bengaliParts(new Date());
  $('bnDay').value = p.day; $('bnMonth').value = p.month; $('bnYear').value = p.year;
  convertBn();
});
$('enBtn').addEventListener('click', convertEn);
$('bnBtn').addEventListener('click', convertBn);
$('bnDigits').addEventListener('change', () => { if (lastResult) showResult(lastResult.date); });

function convertEn(){
  const errEl = $('enErr'); errEl.hidden = true;
  if (!$('enDate').value){ errEl.textContent = 'একটি তারিখ নির্বাচন করুন।'; errEl.hidden = false; return; }
  const d = new Date($('enDate').value + 'T00:00:00');
  if (isNaN(d.getTime()) || !DC.inRange(d)){ errEl.textContent = 'এই তারিখটি বর্তমানে সমর্থিত নয়।'; errEl.hidden = false; return; }
  showResult(d);
}

function convertBn(){
  const errEl = $('bnErr'); errEl.hidden = true;
  const bd = parseInt($('bnDay').value, 10);
  const bm = parseInt($('bnMonth').value, 10);
  const by = parseInt($('bnYear').value, 10);
  if (!Number.isInteger(by) || by < 1300 || by > 1500){ errEl.textContent = 'সঠিক বাংলা তারিখ নির্বাচন করুন।'; errEl.hidden = false; return; }
  const d = DC.findGregorian(bd, bm, by);
  if (!d){ errEl.textContent = 'এই বাংলা তারিখটি সঠিক নয়।'; errEl.hidden = false; return; }
  showResult(d);
}

function showResult(d){
  lastResult = { date: d };
  const f = DC.formatAll(d, $('bnDigits').checked);
  $('resEn').textContent = f.en;
  $('resBn').textContent = f.bn;
  $('resHijri').textContent = f.hijri;
  $('result').hidden = false;
  $('feedback').textContent = '';
}

$('copyBtn').addEventListener('click', async () => {
  if (!lastResult) return;
  const text = mode === 'en' ? $('resBn').textContent : $('resEn').textContent;
  await copy(text);
});
$('copyAllBtn').addEventListener('click', async () => {
  if (!lastResult) return;
  const text = 'ইংরেজি: ' + $('resEn').textContent + '\nবাংলা: ' + $('resBn').textContent + '\nহিজরি: ' + $('resHijri').textContent;
  await copy(text);
});
async function copy(text){
  try { await navigator.clipboard.writeText(text); $('feedback').textContent = 'কপি হয়েছে।'; }
  catch(e){ $('feedback').textContent = 'কপি করা যায়নি। ফলাফলটি নির্বাচন করে কপি করুন।'; }
}

$('resetBtn').addEventListener('click', () => {
  setMode('en');
  $('enDate').value = '';
  $('bnDay').value = 1; $('bnMonth').value = 1; $('bnYear').value = 1433;
  $('bnDigits').checked = true;
  $('enErr').hidden = true; $('bnErr').hidden = true;
  $('result').hidden = true; lastResult = null;
  $('feedback').textContent = '';
});
