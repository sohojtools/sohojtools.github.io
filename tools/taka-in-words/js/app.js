const $ = id => document.getElementById(id);
const NW = window.NumberWordsBN;
const amount = $('amount'), words = $('words'), err = $('err');
const preview = $('preview'), previewNum = $('previewNum');
const matraToggle = $('matraToggle'), bnToggle = $('bnToggle');
const feedback = $('feedback');
let lastWords = '', lastNum = '';

document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
  amount.value = c.dataset.v;
  convert();
}));
amount.addEventListener('input', convert);
matraToggle.addEventListener('change', convert);
bnToggle.addEventListener('change', convert);

function buildWords(intStr, poisha){
  const t = parseInt(intStr, 10);
  let out = '';
  if (t > 0) out += NW.takaWords(intStr) + ' টাকা';
  if (poisha > 0) out += (out ? ' ' : '') + NW.numWords(poisha) + ' পয়সা';
  if (!out) out = 'শূন্য টাকা';
  if (matraToggle.checked) out += ' মাত্র';
  return out;
}

function convert(){
  feedback.textContent = '';
  const r = NW.normalize(amount.value);
  if (r.empty){
    err.hidden = true;
    preview.hidden = true;
    words.textContent = 'এখানে বাংলা কথায় লেখা দেখা যাবে…';
    lastWords = ''; lastNum = '';
    return;
  }
  if (!r.ok){
    err.textContent = r.error; err.hidden = false;
    preview.hidden = true;
    lastWords = ''; lastNum = '';
    return;
  }
  err.hidden = true;
  lastWords = buildWords(r.int, r.poisha);
  const grouped = NW.bdGroup(r.int) + (r.poisha ? '.' + String(r.poisha).padStart(2,'0') : '');
  lastNum = (bnToggle.checked ? NW.toBn(grouped) : grouped);
  previewNum.textContent = '৳ ' + lastNum;
  preview.hidden = false;
  words.textContent = lastWords;
}

$('copyBtn').addEventListener('click', () => copyText(lastWords));
$('copyBothBtn').addEventListener('click', () => copyText('৳ ' + lastNum + '\n' + lastWords));

async function copyText(text){
  if (!text){ feedback.textContent = 'আগে একটি বৈধ পরিমাণ লিখুন।'; return; }
  try {
    await navigator.clipboard.writeText(text);
    feedback.textContent = 'কপি হয়েছে।';
  } catch(e){
    feedback.textContent = 'কপি করা যায়নি। ফলাফলটি নির্বাচন করে কপি করুন।';
  }
}

$('resetBtn').addEventListener('click', () => {
  amount.value = '';
  err.hidden = true;
  preview.hidden = true;
  words.textContent = 'এখানে বাংলা কথায় লেখা দেখা যাবে…';
  feedback.textContent = '';
  lastWords = ''; lastNum = '';
  amount.focus();
});

$('advBtn').addEventListener('click', () => {
  const open = $('advPanel').hidden;
  $('advPanel').hidden = !open;
  $('advBtn').setAttribute('aria-expanded', open);
});

/* examples table — generated from the same converter logic */
(function(){
  const rows = [1000, 10000, 100000, 125000, 10000000];
  const body = $('exBody');
  rows.forEach(v => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    td1.textContent = NW.toBn(NW.bdGroup(String(v)));
    const td2 = document.createElement('td');
    td2.textContent = NW.takaWords(String(v)) + ' টাকা';
    tr.appendChild(td1); tr.appendChild(td2);
    body.appendChild(tr);
  });
})();
