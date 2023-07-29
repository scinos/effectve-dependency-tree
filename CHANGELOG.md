# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixes

- Fix typo in exported names which prevents CLI to work.

## [2.0.0] - 2023-07-22

### Breaking

- Exclude optional peer dependencies (specified in `peerDependenciesMeta`) when computing the tree. This is a breaking change, as it may generate different output than before for the same dependency tree.

### Addded

- Supports to pass multiple `package.json`. This will speed up effective tree generation in monorepos, where different `package.json` will probably reuse most of the modules.

## [1.1.1] - 2023-01-09

### Fixes

- Use a different logic to print the final list that should avoid problems with big trees

## [1.1.0] - 2022-12-23

### Added

- Follow `peerDependencies` as well when generating the graph
- Follow `devDependencies` but only for root packages

## [1.0.0] - 2022-12-23

- Initial release

[unreleased]: https://github.com/scinos/effectve-dependency-tree/compare/2.0.0...HEAD
[2.0.0]: https://github.com/scinos/effectve-dependency-tree/compare/1.1.1...2.0.0
[1.1.1]: https://github.com/scinos/effectve-dependency-tree/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/scinos/effectve-dependency-tree/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/scinos/effectve-dependency-tree/releases/tag/1.0.0
