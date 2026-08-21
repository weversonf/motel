import os
import re

ROOT_DIR = '/home/ubuntu/motel'
OLD_URL = 'https://weversonf.github.io/motel/'
NEW_URL = 'https://reservas.moteisfortaleza.com/'

# Regex para encontrar a URL antiga mas ignorar se for seguida por LP/ ou motel/ ou img/ etc.
# Queremos substituir apenas o link do chat "puro"
pattern = re.compile(r'https://weversonf\.github\.io/motel/(?!(LP/|motel/|img/|css/|js/|images/|v02/|dashboard/|site-moteis-fortaleza-novo/))')

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # 1. Substituir a URL base
    new_content = pattern.sub(NEW_URL, content)
    
    # 2. Substituir links diretos de WhatsApp
    new_content = re.sub(r'https://wa\.me/[^"\'\s>]+', NEW_URL, new_content)
    new_content = re.sub(r'https://api\.whatsapp\.com/[^"\'\s>]+', NEW_URL, new_content)
    
    # 3. Remover ícones de WhatsApp de botões que agora vão para o chat
    new_content = new_content.replace('<i class="fa fa-whatsapp"></i> Reservar', 'Reservar')
    new_content = new_content.replace('<i class="fab fa-whatsapp"></i> Reservar', 'Reservar')
    new_content = new_content.replace('<i class="fa fa-whatsapp"></i>', '')
    new_content = new_content.replace('<i class="fab fa-whatsapp"></i>', '')
    
    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

for root, dirs, files in os.walk(ROOT_DIR):
    if '.git' in dirs:
        dirs.remove('.git')
    for file in files:
        if file.endswith(('.html', '.js', '.css', '.jsx', '.tsx')):
            file_path = os.path.join(root, file)
            if process_file(file_path):
                print(f'Updated: {file_path}')
