from pathlib import Path
import re

LP_ROOT = Path('/home/ubuntu/motel/LP')
CHAT_URL = 'https://reservas.moteisfortaleza.com/'

# Encontrar todos os arquivos index.html nas subpastas de LP
files = list(LP_ROOT.glob('**/index.html'))

for path in files:
    html = path.read_text(encoding='utf-8')
    
    # 1. Substituir o link antigo do chatbot/site pelo novo link direto
    # O link antigo costuma ser https://weversonf.github.io/motel/
    # ou variações com subpastas
    
    # Substituir links que apontam para o repositório base ou o chat antigo
    html = re.sub(r'href="https://weversonf\.github\.io/motel/(?![^"]*?LP/)"', f'href="{CHAT_URL}"', html)
    
    # Garantir que qualquer link com texto "Reservar" aponte para o chat
    # <a ...>Reservar</a>
    pattern = r'(<a\s+[^>]*?href=")([^"]*?)("[^>]*?>\s*Reservar[^<]*?</a>)'
    html = re.sub(pattern, rf'\1{CHAT_URL}\3', html, flags=re.IGNORECASE)

    path.write_text(html, encoding='utf-8')
    print(f'fixed reservation links in {path}')
