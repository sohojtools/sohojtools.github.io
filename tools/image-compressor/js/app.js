const drop = document.getElementById('drop');
const fileInput = document.getElementById('file');
const result = document.getElementById('result');
const preview = document.getElementById('preview');
const origSize = document.getElementById('origSize');
const newSize = document.getElementById('newSize');
const saved = document.getElementById('saved');
const download = document.getElementById('download');
let targetKB = 100;
let currentFile = null;

document.querySelectorAll('.kb-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.kb-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    targetKB = parseInt(btn.dataset.kb);
    document.getElementById('customKb').value = '';
    if (currentFile) compress(currentFile);
  });
});
document.getElementById('customKb').addEventListener('input', e => {
  const v = parseInt(e.target.value);
  if (v > 0) {
    targetKB = v;
    document.querySelectorAll('.kb-btn').forEach(b => b.classList.remove('active'));
    if (currentFile) compress(currentFile);
  }
});

drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('dragover', e => e.preventDefault());
drop.addEventListener('drop', e => {
  e.preventDefault();
  if (e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => { if (fileInput.files[0]) handle(fileInput.files[0]); });
document.getElementById('again').addEventListener('click', () => {
  result.hidden = true; drop.hidden = false; fileInput.value = ''; currentFile = null;
});

function handle(file){ currentFile = file; compress(file); }

async function compress(file){
  // Already under target → original file, zero quality loss
  if (file.size <= targetKB * 1024) {
    const url = URL.createObjectURL(file);
    preview.src = url;
    origSize.textContent = fmt(file.size);
    newSize.textContent = fmt(file.size);
    saved.textContent = '✓ আগে থেকেই লিমিটের নিচে — আসল ফাইল';
    download.href = url;
    download.download = file.name || 'image.jpg';
    drop.hidden = true;
    result.hidden = false;
    return;
  }

  const img = await loadImage(file);
  let blob;
  for (let s = 1; s >= 0.2; s -= 0.15) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * s);
    canvas.height = Math.round(img.height * s);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let q = 0.95;
    do {
      blob = await toBlob(canvas, q);
      q -= 0.07;
    } while (blob.size > targetKB*1024 && q > 0.1);
    if (blob.size <= targetKB*1024) break;
  }
  const url = URL.createObjectURL(blob);
  preview.src = url;
  origSize.textContent = fmt(file.size);
  newSize.textContent = fmt(blob.size);
  const pct = Math.round((1 - blob.size/file.size)*100);
  saved.textContent = '−'+pct+'%';
  download.href = url;
  download.download = 'compressed-'+targetKB+'kb.jpg';
  drop.hidden = true;
  result.hidden = false;
}

function fmt(bytes){
  if (bytes >= 1024*1024) return (bytes/1024/1024).toFixed(2)+' MB';
  return (bytes/1024).toFixed(1)+' KB';
}
function loadImage(file){
  return new Promise((res,rej)=>{
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = ()=>res(img);
    img.onerror = rej;
    img.src = url;
  });
}
function toBlob(canvas,q){
  return new Promise(res=>canvas.toBlob(b=>res(b),'image/jpeg',q));
}
