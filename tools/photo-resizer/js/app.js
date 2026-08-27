const MODES = {
  photo: { w: 300, h: 300, maxKB: 100, name: 'photo-300x300.jpg' },
  sign:  { w: 300, h: 80,  maxKB: 60,  name: 'signature-300x80.jpg' }
};
let mode = 'photo';

const drop = document.getElementById('drop');
const fileInput = document.getElementById('file');
const result = document.getElementById('result');
const preview = document.getElementById('preview');
const dims = document.getElementById('dims');
const sizeEl = document.getElementById('size');
const limitNote = document.getElementById('limitNote');
const download = document.getElementById('download');

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    result.hidden = true;
    drop.hidden = false;
  });
});

drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('dragover', e => { e.preventDefault(); });
drop.addEventListener('drop', e => {
  e.preventDefault();
  if (e.dataTransfer.files[0]) process(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => { if (fileInput.files[0]) process(fileInput.files[0]); });
document.getElementById('again').addEventListener('click', () => {
  result.hidden = true; drop.hidden = false; fileInput.value = '';
});

async function process(file) {
  const img = await loadImage(file);
  const { w, h, maxKB, name } = MODES[mode];

  const targetRatio = w / h;
  const imgRatio = img.width / img.height;
  let sw, sh, sx, sy;
  if (imgRatio > targetRatio) {
    sh = img.height; sw = sh * targetRatio;
    sy = 0; sx = (img.width - sw) / 2;
  } else {
    sw = img.width; sh = sw / targetRatio;
    sx = 0; sy = (img.height - sh) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  let quality = 0.92, blob;
  do {
    blob = await toBlob(canvas, quality);
    quality -= 0.07;
  } while (blob.size > maxKB * 1024 && quality > 0.1);

  const url = URL.createObjectURL(blob);
  preview.src = url;
  preview.style.width = w + 'px';
  preview.style.height = h + 'px';
  dims.textContent = w + '×' + h;
  sizeEl.textContent = (blob.size / 1024).toFixed(1) + ' KB';
  limitNote.textContent = blob.size <= maxKB * 1024 ? '✓ লিমিটের মধ্যে (' + maxKB + 'KB)' : '⚠ লিমিট ছাড়িয়েছে';
  download.href = url;
  download.download = name;

  drop.hidden = true;
  result.hidden = false;
}

function loadImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

function toBlob(canvas, quality) {
  return new Promise(res => canvas.toBlob(b => res(b), 'image/jpeg', quality));
}
