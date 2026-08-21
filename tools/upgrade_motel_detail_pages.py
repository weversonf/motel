from pathlib import Path
from html import escape
import re

ROOT = Path('/home/ubuntu/motel/site-moteis-fortaleza-novo')

MOTELS = {
    'assahi-motel.html': {
        'key': 'assahi',
        'accent': '#c56a2d',
        'name': 'Assahi Motel',
        'eyebrow': 'Experiência temática',
        'intro_title': 'Privacidade, conforto e uma experiência inspirada no mundo.',
        'intro': 'O Assahi reúne suítes temáticas, ambientes amplos e detalhes pensados para transformar cada estadia em uma experiência reservada e especial.',
        'summary_title': 'Uma escolha para quem valoriza atmosfera',
        'summary': 'Escolha sua suíte, confira as condições do período e fale com nossa equipe pelo chat de reservas.',
        'address': 'Av. Luciano Carneiro, 605 - Fátima, Fortaleza - CE',
        'phone': '(85) 3256-2525',
        'phone_href': 'tel:8532562525',
        'map_query': 'Av.+Luciano+Carneiro,+605+-+Fatima,+Fortaleza+-+CE',
        'features': [
            ('fa-lock', 'Acesso reservado', 'Entrada discreta e privacidade em todos os momentos.'),
            ('fa-bath', 'Suítes com hidro', 'Opções com hidromassagem, ofurô e ambientes amplos.'),
            ('fa-star', 'Temas exclusivos', 'Decorações inspiradas em destinos e experiências marcantes.'),
        ],
        'gallery': [
            ('suite-tahiti.jpg', 'Suíte Tahiti'),
            ('suite-bora-bora.jpg', 'Suíte Bora Bora'),
            ('suite-cancun.jpg', 'Suíte Cancún'),
            ('suite-mandala.jpg', 'Suíte Mandala'),
        ],
        'faq': [
            ('Como escolher a melhor suíte?', 'Use as comodidades e a faixa de valor como referência. Se preferir, nossa equipe ajuda você pelo chat de reservas.'),
            ('O Assahi possui opções premium?', 'Sim. A Mandala, a Cancún e outras categorias oferecem ambientes maiores e recursos especiais. Consulte a disponibilidade.'),
        ],
        'rows': [('Suíte Tahiti', '180', '335'), ('Suíte Bora Bora', '208', '384'), ('Suíte Mauí (Cadeirante)', '240', '440'), ('Suíte Honolulu', '268', '489'), ('Suíte Kauai', '281', '511'), ('Suíte Cancún', '663', '1180'), ('Suíte Mandala', '997', '1765')],
    },
    'dragon-motel.html': {
        'key': 'dragon',
        'accent': '#b83a3a',
        'name': 'Dragon Motel',
        'eyebrow': 'Experiência oriental',
        'intro_title': 'Um cenário marcante para viver o seu momento.',
        'intro': 'No Luciano Cavalcante, o Dragon combina referências orientais, iluminação envolvente e suítes desenhadas para oferecer conforto, discrição e personalidade.',
        'summary_title': 'Atmosfera que foge do comum',
        'summary': 'Das opções aconchegantes às suítes mais completas, escolha o ambiente que combina com a sua ocasião.',
        'address': 'Rua José Alencar Ramos, 50 - Luciano Cavalcante, Fortaleza - CE',
        'phone': '(85) 3273-0600',
        'phone_href': 'tel:8532730600',
        'map_query': 'Rua+Jose+Alencar+Ramos,+50+-+Luciano+Cavalcante,+Fortaleza+-+CE',
        'features': [
            ('fa-dragon', 'Temática oriental', 'Arquitetura e ambientação com identidade própria.'),
            ('fa-bath', 'Hidromassagem', 'Suítes selecionadas com hidro, ofurô e sala de estar.'),
            ('fa-car', 'Localização estratégica', 'Acesso prático pelo Luciano Cavalcante.'),
        ],
        'gallery': [
            ('suite-sonho.jpg', 'Suíte Sonho'),
            ('suite-felicidade.jpg', 'Suíte Felicidade'),
            ('suite-inspiracao.jpg', 'Suíte Inspiração'),
            ('suite-sucesso.jpg', 'Suíte Sucesso'),
        ],
        'faq': [
            ('Qual suíte combina com uma ocasião especial?', 'A Suíte Felicidade e a Suíte Sucesso oferecem mais espaço e recursos para quem busca uma experiência completa.'),
            ('Como chego ao Dragon?', 'Use o mapa desta página para abrir a rota no seu celular. O endereço fica no Luciano Cavalcante, em Fortaleza.'),
        ],
        'rows': [('Suíte Sonho', '193', '357'), ('Suíte Inspiração', '259', '473'), ('Suíte Felicidade', '301', '547'), ('Suíte Sucesso', '552', '986')],
    },
    'dreams-motel.html': {
        'key': 'dreams',
        'accent': '#16a36f',
        'name': 'Dreams Motel',
        'eyebrow': 'Conforto na BR-116',
        'intro_title': 'Praticidade, conforto e uma pausa só sua.',
        'intro': 'O Dreams é uma opção inteligente para quem circula pela BR-116 e procura privacidade, atendimento objetivo e suítes confortáveis para diferentes momentos.',
        'summary_title': 'Escolha simples, experiência segura',
        'summary': 'Consulte as opções disponíveis, veja os valores de referência e confirme a sua reserva no chat.',
        'address': 'BR 116 KM 06, 2430 - Cajazeiras, Fortaleza - CE',
        'phone': '(85) 3279-5788',
        'phone_href': 'tel:8532795788',
        'map_query': 'BR+116+KM+06,+2430+-+Cajazeiras,+Fortaleza+-+CE',
        'features': [
            ('fa-road', 'Acesso pela BR-116', 'Localização prática para quem está na região de Cajazeiras.'),
            ('fa-bed', 'Categorias variadas', 'Opções para uma pausa rápida ou uma estadia mais completa.'),
            ('fa-wifi', 'Conforto essencial', 'Ambientes climatizados e recursos para uma experiência tranquila.'),
        ],
        'gallery': [
            ('suite-sonho.jpg', 'Suíte Master'),
            ('suite-honolulu.jpg', 'Suíte Luxo'),
            ('suite-felicidade.jpg', 'Detalhes de conforto'),
            ('suite-inspiracao.jpg', 'Ambiente reservado'),
        ],
        'faq': [
            ('O Dreams fica próximo à BR-116?', 'Sim. A unidade está localizada na BR 116 KM 06, em Cajazeiras, com acesso indicado pelo mapa acima.'),
            ('Posso consultar o valor de cada período?', 'Sim. A tabela de tarifas apresenta 3h, 6h e 12h quando disponíveis no catálogo. A confirmação final é feita pelo chat.'),
        ],
        'rows': [('Suíte Master', '127', '242'), ('Suíte Luxo', '189', '350'), ('Suíte Premium', '249', '450')],
    },
    'spa-urbano.html': {
        'key': 'spa',
        'accent': '#8b5bd6',
        'name': 'Spa Urbano',
        'eyebrow': 'Experiência premium',
        'intro_title': 'O endereço mais sofisticado para desacelerar.',
        'intro': 'O Spa Urbano combina localização central, ambientação elegante e suítes inspiradas em pedras preciosas para quem busca uma experiência mais exclusiva em Fortaleza.',
        'summary_title': 'Luxo com personalidade',
        'summary': 'Conheça as categorias, compare as comodidades e escolha o ambiente que melhor traduz o seu momento.',
        'address': 'Av. Des. Moreira, 3033 - Dionísio Torres, Fortaleza - CE',
        'phone': '(85) 3257-8877',
        'phone_href': 'tel:8532578877',
        'map_query': 'Av.+Des.+Moreira,+3033+-+Dionisio+Torres,+Fortaleza+-+CE',
        'features': [
            ('fa-gem', 'Pedras preciosas', 'Suítes com identidade visual inspirada em Jade, Rubi e Diamante.'),
            ('fa-bath', 'Relaxamento completo', 'Hidromassagem, ofurô e ambientes desenhados para desacelerar.'),
            ('fa-swimmer', 'Piscina privativa', 'A Suíte Diamante oferece uma experiência ainda mais exclusiva.'),
        ],
        'gallery': [
            ('suite-jade.jpg', 'Suíte Jade'),
            ('suite-rubi.jpg', 'Suíte Rubi'),
            ('suite-esmeralda.jpg', 'Suíte Esmeralda'),
            ('suite-diamante.jpg', 'Suíte Diamante'),
        ],
        'faq': [
            ('Qual é a suíte mais exclusiva?', 'A Suíte Diamante é a categoria de maior exclusividade, com piscina privativa e recursos premium.'),
            ('Onde fica o Spa Urbano?', 'A unidade fica na Av. Des. Moreira, em Dionísio Torres. Abra a rota pelo botão do mapa.'),
        ],
        'rows': [('Suíte Jade', '160', '300'), ('Suíte Safira', '180', '335'), ('Suíte Rubi', '204', '377'), ('Suíte Esmeralda', '441', '791'), ('Suíte Diamante', '552', '986')],
    },
}


