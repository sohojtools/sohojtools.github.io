const $ = id => document.getElementById(id);
const dob = $('dob'), asOn = $('asOn');
const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
const bnDate = new Intl.DateTimeFormat('bn', {day:'numeric', month:'long', year:'numeric'});

function todayStr(){
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
asOn.value = todayStr();
dob.max = todayStr();

function setErr(input, el, msg){
  if (msg){ el.textContent = msg; el.hidden = false; input.closest('.field').classList.add('invalid'); }
  else { el.hidden = true; input.closest('.field').classList.remove('invalid'); }
}

$('todayBtn').addEventListener('click', () => {
  asOn.value = todayStr();
  setErr(asOn, $('asOnErr'), '');
  if (dob.value) calculate();
});

$('calcBtn').addEventListener('click', calculate);

function calculate(){
  const dobErr=$('dobErr'), asOnErr=$('asOnErr');
  setErr(dob, dobErr, ''); setErr(asOn, asOnErr, '');

  if (!dob.value){ setErr(dob, dobErr, 'জন্ম তারিখ নির্বাচন করুন।'); return; }
  if (!asOn.value){ setErr(asOn, asOnErr, 'হিসাবের তারিখ নির্বাচন করুন।'); return; }

  const b = new Date(dob.value+'T00:00:00');
  const a = new Date(asOn.value+'T00:00:00');
  const today = new Date(todayStr()+'T00:00:00');

  if (b > today){ setErr(dob, dobErr, 'জন্ম তারিখ ভবিষ্যতের হতে পারে না।'); return; }
  if (a < b){ setErr(asOn, asOnErr, 'হিসাবের তারিখ জন্ম তারিখের আগে হতে পারে না।'); return; }

  // exact calendar calculation: years -> months -> days
  let y = a.getFullYear()-b.getFullYear();
  let m = a.getMonth()-b.getMonth();
  let d = a.getDate()-b.getDate();
  if (d < 0){ m -= 1; d += new Date(a.getFullYear(), a.getMonth(), 0).getDate(); }
  if (m < 0){ y -= 1; m += 12; }

  const totalDays = Math.round((a-b)/86400000);
  const totalWeeks = Math.floor(totalDays/7);
  const totalMonths = y*12+m;

  let nb = new Date(a.getFullYear(), b.getMonth(), b.getDate());
  if (nb <= a) nb = new Date(a.getFullYear()+1, b.getMonth(), b.getDate());
  const gap = calcGap(a, nb);

  $('asOnLine').textContent = bnDate.format(a) + ' তারিখে আপনার বয়স';
  $('ageBig').textContent = bn(y)+' বছর '+bn(m)+' মাস '+bn(d)+' দিন';
  $('stY').textContent = bn(y);
  $('stM').textContent = bn(m);
  $('stD').textContent = bn(d);
  $('stMonths').textContent = bn(totalMonths);
  $('stWeeks').textContent = bn(totalWeeks);
  $('stDays').textContent = bn(totalDays);
  $('stBday').textContent = gap;
  $('result').hidden = false;
  $('feedback').textContent = '';
}

function calcGap(a, nb){
  let y = nb.getFullYear()-a.getFullYear();
  let m = nb.getMonth()-a.getMonth();
  let d = nb.getDate()-a.getDate();
  if (d < 0){ m -= 1; d += new Date(nb.getFullYear(), nb.getMonth(), 0).getDate(); }
  if (m < 0){ y -= 1; m += 12; }
  if (y===0 && m===0 && d===0) return 'আজ!';
  let s = '';
  if (y>0) s += bn(y)+' বছর ';
  s += bn(m)+' মাস '+bn(d)+' দিন পরে';
  return s;
}

$('copyBtn').addEventListener('click', async () => {
  const text = 'বয়স: ' + $('ageBig').textContent + '\nহিসাবের তারিখ: ' + $('asOnLine').textContent.replace(' তারিখে আপনার বয়স','');
  try { await navigator.clipboard.writeText(text); $('feedback').textContent = 'ফলাফল কপি হয়েছে।'; }
  catch(e){ $('feedback').textContent = 'কপি করা যায়নি।'; }
});

$('resetBtn').addEventListener('click', () => {
  dob.value = '';
  asOn.value = todayStr();
  setErr(dob, $('dobErr'), ''); setErr(asOn, $('asOnErr'), '');
  $('result').hidden = true;
  $('morePanel').hidden = true;
  $('moreBtn').setAttribute('aria-expanded','false');
  $('feedback').textContent = '';
});

$('moreBtn').addEventListener('click', () => {
  const open = $('morePanel').hidden;
  $('morePanel').hidden = !open;
  $('moreBtn').setAttribute('aria-expanded', open);
});
