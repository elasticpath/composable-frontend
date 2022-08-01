export declare type RepoInfo = {
    username: string;
    name: string;
    branch: string;
    filePath: string;
};
export declare function isUrlOk(url: string): Promise<boolean>;
export declare function getRepoInfo(url: URL, examplePath?: string): Promise<RepoInfo | undefined>;
export declare function hasRepo({ username, name, branch, filePath, }: RepoInfo): Promise<boolean>;
export declare function existsInRepo(nameOrUrl: string): Promise<boolean>;
export declare function downloadAndExtractRepo(root: string, { username, name, branch, filePath }: RepoInfo): Promise<void>;
export declare function downloadAndExtractExample(root: string, name: string): Promise<void>;
//# sourceMappingURL=examples.d.ts.map