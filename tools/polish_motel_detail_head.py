from pathlib import Path
import re

ROOT = Path('/home/ubuntu/motel/site-moteis-fortaleza-novo/motel')
phones = {
    'assahi-motel.html': ('8532562525', '(85) 3256-2525'),
    'dragon-motel.html': ('8532730600', '(85) 3273-0600'),
    'dreams-motel.html': ('8532795788', '(85) 3279-5788'),
    'spa-urbano.html': ('8532578877', '(85) 3257-8877'),
}
font_block = '''    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
'''

for filename, (phone_href, phone_text) in phones.items():
    path = ROOT / filename
    html = path.read_text(encoding='utf-8')
    if 'fonts.googleapis.com/css2?family=Montserrat' not in html:
        html = html.replace('    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />', font_block + '    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />', 1)
    html = html.replace('    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" />', '    <style>body{font-family:Inter,sans-serif;}h1,h2,h3,h4,h5,h6,.navbar-nav>li>a,.btn,.mf-chat-widget,.mf-sticky-reservation{font-family:Montserrat,sans-serif;}h1,h2,h3,h4,h5,h6{font-weight:500;}p,li{font-family:Inter,sans-serif;}</style>\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" />', 1)
    html = re.sub(r'<li><a href="tel:8532578877"><i class="fa fa-phone"></i> \(85\) 3257-8877</a></li>', f'<li><a href="tel:{phone_href}"><i class="fa fa-phone"></i> {phone_text}</a></li>', html, count=1)
    path.write_text(html, encoding='utf-8')
    print(f'polished {path}')
