module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer", // Analyzes commits to determine the type of release
    "@semantic-release/release-notes-generator", // Generates release notes
    "@semantic-release/changelog", // Updates CHANGELOG.md
    "@semantic-release/npm", // Publishes the package to npm
    "@semantic-release/github", // Creates a GitHub release
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
