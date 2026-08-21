from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path('/home/ubuntu/motel/site-moteis-fortaleza-novo')
required_files = [
    ROOT / 'css' / 'motel-details.css',
    ROOT / 'js' / 'motel-details.js',
]
pages = sorted((ROOT / 'motel').glob('*.html'))
errors = []

for required in required_files:
    if not required.exists():
        errors.append(f'arquivo ausente: {required}')

for page in pages:
    html = page.read_text(encoding='utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    checks = {
        'body com motel-key': soup.body and soup.body.get('data-motel-key'),
        'css compartilhado': soup.find('link', href='../css/motel-details.css'),
        'section experiencia': soup.find('section', id='experiencia'),
        'mapa lazy': soup.find('iframe', class_='mf-map-frame', loading='lazy'),
        'tabela de tarifas': soup.find('table', class_='mf-rate-table'),
        'galeria': soup.find('a', attrs={'data-gallery-image': True}),
        'script de detalhes': soup.find('script', src='../js/motel-details.js'),
        'firebase compat': soup.find('script', src=lambda value: value and 'firebase-app-compat.js' in value),
    }
    for label, result in checks.items():
        if not result:
            errors.append(f'{page.name}: {label}')
    if len(soup.find_all('footer')) != 1:
        errors.append(f'{page.name}: quantidade de footer inesperada')
    if len(soup.find_all('html')) != 1:
        errors.append(f'{page.name}: quantidade de html inesperada')
    print(f'{page.name}: ok')

if errors:
    print('\n'.join(errors))
    raise SystemExit(1)

print(f'Validação concluída: {len(pages)} páginas e {len(required_files)} assets compartilhados.')
