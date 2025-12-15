import {
    Media,
    ImageBlock,
    VideoBlock,
    isImageBlock,
    isVideoBlock
} from '../language/generated/ast.js';
import { Utils } from './utils.js';

export class MediaGenerator {
    static generateMedia(media: Media): string {
        if (isImageBlock(media)) return this.generateImageBlock(media);
        if (isVideoBlock(media)) return this.generateVideoBlock(media);
        return '';
    }

    static generateImageBlock(image: ImageBlock): string {
        const url = Utils.escapeHtml(image.url.trim());
        return `            <img src="${url}" alt="Slide image" style="max-width: 100%; height: auto;">`;
    }

    static generateVideoBlock(video: VideoBlock): string {
        const url = Utils.escapeHtml(video.url.trim());
        return `            <video controls style="max-width: 100%; height: auto;">
                <source src="${url}">
                Your browser does not support the video tag.
            </video>`;
    }
}

