import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  applyPatches,
  generate,
  identifiersFor,
  OUTPUT_PATH,
  SPEC_PATH,
} from "../scripts/generate";
import { overrides } from "../spec/overrides";
import { schemas } from "../src";

const rawSpec = JSON.parse(readFileSync(SPEC_PATH, "utf8"));
const spec = applyPatches(rawSpec, overrides.patches);

type Shape = Record<string, z.ZodType>;
function shapeOf(schema: z.ZodType): Shape | undefined {
  const def = (schema as unknown as { _zod: { def: { shape?: Shape } } })._zod.def;
  return def.shape;
}

describe("src/generated.ts", () => {
  it("не устарел: совпадает с выводом генератора", () => {
    expect(readFileSync(OUTPUT_PATH, "utf8")).toBe(generate());
  });

  it("поправка, которая ничего не меняет, роняет генератор", () => {
    const patched = applyPatches(rawSpec, overrides.patches);
    expect(() => applyPatches(patched, overrides.patches.slice(0, 1))).toThrow(/no-op/);
  });

  it("сдвиг индекса параметра ловится guard'ом", () => {
    const moved = structuredClone(rawSpec);
    moved.paths["/partners/collections/preview"].get.parameters.reverse();
    expect(() => applyPatches(moved, overrides.patches)).toThrow(/guard/);
  });

  it("имена: последний сегмент, при коллизии — с префиксом пакета", () => {
    expect(identifiersFor(["model.Nft", "httpmodel.Nft", "dtonft.BulkListingResult"])).toEqual({
      "model.Nft": "ModelNft",
      "httpmodel.Nft": "HttpmodelNft",
      "dtonft.BulkListingResult": "BulkListingResult",
    });
    expect(identifiersFor(["httptrustedapps.fetchOwnedOut"])).toEqual({
      "httptrustedapps.fetchOwnedOut": "FetchOwnedOut",
    });
  });
});

describe("схемы покрывают спеку", () => {
  const definitions = Object.entries<Record<string, unknown>>(spec.definitions);

  it(`все ${definitions.length} определений`, () => {
    expect(definitions.length).toBe(93);
    expect(Object.keys(schemas.definitionSchemas).sort()).toEqual(
      definitions.map(([name]) => name).sort(),
    );
  });

  it("каждое поле каждого определения и его обязательность", () => {
    for (const [name, def] of definitions) {
      const properties = def.properties as Record<string, unknown> | undefined;
      if (!properties) continue;
      const shape = shapeOf(schemas.definitionSchemas[name]);
      expect(shape, name).toBeDefined();
      if (!shape) continue;
      expect(Object.keys(shape).sort(), name).toEqual(Object.keys(properties).sort());
      const required = new Set((def.required as string[] | undefined) ?? []);
      for (const prop of Object.keys(properties)) {
        expect(shape[prop].safeParse(undefined).success, `${name}.${prop}`).toBe(
          !required.has(prop),
        );
      }
    }
  });

  it("значения enum'ов определений", () => {
    for (const [name, def] of definitions) {
      if (!def.enum) continue;
      const ident = identifiersFor(Object.keys(spec.definitions))[name];
      const values = Object.values((schemas as unknown as Record<string, object>)[ident]);
      expect(values.sort(), name).toEqual([...(def.enum as string[])].sort());
    }
  });

  it("все пути и методы, параметры, тела и ответы", () => {
    const seen = new Set<string>();
    for (const [path, ops] of Object.entries<Record<string, Record<string, unknown>>>(spec.paths)) {
      for (const [method, op] of Object.entries(ops)) {
        const found = Object.entries(schemas.operations).find(
          ([, o]) => o.path === path && o.method === method.toUpperCase(),
        );
        expect(found, `${method} ${path}`).toBeDefined();
        if (!found) continue;
        const [id, def] = found;
        seen.add(id);
        const params = (op.parameters as { name: string; in: string; required?: boolean }[]) ?? [];
        expect([...def.pathParams].sort()).toEqual(
          params
            .filter((p) => p.in === "path")
            .map((p) => p.name)
            .sort(),
        );
        const query = params.filter((p) => p.in === "query");
        if (query.length === 0) {
          expect(def.query, id).toBeUndefined();
        } else {
          const shape = shapeOf(def.query as z.ZodType);
          expect(Object.keys(shape ?? {}).sort(), id).toEqual(query.map((p) => p.name).sort());
          for (const p of query) {
            expect(shape?.[p.name].safeParse(undefined).success, `${id}.${p.name}`).toBe(
              !p.required,
            );
          }
        }
        expect(def.body === undefined, id).toBe(!params.some((p) => p.in === "body"));
        const responses = op.responses as Record<string, { schema?: unknown }>;
        const success = Object.keys(responses).find((c) => c.startsWith("2"));
        expect(def.successStatus, id).toBe(Number(success));
        expect(def.response === null, id).toBe(!responses[success as string].schema);
      }
    }
    expect(seen.size).toBe(35);
    expect(Object.keys(schemas.operations)).toHaveLength(35);
  });
});

describe("известные ошибки спеки исправлены поправками", () => {
  it("/collection-offers/{id}/all отдаёт объект {offers, total_count}", () => {
    const op = schemas.operations.getCollectionOffersAll;
    expect(op.response.safeParse({ offers: [], total_count: 0 }).success).toBe(true);
    expect(op.response.safeParse([]).success).toBe(false);
  });

  it("/collection-offers/{id}/top допускает null", () => {
    const op = schemas.operations.getCollectionOffersTop;
    expect(op.response.safeParse(null).success).toBe(true);
  });

  it("каждая поправка указывает причину", () => {
    for (const patch of overrides.patches) expect(patch.reason.length).toBeGreaterThan(10);
  });
});

describe("правила генерации", () => {
  it("enum в ответе принимает любую строку, в запросе строгий", () => {
    expect(schemas.HttpmodelNftSchema.safeParse({ ...nftBase, status: "future" }).success).toBe(
      true,
    );
    expect(schemas.NftStatusSchema.safeParse("future").success).toBe(false);
    expect(schemas.GetNftsSearchQuerySchema.safeParse({ sort_by: "future" }).success).toBe(false);
  });

  it("ответы сохраняют неизвестные поля, запросы — нет", () => {
    const parsed = schemas.HttpmodelNftSchema.parse({ ...nftBase, extra: 1 });
    expect(parsed.extra).toBe(1);
    const req = schemas.BuyPartialInSchema.parse({ nft_details: [], extra: 1 } as never);
    expect("extra" in req).toBe(false);
  });

  it("необязательные поля ответа принимают null", () => {
    expect(schemas.HttpmodelNftSchema.safeParse({ ...nftBase, price: null }).success).toBe(true);
  });

  it("deprecated-поля помечены в типах", () => {
    const source = readFileSync(OUTPUT_PATH, "utf8");
    const block = source.slice(source.indexOf("export interface FetchAllUniqueAttributeFloorsOut"));
    expect(block.slice(0, block.indexOf("}"))).toMatch(/@deprecated\s*\n\s*\*\/\s*\n\s*models/);
  });

  it("zod — v4", () => {
    expect(typeof z.looseObject).toBe("function");
  });
});

const nftBase = {
  id: "n",
  name: "N",
  photo_url: "p",
  collection_id: "c",
  external_collection_number: 1,
  status: "listed",
  attributes: [],
  is_owned: true,
};
