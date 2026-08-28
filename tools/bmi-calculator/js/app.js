const height = document.getElementById('height');
const weight = document.getElementById('weight');
const err = document.getElementById('err');
const result = document.getElementById('result');

document.getElementById('calcBtn').addEventListener('click', () => {
  const h = parseFloat(height.value);
  const w = parseFloat(weight.value);
  if (!h || !w || h < 50 || h > 250 || w < 10 || w > 300) {
    err.hidden = false; result.hidden = true; return;
  }
  err.hidden = true;

  const m = h / 100;
  const bmi = w / (m * m);
  const bmiRound = Math.round(bmi * 10) / 10;

  let label, color, bg;
  if (bmi < 18.5)      { label = 'কম ওজন';      color = '#d97706'; bg = 'rgba(217,119,6,.12)'; }
  else if (bmi < 25)   { label = 'স্বাভাবিক';    color = '#0a7a5a'; bg = 'rgba(10,122,90,.12)'; }
  else if (bmi < 30)   { label = 'অতিরিক্ত ওজন'; color = '#d97706'; bg = 'rgba(217,119,6,.12)'; }
  else                 { label = 'স্থূলতা';       color = '#dc2626'; bg = 'rgba(220,38,38,.12)'; }

  document.getElementById('bmiVal').textContent = bmiRound;
  const cat = document.getElementById('cat');
  cat.textContent = label;
  cat.style.color = color;
  cat.style.background = bg;

  const lo = (18.5 * m * m).toFixed(1);
  const hi = (24.9 * m * m).toFixed(1);
  document.getElementById('range').textContent = lo + ' – ' + hi + ' কেজি';

  result.hidden = false;
});
