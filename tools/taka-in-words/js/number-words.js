/* Reusable Bengali number-words utility (Bangladesh crore-lakh system) */
window.NumberWordsBN = (function(){
  const ONES = ['শূন্য','এক','দুই','তিন','চার','পাঁচ','ছয়','সাত','আট','নয়','দশ','এগারো','বারো','তেরো','চৌদ্দ','পনেরো','ষোলো','সতেরো','আঠারো','উনিশ','বিশ','একুশ','বাইশ','তেইশ','চব্বিশ','পঁচিশ','ছাব্বিশ','সাতাশ','আটাশ','ঊনত্রিশ','ত্রিশ','একত্রিশ','বত্রিশ','তেত্রিশ','চৌত্রিশ','পঁয়ত্রিশ','ছত্রিশ','সাতত্রিশ','আটত্রিশ','ঊনচল্লিশ','চল্লিশ','একচল্লিশ','বিয়াল্লিশ','তেতাল্লিশ','চুয়াল্লিশ','পঁয়তাল্লিশ','ছেচল্লিশ','সাতচল্লিশ','আটচল্লিশ','ঊনপঞ্চাশ','পঞ্চাশ','একান্ন','বাহান্ন','তিপ্পান্ন','চুয়ান্ন','পঞ্চান্ন','ছাপ্পান্ন','সাতান্ন','আটান্ন','ঊনষাট','ষাট','একষট্টি','বাষট্টি','তেষট্টি','চৌষট্টি','পঁয়ষট্টি','ছেষট্টি','সাতষট্টি','আটষট্টি','ঊনসত্তর','সত্তর','একাত্তর','বাহাত্তর','তিয়াত্তর','চুয়াত্তর','পঁচাত্তর','ছিয়াত্তর','সাতাত্তর','আটাত্তর','ঊনআশি','আশি','একাশি','বিরাশি','তিরাশি','চুরাশি','পঁচাশি','ছিয়াশি','সাতাশি','আটাশি','ঊননব্বই','নব্বই','একানব্বই','বিরানব্বই','তিরানব্বই','চুরানব্বই','পঁচানব্বই','ছিয়ানব্বই','সাতানব্বই','আটানব্বই','নিরানব্বই'];
  const BN = '০১২৩৪৫৬৭৮৯';

  function numWords(n){
    if (n === 0) return '';
    if (n < 100) return ONES[n];
    if (n < 1000) return ONES[Math.floor(n/100)] + ' শত' + (n%100 ? ' ' + ONES[n%100] : '');
    if (n < 100000) return numWords(Math.floor(n/1000)) + ' হাজার' + (n%1000 ? ' ' + numWords(n%1000) : '');
    if (n < 10000000) return numWords(Math.floor(n/100000)) + ' লাখ' + (n%100000 ? ' ' + numWords(n%100000) : '');
    return numWords(Math.floor(n/10000000)) + ' কোটি' + (n%10000000 ? ' ' + numWords(n%10000000) : '');
  }
  function takaWords(intStr){
    const n = parseInt(intStr, 10);
    if (n === 0) return 'শূন্য';
    return numWords(n);
  }
  function bdGroup(intStr){
    intStr = String(parseInt(intStr, 10));
    if (intStr.length <= 3) return intStr;
    const last3 = intStr.slice(-3);
    let rest = intStr.slice(0, -3);
    const parts = [];
    while (rest.length > 2){ parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
    if (rest) parts.unshift(rest);
    return parts.join(',') + ',' + last3;
  }
  function toBn(str){ return String(str).replace(/\d/g, d => BN[d]); }
  function normalize(raw){
    let s = String(raw).trim();
    if (!s) return { ok:false, empty:true };
    s = s.replace(/[০-৯]/g, d => BN.indexOf(d));
    s = s.replace(/[,\s]/g, '');
    if (s.startsWith('-')) return { ok:false, error:'ঋণাত্মক সংখ্যা এখানে ব্যবহার করা যাবে না।' };
    if (!/^\d+(\.\d+)?$/.test(s)) return { ok:false, error:'শুধু একটি বৈধ টাকার পরিমাণ লিখুন।' };
    let parts = s.split('.');
    if (parts[0].length > 15) return { ok:false, error:'এত বড় সংখ্যা সমর্থিত নয়।' };
    let poisha = 0;
    if (parts[1] !== undefined){
      if (parts[1].length > 2) return { ok:false, error:'সর্বোচ্চ ২ ঘর দশমিক ব্যবহার করুন।' };
      poisha = parseInt(parts[1].padEnd(2, '0'), 10);
    }
    return { ok:true, int: parts[0], poisha: poisha };
  }
  return { numWords, takaWords, bdGroup, toBn, normalize };
})();
