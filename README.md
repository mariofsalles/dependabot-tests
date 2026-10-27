# dependabot-tests

Laboratório de Dependabot com JavaScript, Node.js 24 LTS, uma calculadora e testes
nativos do Node.js. Não há servidor, credenciais nem necessidade de publicar a aplicação.

## 1. Instalar e testar

Pré-requisitos: Node.js 24.x, npm e Git. Na raiz do projeto:

```sh
npm ci --ignore-scripts
npm test
npm run format:check
node -e 'console.log(require("./src").somar(2, 3, 5))'
```

O último comando imprime `10`. Os quatro testes cobrem somas positivas, negativas
e decimais, ausência de argumentos e rejeição de valores inválidos.
`npm run format` aplica a formatação quando necessário.

- `src/index.js`: exporta `somar(...numeros)` e usa `decimal.js` para somar.
- `tests/index.test.js`: usa `node:test`, sem framework adicional.
- `package.json`: fixa deliberadamente `decimal.js` em `10.5.0` (produção) e
  Prettier em `3.6.2` (desenvolvimento), versões antigas para praticar atualizações.
- `package-lock.json`: gerado pelo npm, registra versões, URLs e integridades;
  deve acompanhar o manifesto no controle de versão.
- `.github/workflows/ci.yml`: executa instalação reproduzível, testes e formatação
  em pushes e PRs destinados a `main`, incluindo os PRs do Dependabot.

São apenas duas dependências diretas. Os scripts de instalação dos pacotes ficam
desabilitados com `--ignore-scripts`, tanto localmente quanto na CI.
As versões antigas são material de laboratório, não uma recomendação para produção.
Consulte `npm audit`: ausência de alertas hoje não garante ausência de vulnerabilidades futuras.
Não execute automaticamente `npm audit fix --force`; revise as mudanças primeiro.

Após alterar uma versão em `package.json`, execute `npm install --ignore-scripts`
para atualizar o lockfile. `npm ci` instala o lockfile existente e falha se ele
estiver incompatível com o manifesto; não serve para atualizar versões.

## 2. Preparar o GitHub e ativar a segurança

1. Revise os arquivos e, manualmente, faça commit e push para `main` no GitHub.
   O Dependabot lê a configuração na branch padrão. Se sua branch principal tiver
   outro nome, ajuste os filtros da CI e publique a configuração nessa branch.
2. Em **Issues > Labels**, crie as labels `dependencies` e `github-actions` se
   ainda não existirem. Labels personalizadas precisam existir para serem aplicadas.
3. Em **Settings > Advanced Security** ou **Settings > Code security**
   (em algumas interfaces, **Code security and analysis**), habilite o
   **Dependency graph**, **Dependabot alerts** e **Dependabot security updates**.
   O nome das telas e a disponibilidade variam conforme plano e organização;
   alterações podem exigir permissão de administrador.
4. As **version updates** são configuradas por `.github/dependabot.yml` na
   branch padrão, não apenas pelos controles de alertas de segurança.
5. Confira em **Settings > Actions > General** se workflows e as actions usadas
   estão permitidos. Não é necessário fornecer um token pessoal para este projeto.

Nenhuma configuração remota é alterada automaticamente por este laboratório.

## 3. Entender a configuração

O arquivo `.github/dependabot.yml` usa o schema **version 2**:

- `package-ecosystem`: `npm` atualiza pacotes e o lockfile; `github-actions`
  atualiza referências `uses:` dos workflows.
- `directory: "/"`: procura os arquivos na raiz do repositório.
- `schedule.interval: "weekly"`: verifica novas versões semanalmente.
  Conforme a configuração solicitada, não há `day`, `time` nem `timezone`
  explícitos. Portanto, não há compromisso com segunda-feira às 09:00 de São Paulo.
- `open-pull-requests-limit: 3`: permite até **três PRs de version updates npm
  abertos por vez**, somando todos os grupos. Não limita os PRs de segurança,
  que têm limite próprio, nem o bloco de GitHub Actions, que mantém o limite padrão.
