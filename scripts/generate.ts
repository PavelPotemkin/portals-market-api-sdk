/**
 * Генератор `src/generated.ts` из `spec/partners.swagger.json` и `spec/overrides.ts`.
 *
 * Запуск: `npm run generate` (перезаписать) или `npm run generate:check` (упасть, если файл устарел).
 *
 * Правила:
 * - поля из `required` обязательны, остальные `.nullish()`: Go-бэкенд отдаёт null;
 * - объекты ответов — `z.looseObject`: неизвестные поля сохраняются;
 * - enum в ответах принимает любую строку (тип `X | (string & {})`), в запросах строгий;
 * - ограничения (minItems, minimum, …) проверяются только в запросах;
 * - имена: последний сегмент имени определения в PascalCase, при коллизии — с префиксом пакета.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  overrides as defaultOverrides,
  type SpecOverrides,
  type SpecPatch,
} from "../spec/overrides";

// biome-ignore lint/suspicious/noExplicitAny: swagger — произвольный JSON
type Json = any;

interface SchemaNode {
  type?: string;
  $ref?: string;
  items?: SchemaNode;
  properties?: Record<string, SchemaNode>;
  required?: string[];
  enum?: (string | number)[];
  allOf?: SchemaNode[];
  additionalProperties?: SchemaNode | boolean;
  description?: string;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  deprecated?: boolean;
  "x-nullable"?: boolean;
  "x-exactly-one-of"?: string[];
}

interface Parameter extends Omit<SchemaNode, "required"> {
  name: string;
  in: "query" | "path" | "body" | "header" | "formData";
  required?: boolean;
  schema?: SchemaNode;
  collectionFormat?: string;
}

type Mode = "request" | "response";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const SPEC_PATH = resolve(ROOT, "spec/partners.swagger.json");
export const OUTPUT_PATH = resolve(ROOT, "src/generated.ts");

// ── JSON Pointer ──

function decodePointer(pointer: string): string[] {
  if (!pointer.startsWith("/")) throw new Error(`Bad JSON pointer: ${pointer}`);
  return pointer
    .slice(1)
    .split("/")
    .map((s) => s.replaceAll("~1", "/").replaceAll("~0", "~"));
}

function getAt(root: Json, pointer: string): { found: boolean; value: Json } {
  let cur = root;
  for (const key of decodePointer(pointer)) {
    if (cur === null || typeof cur !== "object" || !(key in cur)) {
      return { found: false, value: undefined };
    }
    cur = cur[key];
  }
  return { found: true, value: cur };
}

export function applyPatches(spec: Json, patches: SpecPatch[]): Json {
  const out = structuredClone(spec);
  for (const patch of patches) {
    if (patch.where) {
      const guard = getAt(out, patch.where.pointer);
      if (!guard.found || JSON.stringify(guard.value) !== JSON.stringify(patch.where.equals)) {
        throw new Error(`Override guard failed for ${patch.pointer}: ${patch.where.pointer}`);
      }
    }
    const keys = decodePointer(patch.pointer);
    const last = keys.pop() as string;
    let parent = out;
    for (const key of keys) {
      if (parent === null || typeof parent !== "object" || !(key in parent)) {
        throw new Error(`Override target parent not found: ${patch.pointer}`);
      }
      parent = parent[key];
    }
    const before = JSON.stringify(parent[last]);
    if (patch.remove) {
      if (!(last in parent))
        throw new Error(`Override is a no-op (nothing to remove): ${patch.pointer}`);
      delete parent[last];
    } else {
      if (before === JSON.stringify(patch.value)) {
        throw new Error(`Override is a no-op, spec already has this value: ${patch.pointer}`);
      }
      parent[last] = structuredClone(patch.value);
    }
  }
  return out;
}

// ── Naming ──

function words(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}

function pascal(value: string): string {
  return words(value)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function upperFirst(value: string): string {
  return value[0].toUpperCase() + value.slice(1);
}

export function definitionIdentifiers(names: string[]): Record<string, string> {
  const base = (name: string) => upperFirst(name.split(".").pop() as string);
  const counts = new Map<string, number>();
  for (const name of names) counts.set(base(name), (counts.get(base(name)) ?? 0) + 1);
  const result: Record<string, string> = {};
  const used = new Set<string>();
  for (const name of [...names].sort()) {
    const short = base(name);
    const ident = (counts.get(short) ?? 0) > 1 ? pascal(name.split(".")[0]) + short : short;
    if (used.has(ident)) throw new Error(`Identifier collision: ${ident}`);
    used.add(ident);
    result[name] = ident;
  }
  return result;
}

function operationId(method: string, path: string): string {
  const segments = path
    .replace(/^\/partners/, "")
    .split("/")
    .filter((s) => s && !s.startsWith("{"));
  return method.toLowerCase() + segments.map(pascal).join("");
}

// ── Emission helpers ──

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const key = (name: string) => (IDENT_RE.test(name) ? name : JSON.stringify(name));
const str = (value: unknown) => JSON.stringify(value);

function jsdoc(lines: string[], indent: string): string {
  const clean = lines.flatMap((l) => l.split("\n")).map((l) => l.replaceAll("*/", "*\\/"));
  if (clean.length === 0) return "";
  if (clean.length === 1) return `${indent}/** ${clean[0]} */\n`;
  return `${indent}/**\n${clean.map((l) => `${indent} *${l ? ` ${l}` : ""}`).join("\n")}\n${indent} */\n`;
}

