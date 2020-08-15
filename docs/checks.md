# Community Health Assessment Checks

**Health Checks:**

- [Repository description](#repository-description)
- [README.md file](#readmemd-file)
- [Support file](#support-file)
- [License File](#license-file)
- [License Type](#license-type)
- [Repository name](#repository-name)
- [Contribution Guidelines](#contribution-guidelines)
- [Repository Topics](#repository-topics)
- [Issue and PR Templates](#issue-and-pr-templates)
- [Code of Conduct](#code-of-conduct)

## Repository description

Configuration key: `description`  
Default value: 15

#### Solution

Fill in the description field for a repo. The description field is near the top
of the repo in GitHub, to the left of the URL field.

## README.md file

Configuration key: `readmeFile`  
Default value: 15

#### Configuration

| Parameter | Default | Description                                   |
| --------- | ------- | --------------------------------------------- |
| size      | 200     | README.md must be at least this size in bytes |

#### Solution

Create a file called `README.md` in the root of your repository. Case matters,
so `README.MD` does not count. The file must be at least 200 bytes by default.

## Support file

Configuration key: `supportFile`  
Default value: 15

#### Configuration

| Parameter | Default | Description                                    |
| --------- | ------- | ---------------------------------------------- |
| size      | 50      | SUPPORT.md must be at least this size in bytes |

#### Solution

Create a file called `SUPPORT.md` in the root of your repository. Case matters,
so `SUPPORT.MD` does not count. The file must be at least 50 bytes by default.

## License File

Configuration key: `licenseFile`  
Default value: 20

#### Solution

Create a file called `LICENSE` in the root of your repository. Recommended but
not required to use https://choosealicense.com/ to populate this file.

## License Type

Configuration key: `license`  
Default value: 10

#### Configuration

| Parameter | Default                               | Description                                                      |
| --------- | ------------------------------------- | ---------------------------------------------------------------- |
| licenses  | All known license types (not 'other') | Array of strings of acceptable license keys (eg. ["mit", "isc"]) |

#### Solution

Create a file called `LICENSE` in the root of your repository. Use
https://choosealicense.com/ to populate this file. The license file text must be
exact and be recognized by GitHub to pass this check.

## Repository name

Configuration key: `repoName`  
Default value: 10

#### Configuration

| Parameter | Default | Description                                     |
| --------- | ------- | ----------------------------------------------- |
| length    | 10      | Repo name must be at least this many characters |

#### Solution

Lengthen the repository in a meaningful way. Try not to use acronyms in a repo
name. When appropriate, prefix the repo name with the technology or framework
you're building for. For example, a react library could be prefixed with
`react-` and a Terraform template could be prefixed with `terraform-template`.

## Contribution Guidelines

Configuration key: `contributingFile`  
Default value: 10

#### Configuration

| Parameter | Default | Description                                         |
| --------- | ------- | --------------------------------------------------- |
| size      | 200     | CONTRIBUTING.md must be at least this size in bytes |

#### Solution

Create a file called `CONTRIBUTING.md` in the root of your repository. Case
matters, so `CONTRIBUTING.MD` does not count. The file must be at least 200
bytes by default.

## Repository Topics

Configuration key: `topics`  
Default value: 10

#### Configuration

| Parameter        | Default | Description                                                                                           |
| ---------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| requiredTopic    | []      | Array of strings where at least one string must be a topic on the repo to pass                        |
| topicCorrections | {}      | Hash where key is the desired topic and value is an array of topics to replace with the desired topic |

If topicCorrections is configured, then this check doesn't just pass or fail. It
also makes corrections to topics before it performs the check. An example
configuration:

```yml
checks:
  topics:
    topicCorrections:
      product1:
        - product-1
        - my-product-1
      product2:
        - product-2
        - my-product-2
    requiredTopic:
      - product1
      - product2
```

In the above example, every repo must have a `product1` or `product2` topic.
Similar topics will be corrected for uniformity across repos. For example, topic
`product-1` will be changed to `product1`.

#### Solution

Add one of the required topics to the repository. Topics are tags for a repo
that help others find your work.

## Issue and PR Templates

Configuration key: `customTemplates`  
Default value: 5

#### Solution

Create a custom Issue and Pull Request Template. More information here:

- [Issue Templates](https://help.github.com/en/github/building-a-strong-community/configuring-issue-templates-for-your-repository)
- [Pull Request Templates](https://help.github.com/en/github/building-a-strong-community/creating-a-pull-request-template-for-your-repository)

## Code of Conduct

Configuration key: `codeOfConductFile`  
Default value: 5

#### Configuration

| Parameter | Default | Description                                            |
| --------- | ------- | ------------------------------------------------------ |
| size      | 200     | CODE_OF_CONDUCT.md must be at least this size in bytes |

#### Solution

Create a file called `CODE_OF_CONDUCT.md` in the root of your repository. Case
matters, so `CODE_OF_CONDUCT.MD` does not count. The file must be at least 200
bytes by default.
