import sharp from 'sharp';
import { mkdir } from 'fs/promises';

const sizes = [16, 48, 128];

async function generateIcons() {
  try {
    await mkdir('icons', { recursive: true });

    for (const size of sizes) {
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 122, b: 255, alpha: 1 }
        }
      })
      .png()
      .toFile(`icons/icon${size}.png`);
    }
    
    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 