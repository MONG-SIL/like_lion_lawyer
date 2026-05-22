import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

/** XML 문자열 → JSON 객체 */
export function parseXmlToJson(xmlText) {
  return parser.parse(xmlText);
}

/** API 원본(문자열·객체) → 통일된 parsed 객체 */
export function normalizeApiData(raw) {
  if (raw == null) return null;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("<")) {
      return parseXmlToJson(trimmed);
    }
    if (trimmed.startsWith("{")) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return null;
      }
    }
    return null;
  }

  return raw;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return [];
}

/**
 * 공공데이터 API 응답에서 item 배열 추출
 * - XML: response.body.items.item
 * - JSON(axios 등): body.items.item / body.items.itemList / mojmabyunList
 */
export function extractItems(data) {
  const normalized = normalizeApiData(data) ?? data;
  const body = normalized?.response?.body ?? normalized?.body;
  if (!body) return [];

  const itemsNode = body.items;
  if (!itemsNode) return [];

  // JSON: itemList.mojmabyunList
  if (itemsNode.itemList?.mojmabyunList) {
    return toArray(itemsNode.itemList.mojmabyunList);
  }
  if (itemsNode.mojmabyunList) {
    return toArray(itemsNode.mojmabyunList);
  }

  // XML/JSON 공통: items.item (단일 객체 또는 배열)
  if (itemsNode.item != null) {
    return toArray(itemsNode.item);
  }

  // items.itemList가 배열/객체인 경우
  if (itemsNode.itemList != null) {
    const list = itemsNode.itemList;
    if (list?.item != null) return toArray(list.item);
    return toArray(list);
  }

  return [];
}

export function extractApiMeta(data) {
  const normalized = normalizeApiData(data) ?? data;
  const header = normalized?.response?.header ?? normalized?.header ?? {};
  const body = normalized?.response?.body ?? normalized?.body ?? {};

  return {
    resultCode: String(header.resultCode ?? "").padStart(2, "0"),
    resultMsg: header.resultMsg ?? "",
    totalCount: Number(body.totalCount ?? 0),
    pageNo: Number(body.pageNo ?? 1),
    numOfRows: Number(body.numOfRows ?? 0),
  };
}

export function isApiSuccess(resultCode) {
  return String(resultCode).padStart(2, "0") === "00";
}

/** fetch/axios 공통: 원본 응답 → { meta, items, parsed } */
export function parseApiResponse(raw) {
  const parsed = normalizeApiData(raw) ?? raw;
  return {
    parsed,
    meta: extractApiMeta(parsed),
    items: extractItems(parsed),
  };
}
