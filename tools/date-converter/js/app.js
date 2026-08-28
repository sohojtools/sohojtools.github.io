const $ = id => document.getElementById(id);
const bnBengali = new Intl.DateTimeFormat('bn-u-ca-bengali', {day:'numeric', month:'long', year:'numeric'});
let bnIslamic;
try { bnIslamic = new Intl.DateTimeFormat('bn-u-ca-islamic-umalqura', {day:'numeric', month:'long', year:'numeric'}); }
catch(e){ bnIslamic = new Intl.DateTimeFormat('bn-u-ca-islamic', {day:'numeric', month:'long', year:'numeric'}); }
const bnWeek = new Intl.DateTimeFormat('bn', {weekday:'long'});
const enFmt = new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'long', year:'numeric'});
const bengaliNum = new Intl.DateTimeFormat('en-u-ca-bengali', {day:'numeric', month:'numeric', year:'numeric'});

$('tabEn').addEventListener('click', () => {
  $('tabEn').classList.add('active'); $('tabBn').classList.remove('active');
  $('panelEn').hidden = false; $('panelBn').hidden = true;
});
$('tabBn').addEventListener('click', () => {
  $('tabBn').classList.add('active'); $('tabEn').classList.remove('active');
  $('panelBn').hidden = false; $('panelEn').hidden = true;
});

for (let i = 1; i <= 31; i++) $('bnDay').add(new Option(i, i));
['বৈশাখ','জ্যৈষ্ঠ','আষাঢ়','শ্রাবণ','ভাদ্র','আশ্বিন','কার্তিক','অগ্রহায়ণ','পৌষ','মাঘ','ফাল্গুন','চৈত্র']
  .forEach((m, i) => $('bnMonth').add(new Option(m, i+1)));

function todayValue(){
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

$('todayBtn').addEventListener('click', () => { $('enDate').value = todayValue(); showEn(); });
$('enBtn').addEventListener('click', showEn);

function showEn(){
  if (!$('enDate').value) return;
  const d = new Date($('enDate').value+'T00:00:00');
  $('outBn').textContent = bnBengali.format(d);
  $('outHijri').textContent = bnIslamic.format(d);
  $('outDay').textContent = bnWeek.format(d);
  $('enResult').hidden = false;
}

$('bnBtn').addEventListener('click', () => {
  const d = findGreg(+$('bnDay').value, +$('bnMonth').value, +$('bnYear').value);
  if (!d) {
    $('outEn').textContent = 'সঠিক বাংলা তারিখ দিন';
    $('outDay2').textContent = '—';
    $('bnResult').hidden = false;
    return;
  }
  $('outEn').textContent = enFmt.format(d);
  $('outDay2').textContent = bnWeek.format(d);
  $('bnResult').hidden = false;
});

function findGreg(bd, bm, by){
  for (let i = 0; i < 460; i++) {
    const d = new Date(by+593, 2, 1+i);
    const p = bengaliNum.formatToParts(d);
    const dd = +p.find(x => x.type==='day').value;
    const mm = +p.find(x => x.type==='month').value;
    const yy = +p.find(x => x.type==='year').value;
    if (dd===bd && mm===bm && yy===by) return d;
  }
  return null;
}
