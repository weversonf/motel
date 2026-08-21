from pathlib import Path

ROOT = Path('/home/ubuntu/motel/site-moteis-fortaleza-novo/motel')
PAGES = ['assahi-motel.html', 'dragon-motel.html', 'dreams-motel.html', 'spa-urbano.html']
CHAT_URL = 'https://reservas.moteisfortaleza.com/'

btn_markup = f'\n                <div class="mf-rate-actions" style="margin-top: 10px; text-align: center;">\n                    <a href="{CHAT_URL}" class="btn btn-orange btn-lg" style="padding: 15px 40px; font-weight: 600; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(255,136,0,0.3);">Abrir Chat de Reservas</a>\n                </div>'

for filename in PAGES:
    path = ROOT / filename
    if not path.exists():
        continue
        
    html = path.read_text(encoding='utf-8')
    
    # Se o botão ficou fora da seção (após o </section> da mf-rate-panel)
    if '</section>\n\n            <section class="mf-detail-panel" aria-labelledby="mf-faq-title">' in html:
        # A remoção anterior pode ter deixado o botão "solto" ou removido ele se estava dentro da div da tabela
        # Vamos garantir que ele esteja logo após o parágrafo introdutório
        html = html.replace('diretamente com nossa equipe digital.</p>', 
                            'diretamente com nossa equipe digital.</p>' + btn_markup)
        
    path.write_text(html, encoding='utf-8')
    print(f'fixed button placement in {filename}')
