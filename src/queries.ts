export const allRepos = /* GraphQL */ `
  query allRepos($afterRepoCursor: String = null) {
    organization(login: "PaloAltoNetworks") {
      repositories(
        first: 100
        after: $afterRepoCursor
        privacy: PUBLIC
        orderBy: { field: UPDATED_AT, direction: DESC }
        isFork: false
        isLocked: false
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          repositoryTopics(first: 100) {
            totalCount
            nodes {
              topic {
                id
                name
              }
              id
              resourcePath
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
          name
        }
      }
    }
  }
`