def brl(value):
    return f'R$ {value}' if value else 'Consulte'


def experience_markup(data):
    features = ''.join(
        f'<article class="mf-feature-card"><span class="mf-feature-icon"><i class="fa {escape(icon)}" aria-hidden="true"></i></span><h4>{escape(title)}</h4><p>{escape(text)}</p></article>'
        for icon, title, text in data['features']
    )
    gallery = ''.join(
        f'<a class="mf-gallery-item" href="../img/suites/{escape(filename)}" data-gallery-image data-gallery-alt="{escape(title)} - {escape(data["name"])}"><img src="../img/suites/{escape(filename)}" alt="{escape(title)} - {escape(data["name"])}" loading="lazy" /><span class="mf-gallery-caption">{escape(title)}</span></a>'
        for filename, title in data['gallery']
    )
    rows = ''.join(
        f'<tr data-rate-suite="{escape(name)}"><td>{escape(name)}</td><td class="mf-rate-value" data-rate-value="3h">{brl(p3)}</td><td class="mf-rate-value" data-rate-value="6h">Consulte</td><td class="mf-rate-value" data-rate-value="12h">{brl(p12)}</td><td data-rate-value="hora">Consulte</td><td data-rate-value="pessoa">Consulte</td></tr>'
        for name, p3, p12 in data['rows']
    )
    faq = ''.join(
        f'<details class="mf-faq-item"><summary>{escape(question)}</summary><p>{escape(answer)}</p></details>'
        for question, answer in data['faq']
    )
    destination = f'https://www.google.com/maps/dir/?api=1&destination={data["map_query"]}'
    map_embed = f'https://www.google.com/maps?q={data["map_query"]}&output=embed'
    whatsapp = f'https://wa.me/558532578877?text=Ol%C3%A1%2C+gostaria+de+reservar+no+{data["key"].title()}+Motel'

    return f'''\n    <section class="mf-experience" id="experiencia" style="--mf-detail-accent:{data['accent']}; --mf-detail-accent-soft:{data['accent']}14;" aria-labelledby="mf-experience-title">\n        <div class="container">\n            <div class="mf-experience-head">\n                <div class="mf-experience-intro">\n                    <span class="mf-eyebrow">{escape(data['eyebrow'])}</span>\n                    <h3 id="mf-experience-title">{escape(data['intro_title'])}</h3>\n                    <p>{escape(data['intro'])}</p>\n                </div>\n                <div class="mf-experience-summary">\n                    <strong>{escape(data['summary_title'])}</strong>\n                    <span>{escape(data['summary'])}</span>\n                </div>\n            </div>\n\n            <div class="mf-feature-grid" aria-label="Destaques da unidade">\n                {features}\n            </div>\n\n            <div class="mf-detail-grid">\n                <section class="mf-detail-panel" aria-labelledby="mf-gallery-title">\n                    <span class="mf-eyebrow">Ambientes</span>\n                    <h3 id="mf-gallery-title">Veja alguns detalhes</h3>\n                    <p style="margin-bottom:18px;">Uma seleção de imagens para ajudar você a escolher o ambiente ideal.</p>\n                    <div class="mf-gallery-grid">{gallery}</div>\n                </section>\n\n                <section class="mf-detail-panel mf-map-wrap" aria-labelledby="mf-map-title">\n                    <span class="mf-eyebrow">Localização</span>\n                    <h3 id="mf-map-title">Como chegar</h3>\n                    <iframe class="mf-map-frame" title="Mapa de localização do {escape(data['name'])}" src="{map_embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>\n                    <div class="mf-map-meta">\n                        <p><i class="fa fa-map-marker" aria-hidden="true"></i> {escape(data['address'])}<br /><i class="fa fa-phone" aria-hidden="true"></i> <a href="{escape(data['phone_href'])}">{escape(data['phone'])}</a></p>\n                        <div class="mf-map-actions"><a class="btn btn-orange" href="{destination}" target="_blank" rel="noopener">Abrir rota</a><a class="btn btn-default" href="{escape(data['phone_href'])}">Ligar agora</a></div>\n                    </div>\n                </section>\n            </div>\n\n            <section class="mf-detail-panel mf-rate-panel" aria-labelledby="mf-rate-title">\n                <span class="mf-eyebrow">Tarifas</span>\n                <h3 id="mf-rate-title">Escolha o seu período</h3>\n                <p class="mf-rate-note">Os valores são consultados no catálogo central. <span data-rate-source>Confira a disponibilidade atual no chat de reservas.</span></p>\n                <div class="mf-rate-table-wrap">\n                    <table class="mf-rate-table">\n                        <thead><tr><th>Suíte</th><th>3 horas</th><th>6 horas</th><th>12h / pernoite</th><th>Hora adicional</th><th>Pessoa adicional</th></tr></thead>\n                        <tbody>{rows}</tbody>\n                    </table>\n                </div>\n            </section>\n\n            <section class="mf-detail-panel" aria-labelledby="mf-faq-title">\n                <span class="mf-eyebrow">Dúvidas rápidas</span>\n                <h3 id="mf-faq-title">Antes de reservar</h3>\n                <div class="mf-faq-grid">{faq}</div>\n            </section>\n        </div>\n    </section>\n\n    <a class="mf-sticky-reservation" href="{whatsapp}" target="_blank" rel="noopener"><i class="fa fa-whatsapp" aria-hidden="true"></i> Reserve esta experiência</a>\n'''


