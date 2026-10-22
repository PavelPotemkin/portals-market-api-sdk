import { describe, expect, it } from "vitest";
import { err, isErr, isOk, ok, PortalsError, type Result, unwrap } from "../src";

describe("Result", () => {
  it("ok / err / guards", () => {
    const a: Result<number, string> = ok(1);
    const b: Result<number, string> = err("bad");
    expect(a).toEqual({ ok: true, value: 1 });
    expect(b).toEqual({ ok: false, error: "bad" });
    expect(isOk(a) && a.value).toBe(1);
    expect(isErr(b) && b.error).toBe("bad");
    expect(isErr(a)).toBe(false);
  });

  it("unwrap возвращает значение или бросает ошибку", () => {
    expect(unwrap(ok("v"))).toBe("v");
    const e = new PortalsError({ kind: "http", method: "GET", endpoint: "/x", message: "boom" });
    expect(() => unwrap(err(e))).toThrow(e);
    expect(() => unwrap(err("text"))).toThrow(/text/);
  });
});
