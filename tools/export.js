const {Resvg}=require('@resvg/resvg-js');
const sharp=require('sharp');
const fs=require('fs'),path=require('path');
const dir='D:/FluxMigrate/fluxmigrate/assets/brand';
const out=path.join(dir,'png');
fs.mkdirSync(out,{recursive:true});
function png(f,w){const svg=fs.readFileSync(path.join(dir,f),'utf8');
  return new Resvg(svg,{fitTo:{mode:'width',value:w},background:'rgba(0,0,0,0)',
    font:{fontDirs:['inter/extras/otf'],loadSystemFonts:true}}).render().asPng();}
const jobs=[
  ['fluxmigrate-mark.svg',            'logo-icon.png',            1024],
  ['fluxmigrate-mark.svg',            'logo-icon@2048.png',       2048],
  ['fluxmigrate-mark-white.svg',      'logo-icon-white.png',      1024],
  ['fluxmigrate-lockup-horizontal.svg','logo-lockup.png',         2400],
  ['fluxmigrate-lockup-horizontal.svg','logo-lockup@4800.png',    4800],
  ['fluxmigrate-lockup-horizontal-white.svg','logo-lockup-white.png',2400],
  ['fluxmigrate-lockup-horizontal-ink.svg','logo-lockup-ink.png', 2400],
  ['fluxmigrate-lockup-dotcom.svg',   'logo-lockup-dotcom.png',   2400],
  ['fluxmigrate-lockup-vertical.svg', 'logo-vertical.png',        1600],
  ['fluxmigrate-app-tile.svg',        'app-tile-1024.png',        1024],
  ['fluxmigrate-app-tile.svg',        'apple-touch-icon.png',      180],
  ['fluxmigrate-favicon.svg',         'favicon-16.png',             16],
  ['fluxmigrate-favicon.svg',         'favicon-32.png',             32],
  ['fluxmigrate-favicon.svg',         'favicon-48.png',             48],
  ['fluxmigrate-favicon.svg',         'favicon-192.png',           192],
  ['fluxmigrate-favicon.svg',         'favicon-512.png',           512],
  ['fluxmigrate-og.svg',              'og-image.png',             1200],
  ['fluxmigrate-og.svg',              'og-image@2x.png',          2400],
];
(async()=>{
  for(const [src,dst,w] of jobs){
    let buf=png(src,w);
    buf=await sharp(buf).png({compressionLevel:9,palette:false}).toBuffer();
    fs.writeFileSync(path.join(out,dst),buf);
    const m=await sharp(buf).metadata();
    console.log(dst.padEnd(26),`${m.width}x${m.height}`,(buf.length/1024).toFixed(1)+'KB',m.hasAlpha?'alpha':'no-alpha');
  }
})();
