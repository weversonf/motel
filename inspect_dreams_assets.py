from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path('/home/ubuntu/motel/LP/Dreams/assets')
files = sorted([p for p in root.iterdir() if p.suffix.lower() in {'.jpg', '.jpeg', '.png'} and p.name != 'logo-dreams.png'])
thumb_w, thumb_h = 280, 190
label_h = 34
cols = 4
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * thumb_w, rows * (thumb_h + label_h)), '#101312')
draw = ImageDraw.Draw(sheet)
for idx, path in enumerate(files):
    x = (idx % cols) * thumb_w
    y = (idx // cols) * (thumb_h + label_h)
    try:
        image = Image.open(path).convert('RGB')
        image.thumbnail((thumb_w - 12, thumb_h - 12))
        px = x + (thumb_w - image.width) // 2
        py = y + (thumb_h - image.height) // 2
        sheet.paste(image, (px, py))
        draw.rectangle((x, y, x + thumb_w - 1, y + thumb_h - 1), outline='#55ff97', width=1)
        draw.text((x + 7, y + thumb_h + 8), path.name[:38], fill='#d9f7e5')
    except Exception as exc:
        draw.text((x + 7, y + 7), f'{path.name}: {exc}', fill='#ff8b8b')
out = Path('/home/ubuntu/motel/LP/Dreams/dreams_assets_contact_sheet.jpg')
sheet.save(out, quality=90)
print(out)
