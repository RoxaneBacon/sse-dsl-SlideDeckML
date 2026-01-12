import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

/**
 * Utility class for converting images to Base64 data URIs
 */
export class ImageConverter {
    /**
     * Convert an image to Base64 data URI (async version)
     * @param imagePath URL (http/https) or file path (absolute/relative)
     * @param basePath Base path for resolving relative paths (directory of .sdml file)
     * @returns Base64 data URI string
     */
    public static async convertToBase64Async(imagePath: string, basePath?: string): Promise<string> {
        try {
            // Check if it's a URL
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                return await this.fetchAndConvertUrl(imagePath);
            }
            
            // Handle file paths
            let resolvedPath = imagePath;
            
            // If relative path and basePath provided, resolve it
            if (!path.isAbsolute(imagePath) && basePath) {
                resolvedPath = path.resolve(basePath, imagePath);
            }
            
            // Read file and convert to base64
            return this.convertFileToBase64(resolvedPath);
        } catch (error) {
            console.error(`Failed to convert image to base64: ${imagePath}`, error);
            // Return a fallback transparent pixel
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        }
    }

    /**
     * Convert an image to Base64 data URI (synchronous version for file paths only)
     * @param imagePath File path (absolute/relative) - URLs will return original path
     * @param basePath Base path for resolving relative paths (directory of .sdml file)
     * @returns Base64 data URI string or original URL
     */
    public static convertToBase64Sync(imagePath: string, basePath?: string): string {
        try {
            // If it's a URL, return as-is (cannot fetch synchronously without blocking)
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                console.warn(`Cannot convert URL to base64 synchronously: ${imagePath}`);
                return imagePath;
            }
            
            // Handle file paths
            let resolvedPath = imagePath;
            
            // If relative path and basePath provided, resolve it
            if (!path.isAbsolute(imagePath) && basePath) {
                resolvedPath = path.resolve(basePath, imagePath);
            }
            
            // Read file and convert to base64
            return this.convertFileToBase64(resolvedPath);
        } catch (error) {
            console.error(`Failed to convert image to base64: ${imagePath}`, error);
            // Return a fallback transparent pixel
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        }
    }

    /**
     * Fetch image from URL and convert to Base64
     * @param url Image URL
     * @returns Promise with Base64 data URI
     */
    private static fetchAndConvertUrl(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const client = url.startsWith('https://') ? https : http;
            
            client.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to fetch image: ${response.statusCode}`));
                    return;
                }
                
                const chunks: Buffer[] = [];
                
                response.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });
                
                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const mimeType = this.getMimeTypeFromUrl(url, response.headers['content-type']);
                    const base64 = buffer.toString('base64');
                    resolve(`data:${mimeType};base64,${base64}`);
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Read file from disk and convert to Base64
     * @param filePath Absolute file path
     * @returns Base64 data URI string
     */
    private static convertFileToBase64(filePath: string): string {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        
        const buffer = fs.readFileSync(filePath);
        const mimeType = this.getMimeTypeFromPath(filePath);
        const base64 = buffer.toString('base64');
        
        return `data:${mimeType};base64,${base64}`;
    }

    /**
     * Determine MIME type from file path
     * @param filePath File path
     * @returns MIME type string
     */
    private static getMimeTypeFromPath(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp',
            '.ico': 'image/x-icon'
        };
        
        return mimeTypes[ext] || 'image/png';
    }

    /**
     * Determine MIME type from URL and content-type header
     * @param url Image URL
     * @param contentType Content-Type header from response
     * @returns MIME type string
     */
    private static getMimeTypeFromUrl(url: string, contentType?: string): string {
        // Try content-type header first
        if (contentType && contentType.startsWith('image/')) {
            return contentType.split(';')[0];
        }
        
        // Fallback to extension from URL
        return this.getMimeTypeFromPath(url);
    }
}