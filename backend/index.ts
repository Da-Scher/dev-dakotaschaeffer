import type {CommitActivityResponse} from "../src/types/commit";
import * as fs from "node:fs";

export async function commitsJsonExists(): Promise<boolean> {
    try {
        await fs.promises.access("../../public/data/commits.json", fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

export async function getNormalizedData(): Promise<boolean> {
    // check if file at './public/data/commits.js exists
    if(await commitsJsonExists()) {
        console.log("File exists");
        return true;
    } else {
        console.log("File does not exist");
        return false;
    }
}

