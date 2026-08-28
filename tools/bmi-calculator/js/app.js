const $ = id => document.getElementById(id);
const B = window.BMI;

function setErr(input, el, msg){
  if (msg){ el.textContent = msg; el.hidden = false; input.closest('.field').classList.add('invalid'); }
  else { el.hidden = true; input.closest('.field').classList.remove('invalid'); }
}

$('calcBtn').addEventListener('click', () => {
  const hErr=$('hErr'), wErr=$('wErr'), aErr=$('aErr');
  setErr($('height'), hErr, ''); setErr($('weight'), wErr, ''); setErr($('age'), aErr, '');

  const hRaw = $('height').value.trim();
  const wRaw = $('weight').value.trim();
  const aRaw = $('age').value.trim();

  if (!hRaw){ setErr($('height'), hErr, 'উচ্চতা লিখুন।'); return; }
  if (!wRaw){ setErr($('weight'), wErr, 'ওজন লিখুন।'); return; }

  const h = B.normalizeNum(hRaw);
  const w = B.normalizeNum(wRaw);
  if (h === null || h < 50 || h > 250){ setErr($('height'), hErr, 'সঠিক উচ্চতা লিখুন।'); return; }
  if (w === null || w < 10 || w > 300){ setErr($('weight'), wErr, 'সঠিক ওজন লিখুন।'); return; }

  let age = null;
  if (aRaw){
    age = B.normalizeNum(aRaw);
    if (age === null || age < 1 || age > 120){ setErr($('age'), aErr, 'সঠিক বয়স লিখুন।'); return; }
  }

  const bmi = B.calc(h, w);
  const shown = B.round1(bmi);
  const minor = age !== null && age < 18;

  $('bmiVal').textContent = shown;
  $('bdH').textContent = h + ' সেমি';
  $('bdW').textContent = w + ' কেজি';

  const cat = $('cat'), rangeNote = $('rangeNote'), minorNote = $('minorNote');
  if (minor){
    cat.hidden = true;
    rangeNote.hidden = true;
    minorNote.hidden = false;
  } else {
    minorNote.hidden = true;
    const c = B.classify(bmi);
    cat.className = 'cat ' + c.key;
    $('catText').textContent = 'সাধারণ adult BMI classification: ' + c.label;
    cat.hidden = false;
    const r = B.refRange(h);
    rangeNote.textContent = 'BMI reference range (18.5–24.9) অনুযায়ী আনুমানিক ওজনের সীমা: ' + r.lo + '–' + r.hi + ' কেজি। এটি সাধারণ রেফারেন্স, চিকিৎসা-লক্ষ্য নয়।';
    rangeNote.hidden = false;
  }

  $('result').hidden = false;
  $('feedback').textContent = '';
});

$('copyBtn').addEventListener('click', async () => {
  if ($('result').hidden) return;
  let text = 'BMI: ' + $('bmiVal').textContent + '\nউচ্চতা: ' + $('bdH').textContent + '\nওজন: ' + $('bdW').textContent;
  if (!$('cat').hidden) text += '\nশ্রেণিবিন্যাস: ' + $('catText').textContent.replace('সাধারণ adult BMI classification: ', '') + ' (প্রাপ্তবয়স্ক)';
  try { await navigator.clipboard.writeText(text); $('feedback').textContent = 'ফলাফল কপি হয়েছে।'; }
  catch(e){ $('feedback').textContent = 'কপি করা যায়নি। ফলাফলটি নির্বাচন করে কপি করুন।'; }
});

$('resetBtn').addEventListener('click', () => {
  $('height').value = ''; $('weight').value = ''; $('age').value = '';
  setErr($('height'), $('hErr'), ''); setErr($('weight'), $('wErr'), ''); setErr($('age'), $('aErr'), '');
  $('result').hidden = true;
  $('feedback').textContent = '';
  $('height').focus();
});
