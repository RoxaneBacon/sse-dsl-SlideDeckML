import * as fs from 'fs';
import * as path from 'path';

/**
 * Utility class for managing video assets
 * Handles copying local video files to an assets folder and generating relative paths
 */
export class VideoAssetManager {
    private outputHtmlPath?: string;
    private sourceFilePath?: string;
    private assetsFolder?: string;

    /**
     * Set the output HTML file path
     * @param htmlPath Absolute path to the output HTML file
     */
    public setOutputHtmlPath(htmlPath: string): void {
        this.outputHtmlPath = htmlPath;
        
        // Calculate assets folder name based on HTML filename
        // e.g., "final-pres.html" -> "final-pres-assets"
        const htmlDir = path.dirname(htmlPath);
        const htmlBasename = path.basename(htmlPath, path.extname(htmlPath));
        this.assetsFolder = path.join(htmlDir, `${htmlBasename}-assets`);
    }

    /**
     * Set the source .sdml file path
     * @param filePath Absolute path to the source .sdml file
     */
    public setSourceFilePath(filePath: string): void {
        this.sourceFilePath = filePath;
    }

    /**
     * Process a video URL - if it's a local file, copy it to assets folder
     * @param videoUrl The video URL or path from the SDML file
     * @returns The final URL to use in the HTML (relative path if local, original URL if remote)
     */
    public async processVideoPath(videoUrl: string): Promise<string> {
        // If it's a remote URL, return as-is
        if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
            return videoUrl;
        }

        // If we don't have output path configured, return original path
        if (!this.outputHtmlPath || !this.assetsFolder) {
            console.warn('Output HTML path not set. Cannot copy video to assets folder.');
            return videoUrl;
        }

        try {
            // Resolve the video file path
            let resolvedVideoPath = videoUrl;
            
            // If relative path and sourceFilePath provided, resolve it relative to .sdml file
            if (!path.isAbsolute(videoUrl) && this.sourceFilePath) {
                const basePath = path.dirname(this.sourceFilePath);
                resolvedVideoPath = path.resolve(basePath, videoUrl);
            }

            // Check if the video file exists
            if (!fs.existsSync(resolvedVideoPath)) {
                console.warn(`Video file not found: ${resolvedVideoPath}`);
                return videoUrl;
            }

            // Create assets folder if it doesn't exist
            if (!fs.existsSync(this.assetsFolder)) {
                fs.mkdirSync(this.assetsFolder, { recursive: true });
                console.log(`Created assets folder: ${this.assetsFolder}`);
            }

            // Get the filename from the video path
            const videoFileName = path.basename(resolvedVideoPath);
            const destinationPath = path.join(this.assetsFolder, videoFileName);

            // Copy the video file to the assets folder
            fs.copyFileSync(resolvedVideoPath, destinationPath);
            console.log(`Copied video: ${videoFileName} -> ${path.basename(this.assetsFolder)}/`);

            // Return relative path from HTML file to the video in assets folder
            const assetsFolderName = path.basename(this.assetsFolder);
            return `./${assetsFolderName}/${videoFileName}`;

        } catch (error) {
            console.error(`Failed to process video asset: ${videoUrl}`, error);
            return videoUrl; // Fallback to original path
        }
    }

    /**
     * Get the assets folder path (if configured)
     */
    public getAssetsFolder(): string | undefined {
        return this.assetsFolder;
    }
}
