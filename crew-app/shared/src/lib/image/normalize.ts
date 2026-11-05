export type Scene = { dataUrl: string; width: number; height: number };
export class PhotoError extends Error { constructor(public code: 'type'|'size'|'pixels'|'decode') { super(code); } }
export async function normalizePhoto(file: File): Promise<Scene> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new PhotoError('type');
  if (file.size > 10 * 1024 * 1024) throw new PhotoError('size');
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { throw new PhotoError('decode'); }
  try {
    if (bitmap.width * bitmap.height > 24_000_000) throw new PhotoError('pixels');
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * ratio); canvas.height = Math.round(bitmap.height * ratio);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#eee'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    let quality = .9; let dataUrl = canvas.toDataURL('image/jpeg', quality);
    while (dataUrl.length * .75 > 1_000_000 && quality > .4) { quality -= .1; dataUrl = canvas.toDataURL('image/jpeg', quality); }
    if (dataUrl.length * .75 > 1_000_000) throw new PhotoError('size');
    return {dataUrl,width:canvas.width,height:canvas.height};
  } finally { bitmap.close(); }
}
export async function rotateScene(scene: Scene): Promise<Scene> {
  const img = new Image(); img.src = scene.dataUrl; await img.decode();
  const canvas = document.createElement('canvas'); canvas.width=scene.height; canvas.height=scene.width;
  const ctx=canvas.getContext('2d')!; ctx.translate(canvas.width,0); ctx.rotate(Math.PI/2); ctx.drawImage(img,0,0);
  return {dataUrl:canvas.toDataURL('image/jpeg',.9),width:canvas.width,height:canvas.height};
}
export function pointInPhoto(clientX:number,clientY:number,rect:{left:number;top:number;width:number;height:number}) {
  return {x:Math.max(.04,Math.min(.96,(clientX-rect.left)/rect.width)),y:Math.max(.04,Math.min(.96,(clientY-rect.top)/rect.height))};
}
