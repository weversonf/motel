from pathlib import Path
import re

ROOT = Path('/home/ubuntu/motel/site-moteis-fortaleza-novo/motel')
PAGES = ['assahi-motel.html', 'dragon-motel.html', 'dreams-motel.html', 'spa-urbano.html']

for filename in PAGES:
    path = ROOT / filename
    if not path.exists():
        continue
        
    html = path.read_text(encoding='utf-8')
    
    # Padrão para encontrar e remover a div mf-rate-table-wrap e a nota mf-rate-note
    # Também vamos ajustar o parágrafo de introdução da seção para ser mais direto
    
    # 1. Remover a nota e a tabela
    html = re.sub(r'<p class="mf-rate-note">.*?</p>', 
                  '<p class="mf-rate-intro" style="margin-bottom: 20px;">Consulte os valores atualizados e a disponibilidade em tempo real diretamente com nossa equipe digital.</p>', 
                  html, flags=re.DOTALL)
    
    html = re.sub(r'<div class="mf-rate-table-wrap">.*?</div>', '', html, flags=re.DOTALL)
    
    # 2. Ajustar o espaçamento do botão para ficar mais harmônico sem a tabela
    html = html.replace('style="margin-top: 25px; text-align: center;"', 
                        'style="margin-top: 10px; text-align: center;"')
    
    path.write_text(html, encoding='utf-8')
    print(f'removed rate table from {filename}')
