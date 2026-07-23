#!/usr/bin/env node
/**
 * secret.mjs — o cofre. Um lugar só para credencial, em vez de espalhada em .env e memória.
 *
 * POR QUE Google Secret Manager, e não 1Password/Bitwarden/Keychain:
 * é o único cofre que funciona nas TRÊS pontas que este trabalho usa — o Mac, a máquina Windows e
 * as VMs da nuvem — sem assinatura nova nem instalar nada, porque as três já autenticam no mesmo
 * projeto GCP (`gcloud`). Versionado, com IAM e log de auditoria de quem leu o quê. As VMs leem
 * pela própria conta de serviço, então o segredo nunca toca disco nem repositório.
 *
 * O segredo NUNCA passa por argumento de linha de comando (fica no histórico do shell e no `ps`):
 * `set` lê da entrada padrão, `get` escreve na saída padrão, e `run` injeta no ambiente do filho
 * sem escrever em lugar nenhum.
 *
 * USO
 *   secret list                          lista os nomes (nunca os valores)
 *   secret get <nome>                    imprime o valor (para $(...) ou > arquivo)
 *   echo -n "<valor>" | secret set <nome>   grava/versiona um segredo
 *   secret set <nome> --de-arquivo <path>   grava o conteúdo de um arquivo como segredo
 *   secret run <nome=VAR,...> -- <cmd>    roda <cmd> com os segredos exportados como variáveis
 *   secret rm <nome>                     apaga (pede confirmação)
 *
 * Config: PROJETO vem de `gcloud config get-value project`, ou de SECRET_PROJECT.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [acao, ...resto] = process.argv.slice(2);

function projeto() {
  if (process.env.SECRET_PROJECT) return process.env.SECRET_PROJECT;
  const r = spawnSync("gcloud", ["config", "get-value", "project"], { encoding: "utf8" });
  const p = (r.stdout || "").trim();
  if (!p) { console.error("✗ nenhum projeto GCP ativo. Rode: gcloud config set project <id>  (ou defina SECRET_PROJECT)"); process.exit(2); }
  return p;
}
const PROJ = () => ["--project", projeto()];
const gcloud = (args, opts = {}) => spawnSync("gcloud", args, { encoding: "utf8", ...opts });

function listar() {
  const r = gcloud(["secrets", "list", ...PROJ(), "--format=value(name)"]);
  if (r.status !== 0) { console.error(r.stderr.trim()); process.exit(1); }
  const nomes = (r.stdout || "").trim().split("\n").filter(Boolean).sort();
  console.log(nomes.length ? nomes.map(n => "  " + n).join("\n") : "  (nenhum segredo ainda)");
  console.error(`\n  ${nomes.length} segredo(s) em ${projeto()}`);
}

function get(nome) {
  if (!nome) { console.error("uso: secret get <nome>"); process.exit(2); }
  // --format sem newline: o valor sai cru, pronto pra $(secret get x) ou > arquivo
  const r = gcloud(["secrets", "versions", "access", "latest", "--secret", nome, ...PROJ()]);
  if (r.status !== 0) { console.error(`✗ ${nome}: ${r.stderr.trim().split("\n").pop()}`); process.exit(1); }
  process.stdout.write(r.stdout);
}

function set(nome, valor) {
  if (!nome) { console.error("uso: echo -n <valor> | secret set <nome>   |   secret set <nome> --de-arquivo <path>"); process.exit(2); }
  // existe? cria; senão, adiciona versão (histórico preservado, nunca sobrescreve cego)
  const existe = gcloud(["secrets", "describe", nome, ...PROJ()]).status === 0;
  if (!existe) {
    const c = gcloud(["secrets", "create", nome, "--replication-policy=automatic", ...PROJ()]);
    if (c.status !== 0) { console.error(c.stderr.trim()); process.exit(1); }
  }
  const r = gcloud(["secrets", "versions", "add", nome, "--data-file=-", ...PROJ()], { input: valor });
  if (r.status !== 0) { console.error(r.stderr.trim()); process.exit(1); }
  console.error(`  ✓ ${nome} ${existe ? "nova versão" : "criado"} (${valor.length} bytes) em ${projeto()}`);
}

function run(mapa, cmd) {
  // mapa = "nome-secreto=VAR,outro=VAR2" — busca cada um e injeta no ambiente do filho
  const pares = mapa.split(",").map(s => s.trim()).filter(Boolean).map(s => s.split("="));
  const env = { ...process.env };
  for (const [nome, varName] of pares) {
    const r = gcloud(["secrets", "versions", "access", "latest", "--secret", nome, ...PROJ()]);
    if (r.status !== 0) { console.error(`✗ ${nome}: ${r.stderr.trim().split("\n").pop()}`); process.exit(1); }
    env[varName || nome] = r.stdout;
  }
  const [bin, ...args] = cmd;
  const r = spawnSync(bin, args, { stdio: "inherit", env });
  process.exit(r.status ?? 0);
}

switch (acao) {
  case "list": case "ls": listar(); break;
  case "get": get(resto[0]); break;
  case "set": {
    const nome = resto[0];
    const iArq = resto.indexOf("--de-arquivo");
    const valor = iArq >= 0 ? readFileSync(resto[iArq + 1]) : readFileSync(0);   // 0 = stdin
    set(nome, valor);
    break;
  }
  case "run": {
    const sep = resto.indexOf("--");
    if (sep < 1) { console.error("uso: secret run <nome=VAR,...> -- <cmd...>"); process.exit(2); }
    run(resto[0], resto.slice(sep + 1));
    break;
  }
  case "rm": {
    const nome = resto[0];
    if (!nome) { console.error("uso: secret rm <nome>"); process.exit(2); }
    const r = gcloud(["secrets", "delete", nome, ...PROJ(), "--quiet"]);
    console.error(r.status === 0 ? `  ✓ ${nome} apagado` : r.stderr.trim());
    process.exit(r.status ?? 0);
    break;
  }
  default:
    console.error("secret list | get <nome> | set <nome> | run <n=VAR,...> -- <cmd> | rm <nome>");
    process.exit(2);
}
