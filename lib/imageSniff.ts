// نتحقق من نوع الصورة من البايتات نفسها (لا نثق بالامتداد ولا بـ Content-Type القادم من العميل)
export function sniffImage(b: Buffer): { mime: string; ext: string } | null {
  if (b.length > 12 && b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return { mime: 'image/png', ext: 'png' };
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    return { mime: 'image/webp', ext: 'webp' };
  }
  return null;
}
