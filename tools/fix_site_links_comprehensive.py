from pathlib import Path
import re

SITE_ROOT = Path('/home/ubuntu/motel/site-moteis-fortaleza-novo')
CHAT_URL = 'https://reservas.moteisfortaleza.com/'

# Encontrar todos os arquivos .html no site novo
files = list(SITE_ROOT.glob('**/*.html'))

for path in files:
    html = path.read_text(encoding='utf-8')
    
    # 1. Substituir links de WhatsApp (wa.me e api.whatsapp.com)
    html = re.sub(r'href="https://wa\.me/[^"]+"', f'href="{CHAT_URL}"', html)
    html = re.sub(r'href="https://api\.whatsapp\.com/[^"]+"', f'href="{CHAT_URL}"', html)
    
    # 2. Substituir links que apontam para o repositório base ou o chat antigo
    # mas mantendo links internos (que começam com motel/ ou images/ etc)
    html = re.sub(r'href="https://weversonf\.github\.io/motel/(?![^"]*?(motel/|img/|css/|js/))"', f'href="{CHAT_URL}"', html)
    
    # 3. Remover o ícone do WhatsApp se estiver dentro do botão de reserva
    html = html.replace('<i class="fa fa-whatsapp"></i> Reservar', 'Reservar')
    html = html.replace('<i class="fab fa-whatsapp"></i> Reservar', 'Reservar')
    
    # 4. Atualizar qualquer variável JS ou iframe que aponte para o link antigo
    html = html.replace("const reservationUrl = 'https://weversonf.github.io/motel/';", f"const reservationUrl = '{CHAT_URL}';")
    html = html.replace('src="https://weversonf.github.io/motel/"', f'src="{CHAT_URL}"')

    path.write_text(html, encoding='utf-8')
    print(f'fixed links in {path}')