- `commit-message`: usa `[DEPS]` como prefixo dos commits de atualização npm.
- `labels`: usa `dependencies` para npm e `github-actions` para workflows.
- `groups`: reúne todas as dependências npm em três grupos de version updates:
  `MAJOR`, `MINOR` e `PATCH`. Cada grupo inclui apenas o tipo de atualização
  correspondente; dependências de produção e desenvolvimento podem ficar juntas.

Cada grupo pode gerar um PR quando houver atualizações daquele tipo. Com apenas
duas dependências diretas no laboratório, o agrupamento fica mais visível quando
você adiciona outras bibliotecas.

## 4. Encontrar dependências, alertas e solicitar verificações

- Abra **Insights > Dependency graph > Dependencies** para ver o gráfico de
  dependências reconhecidas a partir do manifesto e do lockfile.
- Abra **Security > Dependabot alerts** para consultar alertas de segurança.
  Um resultado vazio é possível: alertas dependem das versões instaladas, dos
  avisos conhecidos e das funcionalidades de segurança habilitadas no repositório.
- Para antecipar a busca de versões, abra
  **Insights > Dependency graph > Dependabot**, selecione o ecossistema ou use
  **Last checked / Recent update jobs**, e clique em **Check for updates**.
  Dependendo da interface, o botão aparece dentro da página do último job.
- Nessa mesma área, abra **Recent update jobs**, **View logs** ou o horário da
  última execução para visualizar os logs do Dependabot. Ali você encontra
  problemas de YAML, resolução de versões, acesso a registros e limites de PRs.
  Os logs da **CI** são diferentes: ficam na aba **Actions** ou nos checks do PR.

As atualizações agendadas e as verificações manuais podem entrar em fila e não
aparecer imediatamente. Uma verificação também pode terminar sem criar PRs.
O limite de 3 PRs pode impedir novas propostas enquanto houver três PRs npm abertos.

## 5. Testar com PRs de atualização

1. Publique manualmente os arquivos na branch padrão e solicite uma verificação.
2. Aguarde um PR de `dependabot[bot]`, normalmente com o nome de um grupo.
   As versões fixadas permitem observar mudanças no manifesto e no lockfile.
   Use `npm outdated` localmente para consultar versões disponíveis; esse comando
   pode retornar código 1 simplesmente por encontrar pacotes desatualizados.
3. Verifique autor, label, prefixo de commit e arquivos alterados. A disponibilidade
   de versões e o agrupamento determinam quais propostas serão abertas.
4. Confira os checks da CI no PR. Uma atualização só de GitHub Actions também
   precisa passar pela CI; ela não deve alterar a aplicação sem justificativa.
5. Após concluir um PR, peça outra verificação para observar o outro grupo.

Não existe obrigação de aparecer um alerta de segurança ou um PR de Actions:
isso depende das versões e avisos disponíveis no momento da consulta.

## 6. Revisar, testar, aprovar e fazer merge

1. Leia o diff, as notas de versão, o changelog e os avisos de incompatibilidade.
   Confira se as mudanças do lockfile correspondem às versões propostas.
2. Em uma cópia local limpa, faça checkout da branch do PR pela interface do
   GitHub/VS Code ou com `gh pr checkout NUMERO`, se a CLI estiver autenticada.
3. Execute `npm ci --ignore-scripts`, `npm test`, `npm run format:check` e
   `npm audit`. Investigue falhas; não aceite mudanças em expectativas de testes
   apenas para fazer o resultado ficar verde.
4. Confira os checks no GitHub e registre sua revisão em **Files changed > Review
   changes**. Uma aprovação válida pode exigir outra pessoa com a permissão
   apropriada, conforme as regras de proteção da branch.
5. Faça merge manualmente apenas após revisar e confirmar os testes. Em um
   repositório real, considere tornar a CI obrigatória nas regras de branch.
