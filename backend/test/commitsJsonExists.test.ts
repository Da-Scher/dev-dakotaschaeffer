import {expect, test, vi, it} from "vitest";
import {fs, vol} from "memfs";
import {commitsJsonExists} from "../index";

vi.mock("node:fs")
vi.mock("node:fs/promises")

it(`should return true if commits.json exists`, async () => {
    vol.fromJSON({
        '../../public/data/commits.json': "{}"
    })
    const result = await commitsJsonExists();
    expect(result).toBe(true);
})

it(`should return false if commits.json does not exist`, async () => {
    vol.reset()
    vol.fromJSON({
        '../../public/data/' : undefined,
    })
    const result = await commitsJsonExists();
    expect(result).toBe(false);
})
