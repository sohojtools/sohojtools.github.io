/*
 * BMI utility — reusable, UI-independent.
 * Formula: BMI = weight(kg) / (height(m) * height(m))
 * Classification: WHO adult reference (18+). Not a diagnosis.
 */
window.BMI = (function(){
  const BN = '০১২৩৪৫৬৭৮৯';
  function normalizeNum(s){
    s = String(s).trim().replace(/[০-৯]/g, d => BN.indexOf(d)).replace(/\s/g, '');
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    return parseFloat(s);
  }
  function calc(heightCm, weightKg){
    const m = heightCm / 100;
    return weightKg / (m * m);
  }
  function classify(bmi){
    if (bmi < 18.5) return { key:'under',  label:'কম ওজন' };
    if (bmi < 25)   return { key:'normal', label:'স্বাভাবিক সীমা' };
    if (bmi < 30)   return { key:'over',   label:'অতিরিক্ত ওজন' };
    return { key:'obese', label:'স্থূলতার শ্রেণি' };
  }
  function refRange(heightCm){
    const m = heightCm / 100;
    return { lo: Math.round(18.5*m*m*10)/10, hi: Math.round(24.9*m*m*10)/10 };
  }
  const round1 = x => Math.round(x*10)/10;
  return { normalizeNum, calc, classify, refRange, round1 };
})();
