import type {CommitActivityResponse} from "../types/commit";

export async function getCommitActivity(): Promise<CommitActivityResponse> {
    const response: Response = await fetch("/data/commits.json");

    if(!response.ok) {
        throw new Error(
          `Failed to retrieve commit activity: ${response.status}`,
        );
    }

    return await response.json() as Promise<CommitActivityResponse>;
}
