import fs from 'fs';

if (fs.existsSync('dist')) {
  if (fs.existsSync('docs')) {
    fs.rmSync('docs', { recursive: true, force: true });
  }
  fs.cpSync('dist', 'docs', { recursive: true });
  console.log('✅ Arquivos de produção copiados para a pasta docs/ para compatibilidade total com GitHub Pages!');
}
