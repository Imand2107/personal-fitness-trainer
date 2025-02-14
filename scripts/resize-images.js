const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const CONTENT_SOURCE = 'content/img/exercises';
const ASSETS_TARGET = 'assets/images/exercises';
const MAX_SIZE = 800; // Maximum width or height
const GIF_QUALITY = 60; // Quality for GIFs (lower = smaller file size)
const WEBP_QUALITY = 75; // Quality for WebP
const PNG_QUALITY = 80; // Quality for PNG

async function ensureDirectoryExists(directory) {
  try {
    await fs.access(directory);
  } catch {
    await fs.mkdir(directory, { recursive: true });
  }
}

async function resizeImage(inputPath, outputPath, options = {}) {
  const ext = path.extname(inputPath).toLowerCase();
  
  try {
    let sharpInstance = sharp(inputPath);
    
    // Get image metadata
    const metadata = await sharpInstance.metadata();
    
    // Calculate new dimensions while maintaining aspect ratio
    const ratio = Math.min(MAX_SIZE / metadata.width, MAX_SIZE / metadata.height, 1);
    const width = Math.round(metadata.width * ratio);
    const height = Math.round(metadata.height * ratio);
    
    // Resize image
    sharpInstance = sharpInstance.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });

    // Apply format-specific optimizations
    switch (ext) {
      case '.gif':
        await sharpInstance
          .gif({ quality: GIF_QUALITY })
          .toFile(outputPath);
        break;
      case '.webp':
        await sharpInstance
          .webp({ quality: WEBP_QUALITY })
          .toFile(outputPath);
        break;
      case '.png':
        await sharpInstance
          .png({ quality: PNG_QUALITY })
          .toFile(outputPath);
        break;
      default:
        await sharpInstance.toFile(outputPath);
    }

    const stats = await fs.stat(inputPath);
    const newStats = await fs.stat(outputPath);
    const reduction = ((stats.size - newStats.size) / stats.size * 100).toFixed(2);
    
    console.log(`✅ ${path.basename(inputPath)}: ${reduction}% reduction`);
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
  }
}

async function processDirectory() {
  try {
    // Ensure target directory exists
    await ensureDirectoryExists(ASSETS_TARGET);

    // Get all files from source directory
    const files = await fs.readdir(CONTENT_SOURCE);
    
    // Filter for image files
    const imageFiles = files.filter(file => 
      /\.(gif|webp|png|jpg|jpeg)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} images to process...`);

    // Process each image
    for (const file of imageFiles) {
      const inputPath = path.join(CONTENT_SOURCE, file);
      const outputPath = path.join(ASSETS_TARGET, file);
      await resizeImage(inputPath, outputPath);
    }

    console.log('\nImage processing complete! 🎉');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
processDirectory(); 