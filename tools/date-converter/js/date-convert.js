/*
 * DateConvert — calendar conversion utility
 * Conventions:
 *  - Bengali: Bangladesh procholito revised Bengali calendar (ICU 'bengali' via Intl).
 *  - Hijri: ICU Islamic calendar (Umm al-Qura if available, else civil tabular).
 *    Local moon-sighting decisions may differ by 1 day.
 *  - Supported Gregorian range: 1900-01-01 to 2099-12-31.
 * Limitations: Do NOT replace with "year - 593" arithmetic; conversions are
 * date-specific via ICU calendar data.
 */
window.DateConvert = (function(){
  const MIN = new Date(1900,0,1), MAX = new Date(2099,11,31);
  const BN = '০১২৩৪৫৬৭৮৯';
  const toBn = s => String(s).replace(/\d/g, d => BN[d]);
  const BN_MONTHS = ['বৈশাখ','জ্যৈষ্ঠ','আষাঢ়','শ্রাবণ','ভাদ্র','আশ্বিন','কার্তিক','অগ্রহায়ণ','পৌষ','মাঘ','ফাল্গুন','চৈত্র'];
  const HIJRI_MONTHS = ['মহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'];
  const EN_MONTHS_BN = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

  const bnBengaliNum = new Intl.DateTimeFormat('en-u-ca-bengali', {day:'numeric', month:'numeric', year:'numeric'});
  let hijriNum;
  try { hijriNum = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {day:'numeric', month:'numeric', year:'numeric'}); }
  catch(e){ hijriNum = new Intl.DateTimeFormat('en-u-ca-islamic', {day:'numeric', month:'numeric', year:'numeric'}); }

  function parts(fmt, d){
    const p = fmt.formatToParts(d);
    const get = t => { const x = p.find(y => y.type === t); return x ? parseInt(x.value, 10) : 0; };
    return { day: get('day'), month: get('month'), year: get('year') };
  }
  function inRange(d){ return d >= MIN && d <= MAX; }
  function bengaliParts(d){ return parts(bnBengaliNum, d); }

  function findGregorian(bd, bm, by){
    for (let i = 0; i < 460; i++){
      const d = new Date(by + 593, 2, 1 + i);
      const p = bengaliParts(d);
      if (p.day === bd && p.month === bm && p.year === by) return d;
    }
    return null;
  }

  function formatAll(d, bnDigits){
    const bp = bengaliParts(d);
    let hp = null;
    try { hp = parts(hijriNum, d); } catch(e){}
    const en = d.getDate() + ' ' + EN_MONTHS_BN[d.getMonth()] + ' ' + d.getFullYear();
    const bn = bp.day + ' ' + BN_MONTHS[bp.month-1] + ' ' + bp.year + ' বঙ্গাব্দ';
    const hj = hp ? (hp.day + ' ' + HIJRI_MONTHS[hp.month-1] + ' ' + hp.year + ' হিজরি') : '—';
    if (bnDigits) return { en: toBn(en), bn: toBn(bn), hijri: toBn(hj) };
    return { en, bn, hijri: hj };
  }

  return { BN_MONTHS, toBn, inRange, bengaliParts, findGregorian, formatAll };
})();