for filename, data in MOTELS.items():
    path = ROOT / 'motel' / filename
    html = path.read_text(encoding='utf-8')
    if 'motel-details.css' not in html:
        html = html.replace('    <link href="../css/plugin.css" rel="stylesheet" type="text/css" />', '    <link href="../css/plugin.css" rel="stylesheet" type="text/css" />\n    <link href="../css/motel-details.css" rel="stylesheet" type="text/css" />')
    html = html.replace('<body>', f'<body data-motel-key="{data["key"]}" style="--mf-detail-accent:{data["accent"]};">', 1)
    if 'id="experiencia"' not in html:
        html = html.replace('\n    <footer>', experience_markup(data) + '\n    <footer>', 1)
    # Add a data key to every legacy card price, enabling the shared Firestore updater.
    def add_price_marker(match):
        name = match.group(1).strip()
        opening = match.group(2)
        if 'data-suite-price' in opening:
            return match.group(0)
        return f'<h4>{escape(name)}</h4><p{opening} data-suite-price="{escape(name)}">'
    html = re.sub(r'<h4>([^<]+)</h4>\s*<p([^>]*)>', add_price_marker, html)
    # Load the public Firebase compat client and the detail-page behavior exactly once.
    marker = '    <script src="../js/motel-details.js"></script>'
    if 'motel-details.js' not in html:
        script_block = '\n    <script src="https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js"></script>\n    <script src="https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore-compat.js"></script>\n' + marker + '\n'
        html = html.replace('    <script src="../js/jquery-3.3.1.min.js"></script>', script_block + '    <script src="../js/jquery-3.3.1.min.js"></script>', 1)
    path.write_text(html, encoding='utf-8')
    print(f'updated {path}')
