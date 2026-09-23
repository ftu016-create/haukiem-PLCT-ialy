export async function svgToPngArrayBuffer(svgElement: SVGSVGElement): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        // Standard resolution for crisp Word doc insertion
        canvas.width = svgElement.clientWidth * 2 || 1200;
        canvas.height = svgElement.clientHeight * 2 || 400;

        const context = canvas.getContext('2d');
        if (!context) {
          URL.revokeObjectURL(blobURL);
          resolve(null);
          return;
        }

        // Fill white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(blobURL);
          if (!blob) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result instanceof ArrayBuffer) {
              resolve(new Uint8Array(reader.result));
            } else {
              resolve(null);
            }
          };
          reader.readAsArrayBuffer(blob);
        }, 'image/png');
      };

      image.onerror = () => {
        URL.revokeObjectURL(blobURL);
        resolve(null);
      };

      image.src = blobURL;
    } catch (err) {
      console.error('Error converting SVG to PNG', err);
      resolve(null);
    }
  });
}
