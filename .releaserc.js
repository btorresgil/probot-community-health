module.exports = {
  preset: 'conventionalcommits',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/git',
      {
        message:
          'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        successComment:
          ":tada: This ${issue.pull_request ? 'PR is included' : 'issue has been resolved'} in version ${nextRelease.version} :tada:\n\nMore details on this release are available in the [GitHub release](<github_release_url>).\n\n> Posted by [semantic-release](https://github.com/semantic-release/semantic-release) bot",
      },
    ],
  ],
}
