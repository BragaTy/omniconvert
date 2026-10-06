# 🚀 OmniConvert Studio - Suite Universal de Arquivos, PDFs e Multimídia

Uma plataforma web completa, moderna e **100% executada no navegador (client-side)** para conversão universal de arquivos, edição avançada de PDFs (com todas as 32 ferramentas estilo iLovePDF) e estúdio multimídia de vídeo e áudio.

---

## 🌟 3 Módulos Principais

### 1. 🔄 Conversor Universal de Arquivos
- Conversão em lote com **download de todos os arquivos em um único .ZIP**.
- Suporte a arrastar múltiplos arquivos ou **colar direto com `Ctrl + V`**.
- Formatos suportados:
  - **Imagens**: PNG, JPG/JPEG, WEBP, BMP, ICO (Favicons multi-tamanho), PDF, SVG, Base64 Data URI.
  - **Planilhas & Dados**: CSV, Excel (XLSX/XLS), JSON, YAML, XML, TSV, HTML (Tabela formatada), TXT.
  - **Documentos**: Markdown (.md), HTML, TXT, PDF.
  - **Compactação & Hashes**: Arquivo ZIP, Checksum SHA-256 / SHA-1, Base64.
- Modal de ajustes finos: controle de compressão (10-100%), redimensionamento em pixels com aspect ratio, escalas de cinza, delimitador CSV e indentação JSON/YAML.

### 2. 📑 Suite Completa de 32 Ferramentas PDF (Estilo iLovePDF)
1. **Juntar PDF**: Mesclar e juntar múltiplos PDFs na ordem desejada.
2. **Dividir PDF**: Separar páginas individuais ou por intervalo personalizado (ex: `1-3, 5`).
3. **Comprimir PDF**: Otimizar e diminuir tamanho do PDF re-renderizando páginas em canvas.
4. **PDF para Word**: Extrair texto e gerar documento DOCX do Microsoft Word.
5. **PDF para PowerPoint**: Gerar apresentação de slides a partir do PDF.
6. **PDF para Excel**: Extrair dados tabulares para planilha XLSX do Excel.
7. **Word para PDF**: Converter documentos de texto/word para PDF formatado.
8. **PowerPoint para PDF**: Converter apresentações para PDF.
9. **Excel para PDF**: Converter tabelas e planilhas XLSX para PDF.
10. **Editar PDF**: Adicionar textos, anotações e carimbos no documento.
11. **PDF para JPG**: Extrair e converter cada página do PDF em imagem JPG de alta resolução.
12. **JPG para PDF**: Converter imagens para documento PDF com ajuste de orientação e margens.
13. **Assinar PDF**: Assinatura digital / rubrica carimbada diretamente na página.
14. **Marca d'água**: Inserir texto ou logo diagonal/centralizado em todas as páginas com transparência.
15. **Rodar PDF**: Girar páginas em 90°, 180° ou 270°.
16. **HTML para PDF**: Converter código ou página HTML em documento PDF.
17. **Desbloquear PDF**: Remover restrições de PDFs protegidos.
18. **Proteger PDF**: Definir senha e criptografar metadados do PDF.
19. **Organizar PDF**: Reordenar, remover ou duplicar páginas de um PDF.
20. **PDF para PDF/A**: Converter para padrão ISO arquivístico de longa duração.
21. **Reparar PDF**: Reparar erros de estrutura e referências cruzadas (XREF).
22. **Números de página**: Adicionar numeração de páginas (ex: `1 / 10`) no rodapé ou cabeçalho.
23. **Digitalize e transforme em PDF**: Capturar imagens pela câmera/webcam e gerar PDF limpo.
24. **OCR PDF**: Extrair texto puro de documentos para permitir busca e cópia.
25. **Comparar PDF**: Comparar dois documentos lado a lado com índice de similaridade de conteúdo.
26. **Ocultar PDF (Redact)**: Aplicar tarja preta permanente sobre informações sensíveis.
27. **Recortar PDF**: Ajustar margens e caixas de corte do PDF.
28. **Formulários PDF**: Criar campos de formulários interativos preenchíveis.
29. **Resumir com IA**: Análise semântica e resumo dos pontos-chave do documento em tópicos.
30. **Traduzir PDF**: Tradução instantânea de texto extraído do documento.
31. **PDF para Markdown**: Converter PDFs para `.md` estruturado com títulos, listas e parágrafos.

### 3. 🎬 Estúdio de Vídeo & Áudio
- 🔇 **Remover Áudio do Vídeo (Deixar Mudo)**: Processa o vídeo e remove completamente a faixa sonora, gerando vídeo silencioso WebM/MP4.
- 🎵 **Extrair Áudio do Vídeo**: Extrai a trilha sonora de qualquer vídeo para arquivo de áudio WAV (16-bit PCM de estúdio).
- ✂️ **Cortar Vídeo (Trim)**: Defina início e fim em segundos para aparar vídeos.
- 🎛️ **Juntar Múltiplos Áudios**: Concatene duas ou mais músicas/áudios em uma única faixa sequencial.
- ✂️ **Cortar Áudio**: Corte gravações de voz ou trechos de músicas.
- 🔴 **Gravador de Tela do Computador**: Grave sua tela, janela ou aba do navegador diretamente no formato de vídeo.

---

## 🔒 100% Seguro & Privado (Zero Envio a Servidores)
Todo o processamento ocorre via **WebAssembly**, **Web Audio API**, **HTML5 Canvas**, **pdf-lib** e **MediaRecorder** diretamente na memória RAM da sua máquina. Seus dados nunca saem do seu computador.

---

## 🌐 Como Publicar no GitHub Pages

O projeto já está configurado com caminhos relativos (`base: './'`) e possui o arquivo de automação `.github/workflows/deploy.yml`.

### Passo a Passo:
1. No seu GitHub, crie um novo repositório (exemplo: `omniconvert`).
2. No seu terminal dentro desta pasta, vincule o repositório remoto:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/omniconvert.git
   git branch -M main
   git push -u origin main
   ```
3. No GitHub:
   - Acesse **Settings** > **Pages**.
   - Em **Build and deployment** > **Source**, selecione **GitHub Actions**.
4. Pronto! O GitHub Actions irá construir e publicar o site automaticamente no endereço:
   `https://SEU_USUARIO.github.io/omniconvert/`

---

## 💻 Como Rodar Localmente

### Opção 1: Clique Duplo no Windows
Dê um duplo clique no arquivo [`iniciar_conversor.bat`](file:///C:/Users/202451053167/.gemini/antigravity/scratch/universal-file-converter/iniciar_conversor.bat).

### Opção 2: Terminal
```bash
npm run dev
```
Acesse [http://localhost:5173](http://localhost:5173).
