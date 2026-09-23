import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFromStorage, writeToStorage } from "../src/hooks/useScans.js";

// readFromStorage/writeToStorage branch on `typeof window` before touching
// localStorage, and Node has neither global by default, so these tests
// stand up the smallest possible stand-ins: a plain object for `window`
// and a Map-backed localStorage that can be told to throw on setItem. That
// is the only mocking here — it replaces the browser, not any logic under
// test — everything else runs the real functions from useScans.js.

function makeFakeLocalStorage() {
  const store = new Map();
  return {
    calls: [],
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      this.calls.push(value);
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
    _store: store,
  };
}

let originalWindow;
let originalLocalStorage;

beforeEach(() => {
  originalWindow = global.window;
  originalLocalStorage = global.localStorage;
  global.window = {};
  global.localStorage = makeFakeLocalStorage();
});

afterEach(() => {
  global.window = originalWindow;
  global.localStorage = originalLocalStorage;
});

describe("readFromStorage", () => {
  it("returns an empty array when nothing is stored yet", () => {
    expect(readFromStorage()).toEqual([]);
  });

  it("returns an empty array when the stored value is not valid JSON", () => {
    global.localStorage.setItem("rohan_scans", "{not valid json");
    expect(readFromStorage()).toEqual([]);
  });

  it("returns an empty array when the parsed value is not an array", () => {
    global.localStorage.setItem("rohan_scans", JSON.stringify({ id: "x" }));
    expect(readFromStorage()).toEqual([]);
  });

  it("keeps well-formed scans", () => {
    const scans = [
      { id: "scan_1", tables: [] },
      { id: "scan_2", tables: [] },
    ];
    global.localStorage.setItem("rohan_scans", JSON.stringify(scans));
    expect(readFromStorage()).toEqual(scans);
  });

  it("filters out entries missing a string id", () => {
    const raw = [
      { id: "scan_1" },
      { id: 42 },
      { notAnId: "scan_2" },
      null,
      "just a string",
    ];
    global.localStorage.setItem("rohan_scans", JSON.stringify(raw));
    const result = readFromStorage();
    expect(result).toEqual([{ id: "scan_1" }]);
  });

  it("rejects an entry carrying its own __proto__ key", () => {
    // JSON.parse gives this a real, enumerable OWN property literally
    // named "__proto__" — it does not touch the object's prototype. The
    // guard in readFromStorage is specifically there to catch this shape.
    const polluted = JSON.parse(
      '{"id":"scan_evil","__proto__":{"polluted":true}}',
    );
    const clean = { id: "scan_clean" };
    global.localStorage.setItem(
      "rohan_scans",
      JSON.stringify([polluted, clean]),
    );

    const result = readFromStorage();

    expect(result).toEqual([{ id: "scan_clean" }]);
    expect(Object.prototype.polluted).toBeUndefined();
  });

  it("returns an empty array when window is not defined (SSR)", () => {
    global.localStorage.setItem("rohan_scans", JSON.stringify([{ id: "a" }]));
    global.window = undefined;
    expect(readFromStorage()).toEqual([]);
  });
});

describe("writeToStorage", () => {
  it("stores the scans as JSON under the expected key", () => {
    const scans = [{ id: "scan_1" }, { id: "scan_2" }];
    writeToStorage(scans);
    expect(JSON.parse(global.localStorage.getItem("rohan_scans"))).toEqual(
      scans,
    );
  });

  it("drops the oldest scan and retries when storage is full", () => {
    const scans = [{ id: "scan_1" }, { id: "scan_2" }, { id: "scan_3" }];
    let attempt = 0;
    global.localStorage.setItem = function (key, value) {
      attempt += 1;
      if (attempt < 3) {
        const err = new Error("quota");
        err.name = "QuotaExceededError";
        throw err;
      }
      this._store.set(key, value);
    };

    writeToStorage(scans);

    // Two failures, each dropping the last (oldest-appended) entry, then a
    // third call that finally succeeds with only the first scan left.
    expect(attempt).toBe(3);
    expect(JSON.parse(global.localStorage.getItem("rohan_scans"))).toEqual([
      { id: "scan_1" },
    ]);
  });

  it("stops retrying once only one scan is left, and does not throw", () => {
    global.localStorage.setItem = () => {
      const err = new Error("quota");
      err.name = "QuotaExceededError";
      throw err;
    };

    expect(() => writeToStorage([{ id: "scan_1" }])).not.toThrow();
  });

  it("swallows a non-quota error instead of throwing or retrying", () => {
    let calls = 0;
    global.localStorage.setItem = () => {
      calls += 1;
      const err = new Error("nope");
      err.name = "SecurityError";
      throw err;
    };

    expect(() =>
      writeToStorage([{ id: "scan_1" }, { id: "scan_2" }]),
    ).not.toThrow();
    // No quota-style retry loop for a non-quota error: setItem is called once.
    expect(calls).toBe(1);
  });
});
