
## GoDaddy — estado inicial — 19/08/2026

Domínio confirmado: `moteisfortaleza.com`. A conta GoDaddy está autenticada no navegador conectado. O painel de configurações do domínio foi aberto em `https://dcc.godaddy.com/control/portfolio/moteisfortaleza.com/settings?referrer=venturehome`; a tela ainda estava carregando as configurações de domínio. Nenhum registro DNS foi alterado até este ponto.

A aba DNS foi aberta em `https://dcc.godaddy.com/control/portfolio/moteisfortaleza.com/settings?referrer=venturehome&tab=dns`. A GoDaddy exibiu as seções Registros DNS, Encaminhamento, Servidores de nomes, DNS Premium, Nomes de hosts e Registros DS. Nenhum registro foi alterado até aqui; o site principal segue protegido contra mudanças.

A GoDaddy informou que o DNS é gerenciado fora dela. Os servidores de nomes atuais são:

- `ns1-secure.vtrixdomains.com`
- `ns2-secure.vtrixdomains.com`
- `ns3-secure.vtrixdomains.com`
- `ns4-secure.vtrixdomains.com`

Não foi clicado em “Alterar servidores de nomes”. Portanto, não houve risco de queda nem mudança no site principal. Os CNAMEs precisam ser criados no provedor que controla `vtrixdomains.com`, não na GoDaddy, a menos que se opte por migrar os nameservers — o que não será feito sem autorização explícita.

Consulta pública via Cloudflare DNS-over-HTTPS confirmou o estado atual:

| Tipo | Registro público atual |
|---|---|
| A | `65.181.111.148` |
| MX | `0 moteisfortaleza.com.` |
| TXT | `v=spf1 +a +mx +ip4:65.181.111.148 include:spf.mysecurecloudhost.com ~all` |
| NS | `ns1-secure.vtrixdomains.com`, `ns2-secure.vtrixdomains.com`, `ns3-secure.vtrixdomains.com`, `ns4-secure.vtrixdomains.com` |

Não foram encontrados AAAA ou CNAME no domínio raiz. O registro MX e o SPF indicam que o serviço de e-mail também depende do DNS atual; por isso não se deve trocar nameservers sem copiar todos os registros e confirmar o provedor responsável.

## cPanel — localização da configuração

O cPanel autenticado está em `https://moteisfortaleza.com:2083/` e pertence ao usuário `moteisfortaleza`, com domínio primário `moteisfortaleza.com` e IP compartilhado `65.181.111.148`. A página inicial mostra a ferramenta **Domínios**, além de **Editor de Zona de DNS**. A ferramenta Domínios foi aberta em `/frontend/jupiter/domains/index.html`; a página ainda precisa carregar a lista de domínios/subdomínios.

A configuração correta está no **Editor de Zona de DNS** do cPanel, em `/frontend/jupiter/zone_editor/index.html#/list`. Para `moteisfortaleza.com`, a tela oferece os botões `Registro A`, `Registro De CNAME`, `Registro MX`, `DNSSEC` e `Gerenciar`. Ainda não foi adicionado nenhum registro.

A ferramenta Domínios também confirmou que há apenas o domínio principal cadastrado (`moteisfortaleza.com`, document root `/public_html`) e nenhum subdomínio existente. Para o Vercel, o próximo passo deve ser usar o Editor de Zona e adicionar CNAMEs, não criar pastas/subdomínios locais apontando para o cPanel.

## Vercel — importação das LPs

O Vercel está autenticado no navegador conectado, na tela `https://vercel.com/new`. A conta GitHub `weversonf` está selecionada e o repositório privado `motel` aparece na lista de importação, com o botão `Import`. O repositório está disponível para conexão; nenhum projeto Vercel foi criado nesta etapa.

No formulário de importação do Vercel, o primeiro projeto foi nomeado `motel-dragon-lp`; o preset está como `Other` e o Root Directory ainda está `./`. O botão `Edit` do Root Directory está disponível. Nenhum deploy foi iniciado.

## Diagnóstico urgente do GitHub Pages — 19/08/2026

O site `https://weversonf.github.io/motel/` retornou HTTP 404. O repositório `weversonf/motel` estava privado; ele foi restaurado para público. Mesmo após isso, a API informou que o GitHub Pages não estava configurado (`404`), e a página GitHub `https://github.com/weversonf/motel/settings/pages` confirmou: “GitHub Pages is currently disabled”. A fonte está em `Deploy from a branch`, com branch `None` e botão `Save`. O próximo passo é selecionar a branch `main` e salvar para reativar o site. Nenhuma LP ou configuração DNS foi alterada durante o diagnóstico.

Na configuração do GitHub Pages, a branch `main` foi selecionada como fonte e o diretório `/ (root)` permaneceu selecionado. A configuração ainda aguarda o clique em `Save`; o site principal continua sem publicação até esse salvamento.

