from pathlib import Path

path = Path('/home/ubuntu/motel/site-moteis-fortaleza-novo/motel/assahi-motel.html')
html = path.read_text(encoding='utf-8')
needle = '<tr data-rate-suite="Suíte Bora Bora"><td>Suíte Bora Bora</td><td class="mf-rate-value" data-rate-value="3h">R$ 208</td><td class="mf-rate-value" data-rate-value="6h">Consulte</td><td class="mf-rate-value" data-rate-value="12h">R$ 384</td><td data-rate-value="hora">Consulte</td><td data-rate-value="pessoa">Consulte</td></tr>'
row = '<tr data-rate-suite="Suíte Malibu"><td>Suíte Malibu</td><td class="mf-rate-value" data-rate-value="3h">R$ 663</td><td class="mf-rate-value" data-rate-value="6h">Consulte</td><td class="mf-rate-value" data-rate-value="12h">R$ 1180</td><td data-rate-value="hora">Consulte</td><td data-rate-value="pessoa">Consulte</td></tr>'
if 'data-rate-suite="Suíte Malibu"' not in html:
    if needle not in html:
        raise SystemExit('linha de inserção não encontrada')
    html = html.replace(needle, needle + row, 1)
    path.write_text(html, encoding='utf-8')
    print('added Suíte Malibu')
else:
    print('Suíte Malibu já presente')
