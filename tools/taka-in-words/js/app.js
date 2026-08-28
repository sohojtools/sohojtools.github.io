const ONES = ['শূন্য','এক','দুই','তিন','চার','পাঁচ','ছয়','সাত','আট','নয়','দশ','এগারো','বারো','তেরো','চৌদ্দ','পনেরো','ষোলো','সতেরো','আঠারো','উনিশ','বিশ','একুশ','বাইশ','তেইশ','চব্বিশ','পঁচিশ','ছাব্বিশ','সাতাশ','আটাশ','ঊনত্রিশ','ত্রিশ','একত্রিশ','বত্রিশ','তেত্রিশ','চৌত্রিশ','পঁয়ত্রিশ','ছত্রিশ','সাতত্রিশ','আটত্রিশ','ঊনচল্লিশ','চল্লিশ','একচল্লিশ','বিয়াল্লিশ','তেতাল্লিশ','চুয়াল্লিশ','পঁয়তাল্লিশ','ছেচল্লিশ','সাতচল্লিশ','আটচল্লিশ','ঊনপঞ্চাশ','পঞ্চাশ','একান্ন','বাহান্ন','তিপ্পান্ন','চুয়ান্ন','পঞ্চান্ন','ছাপ্পান্ন','সাতান্ন','আটান্ন','ঊনষাট','ষাট','একষট্টি','বাষট্টি','তেষট্টি','চৌষট্টি','পঁয়ষট্টি','ছেষট্টি','সাতষট্টি','আটষট্টি','ঊনসত্তর','সত্তর','একাত্তর','বাহাত্তর','তিয়াত্তর','চুয়াত্তর','পঁচাত্তর','ছিয়াত্তর','সাতাত্তর','আটাত্তর','ঊনআশি','আশি','একাশি','বিরাশি','তিরাশি','চুরাশি','পঁচাশি','ছিয়াশি','সাতাশি','আটাশি','ঊননব্বই','নব্বই','একানব্বই','বিরানব্বই','তিরানব্বই','চুরানব্বই','পঁচানব্বই','ছিয়ানব্বই','সাতানব্বই','আটানব্বই','নিরানব্বই'];

function numWords(n){
  if (n === 0) return '';
  if (n < 100) return ONES[n];
  if (n < 1000) return ONES[Math.floor(n/100)] + ' শত' + (n%100 ? ' ' + ONES[n%100] : '');
  if (n < 100000) return numWords(Math.floor(n/1000)) + ' হাজার' + (n%1000 ? ' ' + numWords(n%1000) : '');
  if (n < 10000000) return numWords(Math.floor(n/100000)) + ' লাখ' + (n%100000 ? ' ' + numWords(n%100000) : '');
  return numWords(Math.floor(n/10000000)) + ' কোটি' + (n%10000000 ? ' ' + numWords(n%10000000) : '');
}

const amount = document.getElementById('amount');
const words = document.getElementById('words');
const copyBtn = document.getElementById('copyBtn');

amount.addEventListener('input', () => {
  const clean = amount.value.replace(/[,\s]/g, '');
  if (!clean) { words.textContent = 'এখানে বাংলা কথায় লেখা দেখা যাবে…'; return; }
  if (!/^\d{1,15}(\.\d{1,2})?$/.test(clean)) { words.textContent = 'সঠিক সংখ্যা লিখুন (যেমন: 125000)'; return; }
  const [taka, poisha] = clean.split('.');
  const t = parseInt(taka, 10);
  let out = (t === 0 ? 'শূন্য' : numWords(t)) + ' টাকা';
  if (poisha && parseInt(poisha,10) > 0) out += ' ' + numWords(parseInt(poisha,10)) + ' পয়সা';
  out += ' মাত্র';
  words.textContent = out;
});

copyBtn.addEventListener('click', async () => {
  const text = words.textContent;
  if (text.includes('…') || text.includes('সঠিক')) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'কপি হয়েছে ✓';
    setTimeout(() => copyBtn.textContent = 'কপি করুন', 1500);
  } catch(e) {
    copyBtn.textContent = 'কপি হয়নি — নিজে select করুন';
  }
});
