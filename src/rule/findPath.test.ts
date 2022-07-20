import { findPath } from ".";
import * as a from "../api/model";

describe("Match paths to path nodes", () => {
  it("Matches path when path is exact", () => {
    const root: a.Root = a.newRootNode();
    const path = "/should/match/exactly";
    root.paths[path] = a.newPathNode(path);

    const pathNode = findPath(root, path);

    expect(pathNode?.x_name).toBe(path);
  });

  it("Returns null when exact path does not match", () => {
    const root: a.Root = a.newRootNode();
    const path = "/exact/path";
    root.paths[path] = a.newPathNode(path);

    const pathNode = findPath(root, "should/not/exist");

    expect(pathNode).toBe(null);
  });

  it("matches on /user/{user_id}", () => {
    const root: a.Root = a.newRootNode();
    const path = "/user/{user_id}";
    root.paths[path] = a.newPathNode(path);

    const pathNode = findPath(root, "/user/1");

    expect(pathNode?.x_name).toBe(path);
  });

  it("matches on /user/{user_id}/subresource/{some_id} hello", () => {
    const root: a.Root = a.newRootNode();
    const path = "/user/{user_id}/subresource/{some_id}";
    root.paths[path] = a.newPathNode(path);

    const pathNode = findPath(root, "/user/1/subresource/10");

    expect(pathNode?.x_name).toBe(path);
  });

  it("matches on /user/{user_id}/subresource/{some_id} when there are 2", () => {
    const root: a.Root = a.newRootNode();
    const path1 = "/user/{user_id}/subresource/{some_id}";
    root.paths[path1] = a.newPathNode(path1);

    const path2 = "/user/{user_id}/subresource/{some_id}/longer";
    root.paths[path2] = a.newPathNode(path2);

    const pathNode = findPath(root, "/user/1/subresource/10");

    expect(pathNode?.x_name).toBe(path1);
  });

  it("returns null on /user/1/subresource/10 when path does not exist", () => {
    const root: a.Root = a.newRootNode();

    const path2 = "/user/{user_id}/subresource/{some_id}/longer";
    root.paths[path2] = a.newPathNode(path2);

    const pathNode = findPath(root, "/user/1/subresource/10");

    expect(pathNode).toBe(null);
  });

  it("matches on /user/{user_id}/subresource/{some_id}/subsubresource when there are 3 paths", () => {
    const root: a.Root = a.newRootNode();
    const path1 = "/user/{user_id}/subresource/{some_id}";
    root.paths[path1] = a.newPathNode(path1);

    const path2 = "/user/{user_id}/subresource/{some_id}/longer";
    root.paths[path2] = a.newPathNode(path2);

    const path3 = "/user/{user_id}/subresource/{some_id}/subsubresource";
    root.paths[path3] = a.newPathNode(path3);

    const pathNode = findPath(root, "/user/1/subresource/10/subsubresource");

    expect(pathNode?.x_name).toBe(path3);
  });
});
