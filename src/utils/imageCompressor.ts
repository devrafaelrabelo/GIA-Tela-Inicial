/**
 * Utilitário para redimensionar e comprimir imagens no cliente (HTML5 Canvas).
 * Converte fotos grandes (3MB a 15MB) em JPEG otimizado (~60KB a 150KB),
 * evitando QuotaExceededError no localStorage e mantendo alta nitidez visual.
 */
export const compressImageFile = (
  file: File,
  maxWidth = 1400,
  maxHeight = 900,
  quality = 0.82
): Promise<{ dataUrl: string; sizeKb: number }> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Falha ao ler o arquivo.'));
        return;
      }

      const img = new Image();
      img.onerror = (err) => reject(err);

      img.onload = () => {
        let { width, height } = img;

        // Se a imagem for menor que os limites, mantém as dimensões
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback caso canvas não esteja disponível
          const sizeKb = Math.round(file.size / 1024);
          resolve({ dataUrl: rawDataUrl, sizeKb });
          return;
        }

        // Desenha a imagem no canvas redimensionado
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Exporta como JPEG otimizado
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          sizeKb
        });
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
};

