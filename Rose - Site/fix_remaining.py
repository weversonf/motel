import os

base = r'G:\Meu Drive\HTML\Meus Projetos\Rose\Rose - Site'

# Additional remaining patterns
remaining_fixes = {
    'MOTÃ‰IS': 'MOTÉIS',
    'REGIÃ•ES': 'REGIÕES',
    'MOTÃ©is': 'MOTÉIS',
    'REGIÃµes': 'REGIÕES',
    'Ã‰': 'É',
    'Ã ': 'à',
    'Ã\x83Â\x89': 'É',
    'Ã\x83Â ': 'à',
}

html_files = []
for root, dirs, files in os.walk(base):
    if 'img_backup' in root:
        continue
    for f in files:
        if f.endswith('.html'):
            html_files.append(os.path.join(root, f))

total_changes = 0
for fp in html_files:
    try:
        with open(fp, 'r', encoding='utf-8') as fh:
            content = fh.read()
    except:
        continue

    original = content

    for bad, good in remaining_fixes.items():
        content = content.replace(bad, good)

    if content != original:
        with open(fp, 'w', encoding='utf-8') as fh:
            fh.write(content)
        total_changes += 1
        rel = os.path.relpath(fp, base)
        print('Fixed: ' + rel)

print('\nTotal files fixed: ' + str(total_changes))
