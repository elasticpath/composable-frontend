import type { PackageManager } from './helpers/get-pkg-manager';
export declare class DownloadError extends Error {
}
export declare function createApp({ appPath, packageManager, example, examplePath, typescript, }: {
    appPath: string;
    packageManager: PackageManager;
    example?: string;
    examplePath?: string;
    typescript?: boolean;
}): Promise<void>;
