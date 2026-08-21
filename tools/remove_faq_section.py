from pathlib import Path
import re

ROOT = Path('/home/ubuntu/motel/site-moteis-fortaleza-novo/motel')
PAGES = ['assahi-motel.html', 'dragon-motel.html', 'dreams-motel.html', 'spa-urbano.html']

for filename in PAGES:
    path = ROOT / filename
    if not path.exists():
        continue
        
    html = path.read_text(encoding='utf-8')
    
    # Padrão para encontrar e remover a section mf-detail-panel que contém o FAQ
    # Identificada por aria-labelledby="mf-faq-title"
    html = re.sub(r'<section class="mf-detail-panel" aria-labelledby="mf-faq-title">.*?</section>', 
                  '', html, flags=re.DOTALL)
    
    path.write_text(html, encoding='utf-8')
    print(f'removed FAQ section from {filename}')
