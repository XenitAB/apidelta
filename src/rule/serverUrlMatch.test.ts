import { removeServer } from ".";
import * as a from "../api/model";

describe("Truncate server from url", () => {
  describe("Url is absolute with no path", () => {
    const root = a.newRootNode();
    root.servers = [{ url: "http://example.com" }];
    it("Ignores server and returns path if match-server-url is none", () => {
      const request = new URL("http://someOtherServer.com/test/path");
      const path = removeServer(root, request, "none");
      expect(path).toBe("/test/path");
    });
    it("returns null if match-server-url is full", () => {
      const request = new URL("http://someOtherServer.com/test/path");
      const path = removeServer(root, request, "full");
      expect(path).toBe(null);
    });
    it("returns path if match-server-url is full and paths match", () => {
      const request = new URL("http://example.com/test/path");
      const path = removeServer(root, request, "full");
      expect(path).toBe("/test/path");
    });
  });

  describe("Url is absolute with no path, but trailing slash on server", () => {
    const root = a.newRootNode();
    root.servers = [{ url: "http://example.com/" }];
    it("Ignores server and returns path if match-server-url is none", () => {
      const request = new URL("http://someOtherServer.com/test/path");
      const path = removeServer(root, request, "none");
      expect(path).toBe("/test/path");
    });
    it("returns null if match-server-url is full", () => {
      const request = new URL("http://someOtherServer.com/test/path");
      const path = removeServer(root, request, "full");
      expect(path).toBe(null);
    });
    it("returns path if match-server-url is full and paths match", () => {
      const request = new URL("http://example.com/test/path");
      const path = removeServer(root, request, "full");
      expect(path).toBe("/test/path");
    });
  });

  describe("Url is absolute with path", () => {
    const root = a.newRootNode();
    root.servers = [{ url: "http://example.com/test" }];
    it("Ignores server and returns path if match-server-url is none", () => {
      const request = new URL("http://someOtherServer.com/test/path");
      const path = removeServer(root, request, "none");
      expect(path).toBe("/path");
    });

    it("Returns null if match-server-url is full and server does not match", () => {
      const request = new URL("http://someOtherServer.com/test/path");
      const path = removeServer(root, request, "full");
      expect(path).toBe(null);
    });

    it("Returns path if match-server-url is full and server does match", () => {
      const request = new URL("http://example.com/test/path");
      const path = removeServer(root, request, "full");
      expect(path).toBe("/path");
    });

    describe("Url is absolute with trailing subpath", () => {
      it("matches localhost path with parameter", () => {
        const url = "https://sub.example-dev.local:8001/api/v2/";
        const root = a.newRootNode();
        root.servers = [{ url: url }];
        const request = new URL(
          "http://localhost:34643/api/v2/device/00000000-0000-0000-0000-000000000000"
        );
        const path = removeServer(root, request, "none");
        expect(path).toBe("/device/00000000-0000-0000-0000-000000000000");
      });
    });
  });

  describe("Url is a relative path", () => {
    const root = a.newRootNode();
    root.servers = [{ url: "/test" }];
    it("Ignores server and returns path if match-server-url is none", () => {
      const request = new URL("http://someOtherServer.com/test/path");
      const path = removeServer(root, request, "none");
      expect(path).toBe("/path");
    });

    it("Return subpath if paths match and match-server-url is full", () => {
      const request = new URL("http://someOtherServer.com/test/path");
      const path = removeServer(root, request, "full");
      expect(path).toBe("/path");
    });

    it("Return null if paths do not match and match-server-url is full", () => {
      const request = new URL("http://someOtherServer.com/nosubpath/path");
      const path = removeServer(root, request, "full");
      expect(path).toBe(null);
    });
  });
});