6. Atualize sua branch principal local e execute novamente a instalação e os testes.

**Não faça merge sem revisar as alterações e verificar os testes.** Este projeto
não inclui auto-merge nem workflows com `pull_request_target`.

## 7. Simular conflitos e atualizações problemáticas

Faça estes exercícios apenas no repositório de laboratório, sem trabalho local
pendente e com uma forma clara de reverter suas próprias alterações:

- **Conflito:** com um PR npm aberto, prepare outro PR que altere a mesma versão
  no `package.json` para uma versão diferente da proposta pelo bot. Gere o lockfile
  com `npm install --ignore-scripts` e faça merge dessa alteração em `main`.
  Observe se o PR do bot fica desatualizado, conflita ou é ajustado automaticamente.
  Alterar as mesmas linhas pode provocar conflito, mas não o garante: o Dependabot
  tenta fazer rebase automaticamente.
- **Solicitar rebase:** comente `@dependabot rebase` no PR. Se você tiver editado
  diretamente a branch do bot, a atualização automática pode ser interrompida.
  `@dependabot recreate` recria o PR e pode sobrescrever suas edições nessa branch;
  preserve-as antes de usar o comando.
- **CI vermelha sem pacote perigoso:** em uma branch descartável, mude somente
  a expectativa do teste positivo de `10` para `11`. Execute `npm test` e abra
  manualmente um PR para observar a falha da CI. Reverta essa edição e confirme
  que os testes voltam a passar. Isso simula a detecção de uma regressão, não uma
  incompatibilidade real da biblioteca; não faça merge do teste adulterado.

Não introduza pacotes maliciosos, scripts de instalação, credenciais ou versões
com vulnerabilidades conhecidas para provocar uma falha.

## 8. Fechar e ignorar atualizações

No PR do Dependabot, os comandos abaixo são comentários, não comandos de terminal:

```text
@dependabot close
@dependabot ignore this patch version
@dependabot ignore this minor version
@dependabot ignore this major version
```

`close` fecha o PR e evita recriar a mesma atualização; versões futuras ainda
podem gerar propostas. Os comandos `ignore` registram a exclusão indicada e fecham
o PR. Eles não corrigem a dependência nem equivalem a resolver um alerta de
segurança. Prefira experimentar em um PR individual: em PRs agrupados, confira
as instruções do corpo do PR e a resposta do bot antes de ignorar várias atualizações.

Também é possível usar **Close pull request** na interface. Comentários de
comando exigem permissão apropriada no repositório. Para investigar ou desfazer
exclusões, consulte `@dependabot show <nome-da-dependencia> ignore conditions` e
`@dependabot unignore <nome-da-dependencia>`, conforme a ajuda do bot no PR.
Evite ignorar correções de segurança sem analisar e registrar o risco.

## 9. Três recursos diferentes

| Recurso                     | Finalidade                                                                                             | Como é ativado                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Dependabot alerts           | Avisar sobre vulnerabilidades conhecidas nas dependências reconhecidas. Não atualiza o código sozinho. | Gráfico de dependências e alertas de segurança habilitados.                              |
| Dependabot security updates | Tentar abrir PRs que corrijam vulnerabilidades detectadas; nem todo alerta tem correção automática.    | Opção de atualizações de segurança habilitada; não depende da agenda semanal de versões. |
| Dependabot version updates  | Abrir PRs para novas versões, mesmo sem vulnerabilidade conhecida.                                     | Arquivo `dependabot.yml` na branch padrão, com ecossistemas e agenda.                    |

## 10. Exercícios práticos

1. Altere `schedule.interval` do bloco npm de `weekly` para `daily`. Publique
   manualmente e compare os registros das verificações.
2. Aumente `open-pull-requests-limit` de `3` para `5`. Solicite outra verificação
   e observe se mais propostas conseguem ficar abertas simultaneamente.
3. Modifique os grupos para juntar ou separar tipos de atualização. Compare os
   diffs e avalie o risco de agrupar mudanças maiores.
