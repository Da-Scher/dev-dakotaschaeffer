# My Personal Portfolio
Code for my personal portfolio featuring normalized commit activity between codeberg and github commits, retrieving and displaying README information, Project search by Programming Language and name, and programming language charts.
This project is primarily written in TypeScript and uses React+Vite for the frontend, and uses AWS Lambda, S3, SecretsManager, and OIDC for the backend.

If you are going to use this as a template for your own portfolio, its recommended that you get all of the data before using a cloud platform, to do this create a GitHub and Codeberg secret token, and create `./backend/.env` with `GITHUB_SECRET` and `CODEBERG_SECRET` values and either compile `./backend/src/local/index.ts` or run directly.

Afterwords, you can upload the file generated in `./public/data/commits.json` to your preferred static storage solution, like S3.


