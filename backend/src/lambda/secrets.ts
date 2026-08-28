import {
    GetSecretValueCommand,
    GetSecretValueCommandOutput,
    SecretsManagerClient
} from "@aws-sdk/client-secrets-manager";

const secretsManagerClient = new SecretsManagerClient();

let secretGH: string | undefined;
let secretCB: string | undefined;

export async function getGitHubToken(): Promise<string> {
    if (secretGH !== undefined) {
        return secretGH;
    }
    const secretName: string | undefined = process.env.GITHUB_SECRET;
    const response: GetSecretValueCommandOutput = await secretsManagerClient.send(
        new GetSecretValueCommand({
            SecretId: secretName,
        })
    );

    if (!response.SecretString) {
        throw new Error("GitHub token secret is empty.");
    }
    const secretString: {token: string} = JSON.parse(response.SecretString);
    if (!secretString) {
        throw new Error("GitHub token secret is empty.");
    }
    secretGH = secretString.token;
    return secretGH;
}

export async function getCodebergToken(): Promise<string> {
    if (secretCB !== undefined) {
        return secretCB;
    }
    const secretName: string | undefined = process.env.CODEBERG_SECRET;
    const response: GetSecretValueCommandOutput = await secretsManagerClient.send(
        new GetSecretValueCommand({
            SecretId: secretName,
        })
    );
    if (!response.SecretString) {
        throw new Error("No Codeberg secret.");
    }
    const secretString: {token: string} = JSON.parse(response.SecretString);
    if (!secretString) {
        throw new Error("Codeberg token secret is empty.");
    }
    secretCB = secretString.token;
    return secretCB;
}