export interface RestorationOptions {
    colorize: boolean;
    fixDamage: boolean;
    enhanceDetails: boolean;
}

export interface ImageFile {
    file: File;
    preview: string; // base64 data uri
}
