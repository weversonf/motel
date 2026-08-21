# Análise das páginas de detalhes do site geral v02

## Fontes públicas consultadas

A página pública do site geral foi consultada em: https://weversonf.github.io/motel/site-moteis-fortaleza-novo/

A página detalhada do Assahi foi consultada em: https://weversonf.github.io/motel/site-moteis-fortaleza-novo/motel/assahi-motel.html

## Estado atual observado

A página detalhada do Assahi já apresenta nome do motel, endereço, telefone, uma lista de suítes com foto, preço de 3 horas, dois atributos resumidos, descrição curta e botão de reserva. O rodapé possui links do grupo, contatos, redes sociais e links legais.

O conteúdo atualmente não apresenta uma seção de localização com mapa, horários e orientações de acesso, galeria contextual do motel, lista completa de comodidades, tabela de tarifas por duração, FAQ, avaliações resumidas, políticas operacionais ou CTA fixo de reserva.

A página inicial do site geral já possui cards dos quatro motéis, busca por duração, quantidade de pessoas e bairro, seção institucional, destaques de suítes, CTA de reserva, localizações resumidas, depoimentos e rodapé. A página detalhada é o melhor ponto para aprofundar informações e converter a visita em reserva.

## Estrutura local encontrada

O repositório original `weversonf/motel` contém a pasta `site-moteis-fortaleza-novo`, com subpastas `motel`, `css`, `js`, `fonts` e `images`. A pasta de imagens inclui logos individuais dos quatro motéis, imagens de suítes, imagens de galeria, ícones e recursos de fundo. A implementação atual é HTML/CSS/JavaScript estático, portanto as melhorias devem preservar o deploy no GitHub Pages e evitar dependências de servidor.

## Validação do upgrade — 21/08/2026

A página `motel/assahi-motel.html` foi aberta no preview local. O cabeçalho e os cards legados continuam renderizando; a nova seção `experiencia` aparece após as suítes com apresentação premium, cards de destaques, galeria real, mapa incorporado, ações de rota/telefone, tabela de tarifas, FAQ e CTA flutuante de reserva. O botão do chat também está presente e, no viewport desktop, fica disponível para abrir o chat incorporado. A estrutura passou na validação automatizada das quatro páginas.

A segunda revisão no preview confirmou a tipografia sem serifa, o telefone do topo do Assahi corrigido para `(85) 3256-2525`, a tabela e os CTAs preservados. O preview permaneceu com os valores de fallback publicados na tabela; o JavaScript está preparado para substituir os valores ao receber o snapshot público de `config/motels`, mantendo uma experiência funcional mesmo quando a leitura remota não responde imediatamente.

A página `motel/dreams-motel.html` também foi validada no preview local. O template compartilha a estrutura premium, mas mantém o contexto do Dreams: BR-116/Cajazeiras, cor verde na seção nova, galeria, mapa, CTA e tabela sincronizada. O snapshot público atualizou a tabela para `R$ 127,00` e `R$ 242,00` na Suíte Master, confirmando o funcionamento do fallback REST do Firestore no site estático.

Fonte de dados de tarifas verificada: documento público Firestore `https://firestore.googleapis.com/v1/projects/moteisfortaleza-9dadd/databases/(default)/documents/config/motels`.

## Publicação final

O build do GitHub Pages concluiu com status `built` para o commit `0745612`. A URL pública do Assahi foi recarregada com cache-buster e confirmou a nova seção de experiência, o mapa, a galeria, a tabela com a suíte Malibu, o telefone do topo atualizado e o texto `Atualizado pelo catálogo central de tarifas.`. Os valores foram renderizados no formato monetário brasileiro a partir do documento público Firestore.