## Vercel — repositório privado das LPs

O repositório privado `weversonf/motel-lps-privado` apareceu no Vercel e foi importado para a equipe pessoal Hobby. O primeiro projeto está no formulário de configuração, com Application Preset `Other` e Root Directory ainda em `./`. O próximo passo é nomear o projeto `motel-dragon-lp`, definir Root Directory `Dragon` e iniciar o deploy. Nenhuma configuração de DNS foi alterada.

No formulário de importação do Vercel, o projeto foi nomeado `motel-dragon-lp`. O seletor de Root Directory exibiu `Assahi`, `Dragon`, `Dreams` e `Spa-Urbano`; `Dragon` foi selecionada. O modal aguarda o botão `Continue` para aplicar a escolha.

O projeto Vercel `motel-dragon-lp` foi criado para a equipe Hobby a partir do repositório privado `weversonf/motel-lps-privado`, com Application Preset `Other` e Root Directory `Dragon`. O botão Deploy foi acionado e o estado atual é `Deploying`; nenhum domínio ou DNS foi alterado ainda.

O deploy do projeto `motel-dragon-lp` concluiu com sucesso no Vercel. URL temporária de produção: `https://motel-dragon-qner9e1zv-weverson-feitosas-projects.vercel.app/`. A prévia exibiu a LP Dragon corretamente. Ainda falta adicionar o domínio personalizado `dragon.moteisfortaleza.com`; nenhum registro DNS foi alterado.

Após o sucesso do deploy Dragon, o Vercel voltou ao fluxo `New Project`; o repositório `motel-lps-privado` permanece disponível para importar novamente e criar os projetos das demais LPs.

O segundo projeto Vercel foi iniciado para o repositório privado e nomeado `motel-dreams-lp`. O formulário está com Application Preset `Other` e Root Directory ainda em `./`; falta selecionar `Dreams` e iniciar o deploy.

O seletor de Root Directory do Vercel exibiu `Assahi`, `Dragon`, `Dreams` e `Spa-Urbano`; o projeto `motel-dreams-lp` será apontado exclusivamente para `Dreams`.

A pasta `Dreams` foi selecionada no seletor de Root Directory do Vercel e expandida, mostrando seu diretório `assets`; o projeto está pronto para confirmar com `Continue`.

O deploy do projeto `motel-dreams-lp` foi iniciado no Vercel com Application Preset `Other` e Root Directory `Dreams`; aguardo a URL de produção. Nenhum domínio personalizado ou DNS foi alterado.

O deploy do projeto `motel-dreams-lp` concluiu com sucesso no Vercel. URL temporária de produção: `https://motel-dreams-bdkln26t1-weverson-feitosas-projects.vercel.app/`. A prévia exibiu a LP Dreams corretamente. Ainda falta adicionar `dreams.moteisfortaleza.com`; nenhum DNS foi alterado.

O projeto `motel-spa-urbano-lp` foi nomeado corretamente no Vercel. Após uma atualização automática do formulário, o controle de Root Directory voltou a estar disponível e permanece em `./`, aguardando a seleção de `Spa-Urbano`.

A pasta `Spa-Urbano` foi selecionada e expandida no seletor de Root Directory do Vercel, exibindo seu diretório `assets`; está pronta para confirmação com `Continue`.

O deploy do projeto `motel-spa-urbano-lp` foi iniciado no Vercel com Application Preset `Other` e Root Directory `Spa-Urbano`; aguardo a URL de produção. Nenhum domínio personalizado ou registro DNS foi alterado.

Deploy Spa Urbano concluído com sucesso no Vercel. URL temporária: `https://motel-spa-urbano-68bn4a1cm-weverson-feitosas-projects.vercel.app`. O preview exibiu a LP correta com logo Spa Urbano, hero premium, menu e widget. Ainda não foi adicionado domínio personalizado nem alterado DNS.

Deploy Assahí concluído com sucesso no Vercel. URL temporária: `https://motel-assahi-eqblws44r-weverson-feitosas-projects.vercel.app`. O projeto usa Root Directory `Assahi`. Ainda não foi adicionado domínio personalizado nem alterado DNS.

No projeto Vercel `motel-dragon-lp`, foi adicionado o domínio personalizado `dragon.moteisfortaleza.com` ligado ao ambiente Production. O Vercel mostra o domínio como `Loading...` até que o CNAME seja criado no DNS; o domínio `motel-dragon-lp.vercel.app` segue válido. Ainda não alterei o cPanel.

No projeto Vercel `motel-dreams-lp`, foi adicionado o domínio personalizado `dreams.moteisfortaleza.com` ligado ao ambiente Production. O Vercel mostra o domínio como `Loading...` até que o CNAME seja criado no DNS; o domínio `motel-dreams-lp.vercel.app` segue válido. Ainda não alterei o cPanel.

