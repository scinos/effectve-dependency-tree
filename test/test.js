import { jest } from "@jest/globals";
import mockFs from "mock-fs";
import {
  candidates,
  getEffectiveTreeAsTree,
  getEffectiveTreeAsList,
} from "../src/index";

describe("Candidate generation", () => {
  it("Traverses the path", () => {
    const paths = Array.from(
      candidates("/project/root/a/node_modules/b/node_modules/c")
    );
    expect(paths).toStrictEqual([
      "/project/root/a/node_modules/b/node_modules/c/node_modules",
      "/project/root/a/node_modules/b/node_modules",
      "/project/root/a/node_modules",
      "/project/root/node_modules",
      "/project/node_modules",
      "/node_modules",
      "/node_modules",
    ]);
  });
});

describe("Effective tree generation", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("as tree", () => {
    it("Generates the simplified tree", () => {
      mockFs({
        "/project/root/package.json": JSON.stringify({
          name: "root",
          version: "1.0.0",
          dependencies: {
            a: "^1.0.0",
            b: "^2.0.0",
          },
        }),
        "/project/root/node_modules/a/package.json": JSON.stringify({
          name: "a",
          version: "1.1.1",
          dependencies: {},
        }),
        "/project/root/node_modules/b/package.json": JSON.stringify({
          name: "b",
          version: "2.2.2",
          dependencies: {
            c: "3.2.1",
          },
        }),
        "/project/root/node_modules/c/package.json": JSON.stringify({
          name: "c",
          version: "3.2.1",
        }),
      });

      const tree = getEffectiveTreeAsTree("/project/root/package.json");
      //prettier-ignore
      expect(tree).toEqual([
				'└─ root@1.0.0',
				'   ├─ a@1.1.1',
				'   └─ b@2.2.2',
				'      └─ c@3.2.1',
			].join('\n'));
    });

    it("Detects circular dependencies", () => {
      mockFs({
        "/project/root/package.json": JSON.stringify({
          name: "root",
          version: "1.0.0",
          dependencies: {
            a: "^1.0.0",
            b: "^2.0.0",
          },
        }),
        "/project/root/node_modules/a/package.json": JSON.stringify({
          name: "a",
          version: "1.1.1",
          dependencies: {},
        }),
        "/project/root/node_modules/b/package.json": JSON.stringify({
          name: "b",
          version: "2.2.2",
          dependencies: {
            c: "3.2.1",
          },
        }),
        "/project/root/node_modules/c/package.json": JSON.stringify({
          name: "c",
          version: "3.2.1",
          dependencies: {
            b: "^2.0.0",
          },
        }),
      });

      const tree = getEffectiveTreeAsTree("/project/root/package.json");

      //prettier-ignore
      expect(tree).toEqual([
				'└─ root@1.0.0',
				'   ├─ a@1.1.1',
				'   └─ b@2.2.2',
				'      └─ c@3.2.1',
				'         └─ b@2.2.2: [Circular]'
			].join('\n'));
    });

    it("Does not cache circular dependencies", async () => {
      mockFs({
        "/project/root/package.json": JSON.stringify({
          name: "root",
          version: "1.0.0",
          dependencies: {
            a: "^1.0.0",
            b: "^2.0.0",
          },
        }),
        "/project/root/node_modules/a/package.json": JSON.stringify({
          name: "a",
          version: "1.1.1",
          dependencies: {
            b: "^2.0.0",
          },
        }),
        "/project/root/node_modules/b/package.json": JSON.stringify({
          name: "b",
          version: "2.2.2",
          dependencies: {
            c: "3.2.1",
          },
        }),
        "/project/root/node_modules/c/package.json": JSON.stringify({
          name: "c",
          version: "3.2.1",
          dependencies: {
            a: "^1.0.0",
          },
        }),
      });

      const tree = await getEffectiveTreeAsTree("/project/root/package.json");

      /**
       * Note that when we find 'b' in the second chain (root->b->...), it has been processed previously in the first chain
       * (root->a->b->...). However, because that first chain ended in a circular dependency, none of the packages in the chain
       * was cached.
       *
       * This is a good thing. Otherwise, when we process 'b' the chain root->b we would pick 'b' from the cache,
       * (equal to 'b->c->a[Circular]'), and we would end up with the chain root->b->c->a[Circular], which is not true.
       *
       * So tldr: branches with [Circular] dependencies are not cached, and this test is asserting that behaviour.
       */

      //prettier-ignore
      expect(tree).toEqual([
				'└─ root@1.0.0',
				'   ├─ a@1.1.1',
				'   │  └─ b@2.2.2',
				'   │     └─ c@3.2.1',
				'   │        └─ a@1.1.1: [Circular]',
				'   └─ b@2.2.2',
				'      └─ c@3.2.1',
				'         └─ a@1.1.1',
				'            └─ b@2.2.2: [Circular]',
			].join('\n'));
    });
  });

  describe("as list", () => {
    it("Complex tree", async () => {
      mockFs({
        "/project/root/package.json": JSON.stringify({
          name: "root",
          version: "1.0.0",
          dependencies: {
            a: "^1.0.0",
            b: "^2.0.0",
          },
        }),
        "/project/root/node_modules/a/package.json": JSON.stringify({
          name: "a",
          version: "1.1.1",
          dependencies: {
            b: "^2.0.0",
          },
        }),
        "/project/root/node_modules/b/package.json": JSON.stringify({
          name: "b",
          version: "2.2.2",
          dependencies: {
            c: "3.2.1",
          },
        }),
        "/project/root/node_modules/c/package.json": JSON.stringify({
          name: "c",
          version: "3.2.1",
          dependencies: {
            a: "^1.0.0",
          },
        }),
      });

      const tree = await getEffectiveTreeAsList("/project/root/package.json");

      //prettier-ignore
      expect(tree).toEqual([
				'root@1.0.0',
				'root@1.0.0 a@1.1.1',
				'root@1.0.0 a@1.1.1 b@2.2.2',
				'root@1.0.0 a@1.1.1 b@2.2.2 c@3.2.1',
				'root@1.0.0 a@1.1.1 b@2.2.2 c@3.2.1 a@1.1.1 [Circular]',
				'root@1.0.0 b@2.2.2',
				'root@1.0.0 b@2.2.2 c@3.2.1',
				'root@1.0.0 b@2.2.2 c@3.2.1 a@1.1.1',
				'root@1.0.0 b@2.2.2 c@3.2.1 a@1.1.1 b@2.2.2 [Circular]',
			].join('\n'));
    });
  });

  afterEach(() => {
    console.warn.mockRestore();
  });
});
