# Validação local das LPs

## Dreams — 2026-08-19

- A LP abriu em `http://127.0.0.1:8000/LP/Dreams/`.
- A seção de suítes exibiu os quatro cards lado a lado no desktop.
- Os controles de navegação anterior/próxima apareceram abaixo dos cards.
- O texto de apoio “Rotação automática” apareceu junto aos controles.
- A ordem dos cards mudou entre visualizações, confirmando que a rotação automática está funcionando.
- O widget de reserva permaneceu visível no canto inferior direito e o chat embutido carregou no desktop.
- Não foi observado overflow horizontal na seção validada.

## Dragon — 2026-08-19

A LP abriu em `http://127.0.0.1:8000/LP/Dragon/`. A seção exibiu quatro suítes em uma única linha, com identidade visual vermelha e dourada preservada. Após a rotação automática, a ordem passou a mostrar Inspiração, Sonho, Sucesso e Felicidade, confirmando o reordenamento do carrossel. Os controles dourados anterior/próxima apareceram abaixo dos cards, e o widget de reserva permaneceu disponível no canto inferior direito.

### Correção final

A verificação do DOM confirmou `display: flex`, `flex-basis: calc(25% - 24px)` e controles visíveis no desktop da LP Dragon. O clique no botão de próxima suíte reordenou os cards para Felicidade, Inspiração, Sonho e Sucesso. O ajuste de classe que faltava no track foi aplicado e validado.

## Ajuste solicitado — Dragon

A LP Dragon foi restaurada para a grade estática: quatro cards permanecem lado a lado no desktop, sem controles ou referências de carrossel, enquanto o widget de reserva continua presente.

## Novas LPs — verificação estrutural

As páginas `LP/Spa Urbano/index.html` e `LP/Assahi/index.html` foram criadas em arquivos HTML únicos, com quatro cards de suítes, imagens oficiais locais, logos locais, tipografia Montserrat/Inter, links de reserva para `https://weversonf.github.io/motel/` e widget desktop/mobile padronizado. A navegação local da LP Spa Urbano encontrou todos os links, cards e botão do widget; a captura visual do navegador falhou ao carregar, então a confirmação final das novas LPs será feita por validação estrutural e inspeção do HTML local.

## Assahí e Spa Urbano — validação local

A LP Assahí abriu corretamente no servidor local com hero fotográfico real, identidade ameixa/magenta e dourado, navegação, quatro suítes, CTA e widget de reserva. A navegação textual confirmou os quatro cards Tahiti, Malibu, Bora-Bora e Maui, além dos links de reserva.

A LP Spa Urbano abriu com título, navegação, quatro cards, imagens locais, CTA e widget detectados pelo navegador. A captura visual específica da seção falhou no navegador, mas os ativos e caminhos foram verificados pelo servidor e a estrutura HTML foi validada sem erros de whitespace no diff.

## Refinamento premium Spa Urbano e A/B Dreams — 19/08/2026

A captura Chromium headless do Spa Urbano confirmou hero com imagem real, overlay escuro, navegação enxuta, título editorial e CTA esmeralda/champagne coerentes com posicionamento ultra-luxuoso. A captura do Dreams confirmou o dark neon em preto e verde menta, linguagem mais direta e moderna para público A/B, CTA de alto contraste e trust bar legível. O carrossel desktop permanece estruturado na LP Dreams e não foi introduzido no Spa Urbano.

A inspeção integrada do navegador estava indisponível nesta sessão; a validação visual foi feita por captura Chromium headless e a validação estrutural será concluída por checagens estáticas antes do push.

## Dreams — shell compartilhado — 19/08/2026

A captura desktop confirmou o Header fixo com logo, menu e CTA Reservar alinhados ao padrão do grupo. A LP mantém o conteúdo dark neon e o carrossel exclusivo, mas agora usa a mesma moldura estrutural: navegação superior fixa, menu mobile dedicado, Footer institucional em três colunas e Widget com balão branco, botão WhatsApp verde e iframe de reserva no desktop/redirecionamento no mobile.
