# Ferramentas do cérebro

Utilitários transferíveis — funcionam em qualquer máquina com `node` e (para o cofre) `gcloud`.

## `secret.mjs` — o cofre

Um lugar só para credencial, em vez de espalhada em `.env` e em memória. Usa **Google Secret
Manager**: o único cofre que serve Mac, Windows e as VMs da nuvem sem assinatura nova, porque as
três já autenticam no mesmo projeto GCP. O segredo nunca passa por argumento (histórico do shell,
`ps`): entra por stdin/arquivo, sai por stdout.

```
secret list                              os nomes, nunca os valores
secret get <nome>                        o valor (para $(...) ou > arquivo)
echo -n "<valor>" | secret set <nome>    grava/versiona
secret set <nome> --de-arquivo <path>    grava um arquivo inteiro como segredo
secret run <nome=VAR,...> -- <cmd>        roda <cmd> com os segredos como variáveis, sem tocar disco
```

## `memoria-sync.mjs` — memória sob versionamento

`enviar` (disco → repo), `puxar` (repo → disco, na outra máquina), `conferir` (link morto/órfão).
Tem um **guardião de segredos**: ao enviar, barra qualquer memória com valor de segredo vivo (chave,
token, chave privada) ou marcada `sensitive: true` — esses vivem no cofre, não no git. E-mail pessoal
num repo de contexto privado é esperado, e passa.