function propertyDoc(node: SchemaNode): string[] {
  const lines: string[] = [];
  if (node.description) lines.push(node.description.trim());
  if (node.deprecated || /deprecated/i.test(node.description ?? "")) lines.push("@deprecated");
  return lines;
}

interface EnumDef {
  name: string;
  values: string[];
  source: string;
  description?: string;
}

interface Emitted {
  zod: string;
  ts: string;
}

class Generator {
  private readonly spec: Json;
  private readonly overrides: SpecOverrides;
  private readonly defs: Record<string, SchemaNode>;
  readonly idents: Record<string, string>;
  private readonly enums = new Map<string, EnumDef>();
  private readonly usedInlineKeys = new Set<string>();

  constructor(spec: Json, overrides: SpecOverrides) {
    this.spec = spec;
    this.overrides = overrides;
    this.defs = spec.definitions;
    this.idents = definitionIdentifiers(Object.keys(this.defs));
    for (const [name, def] of Object.entries(this.defs)) {
      if (def.enum) {
        this.registerEnum(this.idents[name], def.enum.map(String), name, def.description);
      }
    }
  }

  private registerEnum(name: string, values: string[], source: string, description?: string) {
    const existing = this.enums.get(name);
    if (existing) {
      if (JSON.stringify([...existing.values].sort()) !== JSON.stringify([...values].sort())) {
        throw new Error(
          `Enum ${name} has different values at ${existing.source} and ${source}: ` +
            `${existing.values.join(",")} vs ${values.join(",")}`,
        );
      }
      return;
    }
    this.enums.set(name, { name, values, source, description });
  }

  private inlineEnumName(location: string, fallbackKey: string): string {
    const specific = this.overrides.inlineEnums[location];
    if (specific) {
      this.usedInlineKeys.add(location);
      return specific;
    }
    const generic = this.overrides.inlineEnums[fallbackKey];
    if (generic) {
      this.usedInlineKeys.add(fallbackKey);
      return generic;
    }
    throw new Error(`Inline enum at "${location}" has no name in spec/overrides.ts inlineEnums`);
  }

