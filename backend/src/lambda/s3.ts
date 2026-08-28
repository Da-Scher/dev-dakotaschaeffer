import {GetObjectCommand, GetObjectCommandOutput, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";

import type {CommitActivityResponse} from "./commit/commit.js";

export interface LoadedCommits {
    commitActivityResponse: CommitActivityResponse;
    etag?: string;
}

export async function loadCommits(
    s3: S3Client,
    bucket: string,
    key: string,
): Promise<LoadedCommits> {
    const response: GetObjectCommandOutput = await s3.send(
        new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        })
    );

    if (!response.Body) {
        throw new Error(`${key} has no body`);
    }

    const json: string = await response.Body.transformToString();

    const parsed: unknown = JSON.parse(json);

    return {
        commitActivityResponse: parsed as CommitActivityResponse,
        etag: response.ETag,
    };
}

export async function saveCommits (
    s3: S3Client,
    bucket: string,
    key: string,
    commits: CommitActivityResponse,
    etag?: string,
): Promise<void> {
    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: JSON.stringify(commits, null, 2),
            ContentType: "application/json",
            ...(etag ? { IfMatch: etag } : {})
        })
    );
}
