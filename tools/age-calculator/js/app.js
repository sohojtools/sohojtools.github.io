const dob = document.getElementById('dob');
const asOn = document.getElementById('asOn');
const err = document.getElementById('err');
const result = document.getElementById('result');

function todayStr(){
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
asOn.value = todayStr();

const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

document.getElementById('calcBtn').addEventListener('click', () => {
  if (!dob.value || !asOn.value) { showErr(); return; }
  const b = new Date(dob.value+'T00:00:00');
  const a = new Date(asOn.value+'T00:00:00');
  if (isNaN(b.getTime()) || isNaN(a.getTime()) || b > a) { showErr(); return; }
  err.hidden = true;

  let y = a.getFullYear()-b.getFullYear();
  let m = a.getMonth()-b.getMonth();
  let d = a.getDate()-b.getDate();
  if (d < 0) { m -= 1; d += new Date(a.getFullYear(), a.getMonth(), 0).getDate(); }
  if (m < 0) { y -= 1; m += 12; }

  const totalDays = Math.round((a-b)/86400000);
  const totalWeeks = Math.floor(totalDays/7);
  const totalMonths = y*12+m;

  let nb = new Date(a.getFullYear(), b.getMonth(), b.getDate());
  if (nb <= a) nb = new Date(a.getFullYear()+1, b.getMonth(), b.getDate());
  const daysTo = Math.round((nb-a)/86400000);

  document.getElementById('ageBig').textContent = bn(y)+' বছর '+bn(m)+' মাস '+bn(d)+' দিন';
  document.getElementById('stMonths').textContent = bn(totalMonths);
  document.getElementById('stWeeks').textContent = bn(totalWeeks);
  document.getElementById('stDays').textContent = bn(totalDays);
  document.getElementById('stBday').textContent = daysTo === 0 ? 'আজ! 🎉' : bn(daysTo)+' দিন পরে';
  result.hidden = false;
});

function showErr(){ err.hidden = false; result.hidden = true; }
