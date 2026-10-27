# Evidência: recusa de push direto na branch `main`

Data: 27/10/2026

Com a proteção de branch ativa em `main` (Pull Request obrigatório, 1 aprovação, status
checks obrigatórios, `enforce_admins` ligado), uma tentativa de `git push` direto para
`main` foi recusada pelo próprio GitHub, mesmo vindo da conta com permissão de administrador
do repositório:

```
$ git push origin main
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote:
remote: - Changes must be made through a pull request.
remote:
remote: - 2 of 2 required status checks are expected.
To https://github.com/jjoaocc/rewards_program_pwa.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'https://github.com/jjoaocc/rewards_program_pwa.git'
```

A mudança que gerou essa tentativa (conexão do job `deploy` ao GitHub Environment
`production`) só foi integrada depois, pelo fluxo correto: branch de feature
(`feature/1-ci-environment-production`) → Pull Request
[#2](https://github.com/jjoaocc/rewards_program_pwa/pull/2) → aprovação do par de revisão
(@Tintomax) → merge.

Configuração de proteção de branch vigente (consultável via
`GET /repos/jjoaocc/rewards_program_pwa/branches/main/protection`):

- Pull Request obrigatório, com no mínimo 1 aprovação.
- Status checks obrigatórios: `Backend, lint, tipos, seguranca e testes` e
  `Frontend, lint, tipos, testes e build`.
- `enforce_admins: true`, ou seja, nem administradores do repositório podem contornar a regra.
- `allow_force_pushes: false`, `allow_deletions: false`.
