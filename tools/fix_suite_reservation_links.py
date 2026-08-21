from pathlib import Path
import re

ROOT = Path('/home/ubuntu/motel/site-moteis-fortaleza-novo/motel')
PAGES = ['assahi-motel.html', 'dragon-motel.html', 'dreams-motel.html', 'spa-urbano.html']
CHAT_URL = 'https://reservas.moteisfortaleza.com/'

for filename in PAGES:
    path = ROOT / filename
    if not path.exists():
        continue
        
    html = path.read_text(encoding='utf-8')
    
    # 1. Substituir links de reserva individuais que apontam para wa.me ou similares
    # Procuramos por tags <a> que contenham o texto "RESERVAR" e substituímos o href
    # Padrão: <a href="..." ...>RESERVAR</a>
    
    # Regex para encontrar links de reserva (independente do link de destino atual)
    # que tenham a classe ou texto de reserva
    html = re.sub(r'href="https://wa\.me/[^"]+"', f'href="{CHAT_URL}"', html)
    html = re.sub(r'href="https://api\.whatsapp\.com/[^"]+"', f'href="{CHAT_URL}"', html)
    
    # Garantir que botões com texto RESERVAR apontem para o chat
    # <a href="..." class="btn-orange">RESERVAR</a>
    pattern = r'(<a\s+[^>]*?href=")([^"]*?)("[^>]*?>\s*RESERVAR\s*</a>)'
    html = re.sub(pattern, rf'\1{CHAT_URL}\3', html, flags=re.IGNORECASE)

    path.write_text(html, encoding='utf-8')
    print(f'fixed suite reservation links in {filename}')