  private refName(ref: string): string {
    const name = ref.replace(/^#\/definitions\//, "");
    if (!this.defs[name]) throw new Error(`Unknown $ref ${ref}`);
    return name;
  }

  /** Схема узла. `location` — для имени inline-enum'а. */
  node(n: SchemaNode, mode: Mode, location: string, fallbackKey: string, indent: string): Emitted {
    const e = this.nodeInner(n, mode, location, fallbackKey, indent);
    if (n["x-nullable"]) return { zod: `${e.zod}.nullable()`, ts: `${e.ts} | null` };
    return e;
  }

  private nodeInner(
    n: SchemaNode,
    mode: Mode,
    location: string,
    fallbackKey: string,
    indent: string,
  ): Emitted {
    const ref = n.$ref ?? (n.allOf?.length === 1 ? n.allOf[0].$ref : undefined);
    if (ref) {
      const name = this.refName(ref);
      const ident = this.idents[name];
      const def = this.defs[name];
      if (def.enum) {
        return mode === "response"
          ? { zod: `openEnum<${ident}>()`, ts: `${ident} | (string & {})` }
          : { zod: `${ident}Schema`, ts: ident };
      }
      return { zod: `z.lazy(() => ${ident}Schema)`, ts: ident };
    }
    if (n.allOf) throw new Error(`Unsupported allOf at ${location}`);

    if (n.enum && (n.type === "integer" || n.type === "number")) {
      if (mode === "response") return { zod: "z.number()", ts: "number" };
      const literals = n.enum.map((v) => `z.literal(${str(v)})`);
      return {
        zod: literals.length === 1 ? literals[0] : `z.union([${literals.join(", ")}])`,
        ts: n.enum.map(str).join(" | "),
      };
    }
    if (n.enum) {
      const name = this.inlineEnumName(location, fallbackKey);
      this.registerEnum(name, n.enum.map(String), location);
      return mode === "response"
        ? { zod: `openEnum<${name}>()`, ts: `${name} | (string & {})` }
        : { zod: `${name}Schema`, ts: name };
    }

    switch (n.type) {
      case "string":
        return { zod: "z.string()", ts: "string" };
      case "boolean":
        return { zod: "z.boolean()", ts: "boolean" };
      case "integer":
      case "number": {
        let zod = n.type === "integer" && mode === "request" ? "z.number().int()" : "z.number()";
        if (mode === "request" && n.minimum !== undefined) zod += `.min(${n.minimum})`;
        if (mode === "request" && n.maximum !== undefined) zod += `.max(${n.maximum})`;
        return { zod, ts: "number" };
      }
      case "array": {
        if (!n.items) throw new Error(`Array without items at ${location}`);
        const item = this.node(n.items, mode, location, fallbackKey, indent);
        let zod = `z.array(${item.zod})`;
        if (mode === "request" && n.minItems !== undefined) zod += `.min(${n.minItems})`;
        if (mode === "request" && n.maxItems !== undefined) zod += `.max(${n.maxItems})`;
        const ts = /[|&]/.test(item.ts) ? `(${item.ts})[]` : `${item.ts}[]`;
        return { zod, ts };
      }
      case "object":
      case undefined: {
        if (n.properties) return this.object(n, mode, location, indent);
        const addl = n.additionalProperties;
        if (addl && typeof addl === "object" && Object.keys(addl).length > 0) {
          const value = this.node(addl, mode, `${location}.*`, `${fallbackKey}.*`, indent);
          return { zod: `z.record(z.string(), ${value.zod})`, ts: `Record<string, ${value.ts}>` };
        }
        return { zod: "z.record(z.string(), z.unknown())", ts: "Record<string, unknown>" };
      }
      default:
        throw new Error(`Unsupported type ${n.type} at ${location}`);
    }
  }

  /** Объект: `zod` — выражение схемы, `ts` — тело типа `{ ... }`. */
  object(n: SchemaNode, mode: Mode, location: string, indent: string): Emitted {
    const required = new Set(n.required ?? []);
    const inner = `${indent}  `;
    const zodProps: string[] = [];
    const tsProps: string[] = [];
    for (const [name, prop] of Object.entries(n.properties ?? {})) {
      const e = this.node(prop, mode, `${location}.${name}`, `${location}.${name}`, inner);
      const doc = jsdoc(propertyDoc(prop), inner);
      if (required.has(name)) {
        zodProps.push(`${doc}${inner}${key(name)}: ${e.zod},`);
        tsProps.push(`${doc}${inner}${key(name)}: ${e.ts};`);
      } else {
        zodProps.push(`${doc}${inner}${key(name)}: ${e.zod}.nullish(),`);
        tsProps.push(`${doc}${inner}${key(name)}?: ${e.ts} | null;`);
      }
    }
    for (const name of required) {
      if (!n.properties?.[name])
        throw new Error(`Required ${name} is not a property at ${location}`);
    }
    if (mode === "response") tsProps.push(`${inner}[key: string]: unknown;`);
    const ctor = mode === "response" ? "z.looseObject" : "z.object";
    let zod = `${ctor}({\n${zodProps.join("\n")}\n${indent}})`;
    const exactlyOne = n["x-exactly-one-of"];
    if (exactlyOne) {
      for (const f of exactlyOne) {
        if (!n.properties?.[f])
          throw new Error(`x-exactly-one-of: ${f} is not a property at ${location}`);
      }
      zod += `.refine(exactlyOneOf(${str(exactlyOne)}), {\n${inner}message: ${str(`Exactly one of ${exactlyOne.join(", ")} must be set`)},\n${inner}path: ${str([exactlyOne[0]])},\n${indent}})`;
    }
    return { zod, ts: `{\n${tsProps.join("\n")}\n${indent}}` };
  }

  definitionModes(): Map<string, Mode> {
    const refsOf = (node: Json, acc: Set<string>) => {
      if (Array.isArray(node)) for (const v of node) refsOf(v, acc);
      else if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) {
          if (k === "$ref" && typeof v === "string") acc.add(this.refName(v));
          else refsOf(v, acc);
        }
      }
    };
    const closure = (roots: Set<string>) => {
      const seen = new Set<string>();
      const stack = [...roots];
      while (stack.length) {
        const name = stack.pop() as string;
        if (seen.has(name)) continue;
        seen.add(name);
        const acc = new Set<string>();
        refsOf(this.defs[name], acc);
        stack.push(...acc);
      }
      return seen;
    };
    const req = new Set<string>();
    const res = new Set<string>();
    for (const ops of Object.values<Json>(this.spec.paths)) {
      for (const op of Object.values<Json>(ops)) {
        for (const param of op.parameters ?? []) if (param.in === "body") refsOf(param, req);
        refsOf(op.responses ?? {}, res);
      }
    }
    const reqAll = closure(req);
    const resAll = closure(res);
    const modes = new Map<string, Mode>();
    for (const name of Object.keys(this.defs)) {
      const inReq = reqAll.has(name);
      const inRes = resAll.has(name);
      if (inReq && inRes && !this.defs[name].enum) {
        throw new Error(`Definition ${name} is used in both requests and responses`);
      }
      modes.set(name, inReq ? "request" : "response");
    }
    return modes;
  }

  run(): string {
    const modes = this.definitionModes();
    const blocks: string[] = [];

    // Определения-объекты.
    const defNames = Object.keys(this.defs).sort((a, b) =>
      this.idents[a].localeCompare(this.idents[b]),
    );
    for (const name of defNames) {
      const def = this.defs[name];
      if (def.enum) continue;
      const ident = this.idents[name];
      const mode = modes.get(name) as Mode;
      const doc = jsdoc(
        [`\`${name}\` (${mode === "request" ? "запрос" : "ответ"})`, ...propertyDoc(def)],
        "",
      );
      const e = this.node({ ...def, type: def.type ?? "object" }, mode, name, name, "");
      const isObjectBody = e.ts.startsWith("{");
      const typeDecl = isObjectBody
        ? `export interface ${ident} ${e.ts}`
        : `export type ${ident} = ${e.ts};`;
      blocks.push(
        `${doc}${typeDecl}\n\n${doc}export const ${ident}Schema: z.ZodType<${ident}> = ${e.zod};`,
      );
    }

    // Операции.
    const opBlocks: string[] = [];
    const opEntries: string[] = [];
    const opIds = new Set<string>();
    const paths = Object.keys(this.spec.paths).sort();
    for (const path of paths) {
      const methods = Object.keys(this.spec.paths[path]).sort();
      for (const method of methods) {
        const op = this.spec.paths[path][method];
        const METHOD = method.toUpperCase();
        const id = operationId(method, path);
        if (opIds.has(id)) throw new Error(`Operation id collision: ${id}`);
        opIds.add(id);
        const params: Parameter[] = op.parameters ?? [];
        const pathParams = params.filter((x) => x.in === "path").map((x) => x.name);
        for (const name of pathParams) {
          if (!path.includes(`{${name}}`)) throw new Error(`Path param ${name} not in ${path}`);
        }
        const queryParams = params.filter((x) => x.in === "query");
        const bodyParam = params.find((x) => x.in === "body");
        for (const x of params) {
          if (!["query", "path", "body"].includes(x.in)) {
            throw new Error(`Unsupported parameter location ${x.in} in ${METHOD} ${path}`);
          }
          if (x.type === "array" && x.collectionFormat && x.collectionFormat !== "csv") {
            throw new Error(
              `Unsupported collectionFormat ${x.collectionFormat} in ${METHOD} ${path}`,
            );
          }
        }

        let queryRef = "undefined";
        if (queryParams.length > 0) {
          const queryIdent = `${upperFirst(id)}Query`;
          const props: string[] = [];
          const tsProps: string[] = [];
          for (const x of queryParams) {
            const e = this.node(
              x as SchemaNode,
              "request",
              `${METHOD} ${path} query:${x.name}`,
              `query:${x.name}`,
              "  ",
            );
            const doc = jsdoc(propertyDoc(x as SchemaNode), "  ");
            if (x.required) {
              props.push(`${doc}  ${key(x.name)}: ${e.zod},`);
              tsProps.push(`${doc}  ${key(x.name)}: ${e.ts};`);
            } else {
              props.push(`${doc}  ${key(x.name)}: ${e.zod}.nullish(),`);
              tsProps.push(`${doc}  ${key(x.name)}?: ${e.ts} | null;`);
            }
          }
          const doc = jsdoc([`Query-параметры \`${METHOD} ${path}\``], "");
          opBlocks.push(
            `${doc}export interface ${queryIdent} {\n${tsProps.join("\n")}\n}\n\n${doc}export const ${queryIdent}Schema: z.ZodType<${queryIdent}> = z.object({\n${props.join("\n")}\n});`,
          );
          queryRef = `${queryIdent}Schema`;
        }

        let bodyRef = "undefined";
        if (bodyParam) {
          const ref = bodyParam.schema?.$ref;
          if (!ref) throw new Error(`Inline body schema is not supported in ${METHOD} ${path}`);
          bodyRef = `${this.idents[this.refName(ref)]}Schema`;
        }

        const success = Object.keys(op.responses ?? {})
          .filter((c) => /^2\d\d$/.test(c))
          .sort();
        if (success.length !== 1) throw new Error(`Expected one 2xx response in ${METHOD} ${path}`);
        const status = Number(success[0]);
        const schema: SchemaNode | undefined = op.responses[success[0]].schema;
        let responseRef = "null";
        if (schema) {
          if (!schema.$ref)
            throw new Error(`Inline response schema is not supported in ${METHOD} ${path}`);
          responseRef = `${this.idents[this.refName(schema.$ref)]}Schema`;
          if (schema["x-nullable"]) responseRef += ".nullable()";
        }

        const description = `${op.description ?? ""} ${op.summary ?? ""}`;
        const rate = /Rate limit:\s*(\d+)\s*req\/s/i.exec(description);
        const rateLimit = rate ? Number(rate[1]) : undefined;

        const entry = [
          `method: ${str(METHOD)}`,
          `path: ${str(path)}`,
          `pathParams: ${str(pathParams)}`,
          `query: ${queryRef}`,
          `body: ${bodyRef}`,
          `response: ${responseRef}`,
          `successStatus: ${status}`,
          `rateLimit: ${rateLimit ?? "undefined"}`,
        ];
        opEntries.push(
          `${jsdoc([op.summary ?? `${METHOD} ${path}`], "  ")}  ${id}: {\n${entry.map((l) => `    ${l},`).join("\n")}\n  },`,
        );
      }
    }

    for (const k of Object.keys(this.overrides.inlineEnums)) {
      if (!this.usedInlineKeys.has(k)) throw new Error(`Unused inlineEnums override: ${k}`);
    }

    // Enum'ы.
    const enumBlocks: string[] = [];
    for (const def of [...this.enums.values()].sort((a, b) => a.name.localeCompare(b.name))) {
      const memberOverrides = this.overrides.enumMembers[def.name] ?? {};
      const used = new Set<string>();
      const members = def.values.map((value) => {
        const member = memberOverrides[value] ?? pascal(value);
        if (!member || used.has(member))
          throw new Error(`Enum ${def.name}: bad member for ${value}`);
        used.add(member);
        return `  ${key(member)}: ${str(value)},`;
      });
      for (const value of Object.keys(memberOverrides)) {
        if (!def.values.includes(value))
          throw new Error(`enumMembers ${def.name}: unknown ${value}`);
      }
      const doc = jsdoc([`\`${def.source}\``, ...(def.description ? [def.description] : [])], "");
      enumBlocks.push(
        `${doc}export const ${def.name} = {\n${members.join("\n")}\n} as const;\nexport type ${def.name} = (typeof ${def.name})[keyof typeof ${def.name}];\nexport const ${def.name}Schema = z.enum(${def.name});`,
      );
    }
    for (const name of Object.keys(this.overrides.enumMembers)) {
      if (!this.enums.has(name)) throw new Error(`enumMembers: unknown enum ${name}`);
    }

    // Фиксированный глобальный лимит был в спеке до подписок; теперь лимит задаёт тариф ключа.
    const description: string = this.spec.info?.description ?? "";
    const globalRate = /global limit of\s*(\d+)\s*req\/s/i.exec(description);
    if (!globalRate && !/max_rps of your subscription plan/i.test(description)) {
      throw new Error("Rate limit model not found in info.description");
    }

    const definitionMap = Object.keys(this.defs)
      .sort()
      .map((name) => `  ${str(name)}: ${this.idents[name]}Schema,`);

    return [
      "// Сгенерировано scripts/generate.ts из spec/partners.swagger.json и spec/overrides.ts.",
      "// Не редактировать вручную: `npm run generate`.",
      "",
      'import { z } from "zod";',
      "",
      "/** Строка из известного набора значений, но в ответах принимается и любое новое значение. */",
      "function openEnum<T extends string>(): z.ZodType<T | (string & {})> {",
      "  return z.string() as z.ZodType<T | (string & {})>;",
      "}",
      "",
      "function exactlyOneOf(fields: string[]) {",
      "  return (value: Record<string, unknown>) =>",
      "    fields.filter((f) => value[f] !== undefined && value[f] !== null).length === 1;",
      "}",
      "",
      `/** Версия спеки: \`info.version\`. */`,
      `export const SPEC_VERSION = ${str(this.spec.info?.version ?? "")};`,
      "",
      "/** Глобальный лимит из описания спеки, req/s на токен; `null` — лимит задаёт тариф ключа. */",
      `export const GLOBAL_RATE_LIMIT: number | null = ${globalRate ? Number(globalRate[1]) : "null"};`,
      "",
      "// ── Enums ──",
      "",
      enumBlocks.join("\n\n"),
      "",
      "// ── Definitions ──",
      "",
      blocks.join("\n\n"),
      "",
      "// ── Operations ──",
      "",
      opBlocks.join("\n\n"),
      "",
      "/** Все операции спеки: метод, путь, схемы запроса и ответа, лимит из описания. */",
      `export const operations = {\n${opEntries.join("\n")}\n} as const;`,
      "",
      "export type OperationId = keyof typeof operations;",
      "",
      "/** Схема каждого определения спеки по его исходному имени. */",
      `export const definitionSchemas: Record<string, z.ZodType> = {\n${definitionMap.join("\n")}\n};`,
      "",
    ].join("\n");
  }
}

export function generate(
  spec: Json = JSON.parse(readFileSync(SPEC_PATH, "utf8")),
  overrides: SpecOverrides = defaultOverrides,
): string {
  const patched = applyPatches(spec, overrides.patches);
  return new Generator(patched, overrides).run();
}

export { definitionIdentifiers as identifiersFor, operationId };

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const output = generate();
  if (process.argv.includes("--check")) {
    const current = (() => {
      try {
        return readFileSync(OUTPUT_PATH, "utf8");
      } catch {
        return "";
      }
    })();
    if (current !== output) {
      console.error("src/generated.ts is stale: run `npm run generate`");
      process.exit(1);
    }
    console.log("src/generated.ts is up to date");
  } else {
    writeFileSync(OUTPUT_PATH, output);
    console.log(`Wrote ${OUTPUT_PATH}`);
  }
}
