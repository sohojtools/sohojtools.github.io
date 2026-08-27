const MODES = {
  photo: { w: 300, h: 300, maxKB: 100, name: 'photo-300x300.jpg' },
  sign:  { w: 300, h: 80,  maxKB: 60,  name: 'signature-300x80.jpg' }
};
let mode = 'photo';
let cropper = null;

const drop = document.getElementById('drop');
const fileInput = document.getElementById('file');
const cropArea = document.getElementById('cropArea');
const cropImg = document.getElementById('cropImg');
const actions = document.getElementById('actions');
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
    if (cropper) cropper.setAspectRatio(MODES[mode].w / MODES[mode].h);
  });
});

drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('dragover', e => e.preventDefault());
drop.addEventListener('drop', e => {
  e.preventDefault();
  if (e.dataTransfer.files[0]) startCrop(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => { if (fileInput.files[0]) startCrop(fileInput.files[0]); });

function startCrop(file) {
  cropImg.src = URL.createObjectURL(file);
  drop.hidden = true;
  result.hidden = true;
  cropArea.hidden = false;
  actions.hidden = false;
  if (cropper) cropper.destroy();
  cropper = new Cropper(cropImg, {
    aspectRatio: MODES[mode].w / MODES[mode].h,
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 1,
    background: false
  });
}

document.getElementById('zoomIn').addEventListener('click', () => cropper && cropper.zoom(0.1));
document.getElementById('zoomOut').addEventListener('click', () => cropper && cropper.zoom(-0.1));
document.getElementById('cancel').addEventListener('click', resetAll);
document.getElementById('again').addEventListener('click', resetAll);

function resetAll() {
  if (cropper) { cropper.destroy(); cropper = null; }
  cropArea.hidden = true;
  actions.hidden = true;
  result.hidden = true;
  drop.hidden = false;
  fileInput.value = '';
}

document.getElementById('apply').addEventListener('click', async () => {
  if (!cropper) return;
  const { w, h, maxKB, name } = MODES[mode];
  const canvas = cropper.getCroppedCanvas({ width: w, height: h, imageSmoothingQuality: 'high' });

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

  cropArea.hidden = true;
  actions.hidden = true;
  result.hidden = false;
});

function toBlob(canvas, quality) {
  return new Promise(res => canvas.toBlob(b => res(b), 'image/jpeg', quality));
}
