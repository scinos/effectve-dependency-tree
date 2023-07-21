Forked from `@automattic/effective-module-tree`, hosted in https://github.com/Automattic/wp-calypso/tree/trunk/packages/effective-module-tree

---

# effective-dependency-tree

CLI tool that generates an ASCII tree with the representation of packages in `node_modules` and
their dependencies. This works over the actual `node_modules` files, so you need to install your
dependencies first (i.e. `npm install` or `yarn install`).

It generates the _logical_ representation of the tree. A package may appear multiple times if
it is depended on by multiple packages, even if all point to the same file on the filesystem.
In other words, it "un-hoists" hoisted/deduped packages.

It will traverse regular `dependencies`, `devDependencies` and `peerDependencies`, but will ignore
optional `peerDependencies` (as specified in `peerDependenciesMeeta`).

## Why?

Usually, the package manger has a way to list the dependencies (`npm ls` or `yarn list`). However
this includes deduplicated packages, and requires the presence of the lock file to generate the
tree. This is the package manager's vision of the tree.

System tools like `ls`, `find` or `tree` can generate a similar output, but those represent the
filesystem view of the tree. Depending on how effective the package manager is hoisting dependencies,
this view may not be comparable.

`effective-dependency-tree` generates node's vision of the dependency tree. Is what node will find when
requiring dependencies, ignoring where the package physically live in the file system. This tree
should be consistent across package managers and different hoisting capabilities. As such, it can
be used to verify that the dependeny tree remains constant when migrating to a different package
manager.

## Usage

Run `effective-dependency-tree` in the root of your project.

Use `effective-dependency-tree --root <path>` to print the tree in a different project. Example:

```bash
effective-dependency-tree --root "./src/package.json"
```

This tool can generate either an ascii tree, or a list (easier to visualize dependency chains in
big trees). It can be specified with the flags `-o tree` or `-o list`.

If you are using this tool to analyze many packages (e.g. in a monorepo), you can pass `--root` multiple
times. Discovered trees will be reused and cached across packages, significatively speeding it up:

```bash
effective-dependency-tree --root "./packages/a/package.json" --root "./packages/b/package.json"
```

Check out `effective-dependency-tree --help` for other flags and examples.

## Troubleshooting

Invoke the command with `DEBUG=effective-dependency-tree ./effective-dependency-tree` to get a verbose
log of what is going on.
