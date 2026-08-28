import {GetObjectCommand, GetObjectCommandOutput, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";

import type {CommitActivity, CommitActivityResponse} from "./commit/commit.js";

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

    const parsed: CommitActivityResponse = JSON.parse(json);

    const currentDateFromMidnight: Date = new Date;
    currentDateFromMidnight.setHours(0, 0, 0, 0);
    currentDateFromMidnight.setDate(currentDateFromMidnight.getDate());
    const MS_IN_DAY: number = 24 * 60 * 60 * 1000;
    const LIMIT_DAYS_IN_MS = 364 * MS_IN_DAY;
    const COMMIT_AGE_LIMIT_IN_MS_FROM_MIDNIGHT: number = currentDateFromMidnight.getTime() - LIMIT_DAYS_IN_MS;
    const filteredParsed: CommitActivity[] = parsed.commits.filter((item: CommitActivity): boolean => {
        const itemDate = new Date(item.authoredAt).getTime();
        return itemDate - COMMIT_AGE_LIMIT_IN_MS_FROM_MIDNIGHT >= 0;
    });

    return {
        commitActivityResponse: {generatedAt: parsed.generatedAt, commits: filteredParsed},
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
