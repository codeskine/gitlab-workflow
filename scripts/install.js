#!/usr/bin/env node
/**
 * Installa le Cursor Agent Skills del pacchetto `gitlab-author`
 * (repo: gitlab-author-skills) nella directory delle skill di Cursor.
 * Default: ~/.cursor/skills/ — usa --project per installare nel repo corrente.
 *
 * Layout pacchetto (ispirato a vince-winkintel/gitlab-cli-skills):
 *
 *   gitlab-author-skills/
 *   ├── SKILL.md
 *   ├── VERSION
 *   ├── gitlab-issue-author/       <- sub-skill copiata
 *   │   ├── SKILL.md
 *   │   ├── templates/
 *   │   └── references/
 *   └── scripts/install.js
 *
 * Uso:
 *   npx gitlab-author install
 *   npx gitlab-author install --project
 *   npx gitlab-author install --skill gitlab-issue-author
 *   npx gitlab-author install --force
 *   npx gitlab-author list
 *
 * Senza argomenti equivale a `install` (tutte le sub-skill).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_ROOT = path.join(__dirname, '..');

function parseArgs(argv) {
  const args = {
    command: 'install',
    project: false,
    force: false,
    help: false,
    skill: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') args.help = true;
    else if (a === '--project') args.project = true;
    else if (a === '--force') args.force = true;
    else if (a === '--skill') {
      args.skill = argv[++i] || null;
    } else if (a === 'install' || a === 'list' || a === 'version') {
      args.command = a;
    } else if (!a.startsWith('-')) {
      args.command = a;
    }
  }
  return args;
}

function usage() {
  console.log(`gitlab-author — installa le Cursor Agent Skills del pacchetto

Uso:
  npx gitlab-author [comando] [opzioni]

Comandi:
  install       Copia le sub-skill nella destinazione (default)
  list          Elenca le sub-skill disponibili
  version       Stampa la versione del pacchetto

Opzioni per install:
  --project          Destinazione: ./.cursor/skills/ (repo corrente)
                     Default: ~/.cursor/skills/
  --skill <name>     Installa solo la sub-skill indicata (es. gitlab-issue-author)
                     Default: tutte le sub-skill rilevate
  --force            Sovrascrive le directory di destinazione se esistono

Globali:
  -h, --help    Mostra questo messaggio

Esempi:
  npx gitlab-author
  npx gitlab-author install --project --force
  npx gitlab-author install --skill gitlab-issue-author
  npx gitlab-author list
`);
}

function discoverSubSkills() {
  // Ogni directory a root con un SKILL.md (esclusa la root stessa) e' una sub-skill.
  const entries = fs.readdirSync(PKG_ROOT, { withFileTypes: true });
  const skills = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'scripts') continue;
    const skillFile = path.join(PKG_ROOT, e.name, 'SKILL.md');
    if (fs.existsSync(skillFile)) {
      skills.push(e.name);
    }
  }
  return skills.sort();
}

function destinationRoot(project, cwd) {
  if (project) return path.join(cwd, '.cursor', 'skills');
  return path.join(os.homedir(), '.cursor', 'skills');
}

function readVersion() {
  const p = path.join(PKG_ROOT, 'VERSION');
  try {
    return fs.readFileSync(p, 'utf8').trim();
  } catch {
    return 'unknown';
  }
}

function installOne(skillName, destBase, force) {
  const src = path.join(PKG_ROOT, skillName);
  if (!fs.existsSync(src)) {
    console.error(`Sorgente non trovata: ${src}`);
    return false;
  }
  const dest = path.join(destBase, skillName);
  if (fs.existsSync(dest)) {
    if (!force) {
      console.error(
        `La destinazione esiste gia':\n  ${dest}\n` +
          'Usa --force per sovrascrivere, oppure rimuovi la cartella manualmente.'
      );
      return false;
    }
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(destBase, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`  ✓ ${skillName} -> ${dest}`);
  return true;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    usage();
    process.exit(0);
  }

  if (args.command === 'version') {
    console.log(readVersion());
    process.exit(0);
  }

  const skills = discoverSubSkills();
  if (skills.length === 0) {
    console.error('Nessuna sub-skill rilevata nel pacchetto. Pacchetto corrotto?');
    process.exit(1);
  }

  if (args.command === 'list') {
    console.log(`gitlab-author v${readVersion()} — sub-skill disponibili:\n`);
    for (const s of skills) console.log(`  - ${s}`);
    process.exit(0);
  }

  if (args.command !== 'install') {
    console.error(`Comando sconosciuto: ${args.command}`);
    usage();
    process.exit(1);
  }

  const target = args.skill ? [args.skill] : skills;
  if (args.skill && !skills.includes(args.skill)) {
    console.error(`Sub-skill non trovata: ${args.skill}`);
    console.error(`Disponibili: ${skills.join(', ')}`);
    process.exit(1);
  }

  const destBase = destinationRoot(args.project, process.cwd());
  console.log(`Installazione in: ${destBase}\n`);

  let ok = 0;
  let ko = 0;
  for (const s of target) {
    if (installOne(s, destBase, args.force)) ok++;
    else ko++;
  }

  console.log(`\nCompletato: ${ok} installata/e, ${ko} errore/i.`);
  process.exit(ko > 0 ? 1 : 0);
}

main();
