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
    
    # 1. Alterar o título da seção de tarifas
    html = html.replace('<h3 id="mf-rate-title">Escolha o seu período</h3>', 
                        '<h3 id="mf-rate-title">Confira valores e faça sua reserva</h3>')
    
    # 2. Adicionar o botão do Chatbot após a tabela de tarifas ou nota
    # Vamos inserir logo após a div da tabela mf-rate-table-wrap
    btn_markup = f'\n                <div class="mf-rate-actions" style="margin-top: 25px; text-align: center;">\n                    <a href="{CHAT_URL}" class="btn btn-orange btn-lg" style="padding: 15px 40px; font-weight: 600; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(255,136,0,0.3);">Abrir Chat de Reservas</a>\n                </div>'
    
    if 'class="mf-rate-actions"' not in html:
        html = html.replace('</div>\n            </section>\n\n            <section class="mf-detail-panel" aria-labelledby="mf-faq-title">',
                            btn_markup + '\n            </section>\n\n            <section class="mf-detail-panel" aria-labelledby="mf-faq-title">')

    # 3. Remover o botão flutuante do WhatsApp (mf-sticky-reservation)
    html = re.sub(r'\n\s*<a class="mf-sticky-reservation".*?</a>', '', html, flags=re.DOTALL)
    
    path.write_text(html, encoding='utf-8')
    print(f'updated reservation flow in {filename}')
