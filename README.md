# 🔄 OmniConvert - Conversor Universal de Arquivos

Um aplicativo web moderno, completo e 100% privado para converter qualquer arquivo para qualquer outro formato compatível diretamente na memória do seu navegador.

---

## ✨ Principais Características

- 🔒 **100% Privado**: Todos os arquivos são convertidos diretamente na memória RAM do seu navegador. **Nenhum arquivo é enviado para servidores externos**.
- ⚡ **Sem Limites & Sem Filas**: Converta quantos arquivos quiser, com o tamanho que desejar, sem créditos diários ou tempo de espera.
- 🎯 **Detecção Inteligente de Formatos**: Ao arrastar ou colar qualquer arquivo, o sistema detecta o tipo (MIME / Extensão) e sugere apenas os formatos de destino matematicamente compatíveis.
- 🗜️ **Conversão e Download em Lote (.ZIP)**: Converta dezenas de arquivos com um clique e baixe todos juntos em um pacote `.zip`.
- ⚙️ **Ajustes Finos de Conversão**:
  - **Imagens**: Qualidade de compressão (10% - 100%), Redimensionamento em pixels, Manter Proporção, Preto e Branco (Escala de Cinza).
  - **PDFs**: Orientação (Retrato / Paisagem), Tamanho da Página (A4 / Carta), Margens.
  - **Tabelas / CSV**: Delimitador (Vírgula, Ponto e Vírgula, Tabulação), Indentação de JSON/YAML.
  - **Áudios**: Taxa de amostragem (44.1 kHz, 48 kHz, 22.05 kHz), Canais (Estéreo / Mono).
- 👁️ **Pré-visualização Integrada**: Veja imagens, código, dados JSON/CSV e reproduza arquivos de áudio antes e depois da conversão.
- 📋 **Suporte a Ctrl+V**: Cole imagens tiradas por print/screenshot direto da sua área de transferência para a tela.

---

## 📂 Matriz de Compatibilidade Suportada

| Categoria | Formatos de Origem | Formatos de Destino Compatíveis |
| :--- | :--- | :--- |
| **🖼️ Imagens** | PNG, JPG, JPEG, WEBP, BMP, ICO, SVG, GIF | `PNG`, `JPG`, `WEBP`, `BMP`, `ICO` (Favicons multi-tamanho), `PDF`, `SVG`, `Base64 Data URI`, `ZIP` |
| **📊 Planilhas & Dados** | CSV, XLSX, XLS, TSV, JSON, XML, YAML | `Excel (.xlsx)`, `CSV`, `JSON`, `YAML`, `XML`, `HTML (Tabela)`, `TSV`, `TXT`, `ZIP` |
| **📄 Documentos & Texto** | Markdown (.md), HTML, TXT, PDF | `PDF` (diagramado com paginação), `HTML`, `Markdown`, `TXT`, `Base64`, `ZIP` |
| **🎵 Áudio** | MP3, WAV, OGG, AAC, M4A, FLAC | `WAV` (PCM 16-bit estúdio), `OGG/WebM`, `ZIP`, `Checksum` |
| **🗜️ Compactados & Hash** | Qualquer arquivo binário / ZIP | `Descompactar ZIP`, `Compactar em ZIP`, `Base64 (.txt)`, `Checksum SHA-256 / SHA-1` |

---

## 🚀 Como Iniciar

### Opção 1: Clique Duplo (Windows)
Dê um duplo clique no arquivo [`iniciar_conversor.bat`](file:///C:/Users/202451053167/.gemini/antigravity/scratch/universal-file-converter/iniciar_conversor.bat).

### Opção 2: Terminal
```bash
cd C:\Users\202451053167\.gemini\antigravity\scratch\universal-file-converter
npm run dev
```

Abra o seu navegador em [http://localhost:5173](http://localhost:5173).