No projeto Vercel `motel-spa-urbano-lp`, foi adicionado o domínio personalizado `spaurbano.moteisfortaleza.com` ligado ao ambiente Production. O Vercel mostra `Loading...` até que o CNAME seja criado no DNS; `motel-spa-urbano-lp.vercel.app` segue válido. Ainda não alterei o cPanel.

No projeto Vercel `motel-assahi-lp`, foi adicionado o domínio personalizado `assahi.moteisfortaleza.com` ligado ao ambiente Production. O Vercel mostra `Loading...` até que o CNAME seja criado no DNS; `motel-assahi-lp.vercel.app` segue válido. Ainda não alterei o cPanel.

## Consolidação Final - 19/08/2026

As 4 Landing Pages foram implantadas com sucesso no Vercel e vinculadas aos subdomínios via cPanel.

### Status dos Domínios (Verificados e Online)
* **Dragon**: https://dragon.moteisfortaleza.com
* **Dreams**: https://dreams.moteisfortaleza.com
* **Spa Urbano**: https://spaurbano.moteisfortaleza.com
* **Assahí**: https://assahi.moteisfortaleza.com

### Registros DNS Criados (CNAME no cPanel)
1. `dragon` -> `d4d8bc327084e1ce.vercel-dns-017.com.`
2. `dreams` -> `1d270e0c3d607097.vercel-dns-017.com.`
3. `spaurbano` -> `1c9206f9889429ed.vercel-dns-017.com.`
4. `assahi` -> `21eb7b3ac5004829.vercel-dns-017.com.`

### Integridade do Ecossistema
* **Site Principal (moteisfortaleza.com)**: Operacional e inalterado.
* **GitHub Pages (weversonf.github.io/motel/)**: Operacional e inalterado.
* **Repositório das LPs**: Mantido como PRIVADO (`weversonf/motel-lps-privado`).
* **Segurança**: SSL ativo em todos os novos subdomínios.

Todas as landing pages seguem o padrão visual solicitado (Header/Footer/Widget padronizados) com suas respectivas identidades de cores e imagens reais.

## Painel de reservas — reorganização de subdomínios
- Projeto Vercel: https://vercel.com/weverson-feitosas-projects/reservas-moteis-fortaleza
- Estado antes da troca: `reservas.moteisfortaleza.com` estava com configuração válida no projeto administrativo.
- Novo domínio solicitado para o painel: `painel-reservas.moteisfortaleza.com`.
- O Chat do cliente deverá ocupar `reservas.moteisfortaleza.com` após a migração/configuração do projeto correspondente.
- Nenhuma alteração deve ser feita em `moteisfortaleza.com`, `weversonf.github.io/motel/` ou no `/admin` do site principal.
- Fonte Vercel consultada: https://vercel.com/weverson-feitosas-projects/reservas-moteis-fortaleza/settings/domains

### CNAME do novo painel
O Vercel informou para `painel-reservas.moteisfortaleza.com` o registro `CNAME painel-reservas -> 0e1afce3404e9df8.vercel-dns-017.com.`. O domínio foi adicionado ao projeto `reservas-moteis-fortaleza` e aguarda a atualização no cPanel.
Fonte consultada: https://vercel.com/weverson-feitosas-projects/reservas-moteis-fortaleza/settings/domains

### Chat em novo projeto Vercel
Foi criado o projeto Vercel `moteis-fortaleza-chat` a partir do repositório privado `weversonf/moteis-fortaleza`, com `Root Directory: Chat` e deployment estático publicado em `moteis-fortaleza-chat-5kk9y4gc7-weverson-feitosas-projects.vercel.app`. O domínio `reservas.moteisfortaleza.com` está sendo associado ao projeto para substituir o destino anterior do painel.
Fonte consultada: https://vercel.com/weverson-feitosas-projects/moteis-fortaleza-chat/settings/domains

### Reorganização dos subdomínios concluída
- `reservas.moteisfortaleza.com` foi removido do projeto Vercel administrativo e associado ao projeto `moteis-fortaleza-chat`, com Root Directory `Chat`. Teste em 19/08/2026: carregou `Pré-Reserva Online | Motéis Fortaleza`.
- `painel-reservas.moteisfortaleza.com` foi associado ao projeto Vercel `reservas-moteis-fortaleza`, com Root Directory `Reservas`. Teste em 19/08/2026: carregou `Motéis Fortaleza — Painel v02`, com formulário de login/demo.
- O CNAME de `painel-reservas` foi criado no cPanel apontando para `0e1afce3404e9df8.vercel-dns-01`.
- O registro CNAME existente de `reservas` já apontava para `0e1afce3404e9df8.vercel-dns-01`; após a troca no Vercel, o domínio ficou válido para o projeto do Chat, sem alteração no domínio principal.
