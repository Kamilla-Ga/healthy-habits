export const AVATAR_LIMIT = 12 * 1024 * 1024;
export function loadAvatarFile(file) {
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)) return Promise.reject(Error('Выбери фотографию JPG, PNG или WebP. HEIC можно сначала сохранить как JPG.'));
 if(file.size>AVATAR_LIMIT)return Promise.reject(Error('Фото слишком большое. Выбери файл до 12 МБ.'));
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{if(!img.naturalWidth||img.naturalWidth*img.naturalHeight>50000000){URL.revokeObjectURL(url);reject(Error('Изображение слишком большое по размеру. Выбери уменьшенную копию.'));}else resolve({url,img});};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Не получилось открыть изображение. Попробуй другое фото.'));};img.src=url;
 });
}
export function cropAvatar(img,x=50,y=50) {
 const size=Math.min(img.naturalWidth,img.naturalHeight),canvas=document.createElement('canvas');canvas.width=canvas.height=320;
 const context=canvas.getContext('2d');if(!context)throw Error('Браузер не смог подготовить фото. Попробуй другое изображение.');
 context.fillStyle='#fcf7f5';context.fillRect(0,0,320,320);
 context.drawImage(img,(img.naturalWidth-size)*x/100,(img.naturalHeight-size)*y/100,size,size,0,0,320,320);
 return canvas.toDataURL('image/jpeg',0.85);
}
