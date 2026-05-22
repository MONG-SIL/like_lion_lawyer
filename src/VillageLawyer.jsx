import React, { useState, useEffect, useMemo, useCallback } from "react";
import { parseApiResponse, isApiSuccess } from "./utils/parseMojApiXml";

const PAGE_SIZE = 50;

function groupByCity(items) {
  return items.reduce((acc, item) => {
    const key = `${item.State}||${item.City}`;
    if (!acc[key]) {
      acc[key] = { state: item.State, city: item.City, villages: [] };
    }
    acc[key].villages.push(item);
    return acc;
  }, {});
}

function DetailRow({ label, value, sub }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="text-sm font-semibold text-slate-800">{value}</dd>
      {sub && <dd className="text-xs text-slate-500">{sub}</dd>}
    </div>
  );
}

function AssignmentDetail({ item, onClose }) {
  if (!item) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-3xl">
          📋
        </div>
        <h3 className="text-lg font-semibold text-slate-700">배정 상세 조회</h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
          왼쪽 목록에서 마을을 선택하면
          <br />
          마을변호사·담당공무원 배정 정보를 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  const location = [item.State, item.City, item.Village].filter(Boolean).join(" ");

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* 상세 헤더 - 위촉지역 */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 text-white">
        <p className="text-xs font-medium tracking-wider text-slate-300 uppercase">
          위촉 지역
        </p>
        <h2 className="mt-1 text-xl font-bold">{location}</h2>
        {item.AreaNote && (
          <p className="mt-2 inline-block rounded-md bg-white/10 px-2 py-1 text-xs text-slate-200">
            {item.AreaNote}
          </p>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-3 text-xs text-slate-300 underline lg:hidden"
          >
            목록으로 돌아가기
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* 마을변호사 */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm text-white">
              ⚖
            </span>
            <h3 className="text-sm font-bold text-slate-800">마을변호사</h3>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-2xl font-bold text-blue-900">
              {item.Attorney || "미배정"}
            </p>
            {item.AttorneyNote ? (
              <p className="mt-2 text-sm text-blue-700/80">{item.AttorneyNote}</p>
            ) : (
              <p className="mt-1 text-xs text-blue-600/60">
                해당 마을에 위촉된 변호사 정보
              </p>
            )}
          </div>
        </section>

        {/* 마을담당공무원 */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm text-white">
              🏛
            </span>
            <h3 className="text-sm font-bold text-slate-800">마을담당공무원</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
              <p className="mb-2 text-xs font-semibold tracking-wide text-emerald-700 uppercase">
                시·군·구 담당
              </p>
              {item.CityPublicServant ? (
                <>
                  <p className="text-lg font-bold text-slate-800">
                    {item.CityPublicServant}
                  </p>
                  {item.CityServDuty && (
                    <p className="mt-1 text-sm text-emerald-700">
                      직책 · {item.CityServDuty}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400">정보 없음</p>
              )}
            </div>

            <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
              <p className="mb-2 text-xs font-semibold tracking-wide text-teal-700 uppercase">
                읍·면·동 담당
              </p>
              {item.VillagePublicServant ? (
                <>
                  <p className="text-lg font-bold text-slate-800">
                    {item.VillagePublicServant}
                  </p>
                  {item.VillageServDuty && (
                    <p className="mt-1 text-sm text-teal-700">
                      직책 · {item.VillageServDuty}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400">정보 없음</p>
              )}
            </div>
          </div>
        </section>

        {/* 전체 필드 요약 */}
        <section className="mt-6 rounded-xl bg-slate-50 p-4">
          <h4 className="mb-2 text-xs font-semibold text-slate-500">
            배정현황 전체 항목
          </h4>
          <dl>
            <DetailRow label="시·도" value={item.State} />
            <DetailRow label="시·군·구" value={item.City} />
            <DetailRow label="읍·면·동" value={item.Village} />
            <DetailRow label="지역 비고" value={item.AreaNote} />
            <DetailRow label="마을변호사" value={item.Attorney} sub={item.AttorneyNote} />
            <DetailRow
              label="시군구 담당공무원"
              value={item.CityPublicServant}
              sub={item.CityServDuty}
            />
            <DetailRow
              label="읍면동 담당공무원"
              value={item.VillagePublicServant}
              sub={item.VillageServDuty}
            />
          </dl>
        </section>
      </div>
    </div>
  );
}

function ListItem({ item, selected, onSelect }) {
  const isSelected =
    selected?.State === item.State &&
    selected?.City === item.City &&
    selected?.Village === item.Village;
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
        isSelected
          ? "border-slate-800 bg-slate-800 text-white shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-medium ${isSelected ? "text-slate-300" : "text-slate-400"}`}
          >
            {item.State} · {item.City}
          </p>
          <p
            className={`mt-0.5 truncate font-semibold ${isSelected ? "text-white" : "text-slate-800"}`}
          >
            {item.Village}
          </p>
          <p
            className={`mt-1 truncate text-sm ${isSelected ? "text-blue-200" : "text-blue-700"}`}
          >
            ⚖ {item.Attorney || "미배정"}
          </p>
        </div>
        <span
          className={`shrink-0 text-lg ${isSelected ? "text-slate-400" : "text-slate-300"}`}
        >
          ›
        </span>
      </div>
    </button>
  );
}

function VillageLawyer() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [selectedState, setSelectedState] = useState("전체");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const fetchData = useCallback(async (page) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      serviceKey: import.meta.env.VITE_API_KEY,
      numOfRows: String(PAGE_SIZE),
      pageNo: String(page),
    });
    const url = `${import.meta.env.VITE_API_URL}/mabyun?${params}`;

    try {
      const response = await fetch(url);
      const text = await response.text();

      console.log("[VillageLawyer] status:", response.status);
      console.log("[VillageLawyer] body (일부):", text.slice(0, 300));

      if (!response.ok) {
        setError(`HTTP ${response.status} ${response.statusText}`);
        return;
      }

      const { meta: apiMeta, items: list, parsed } = parseApiResponse(text);

      console.log("[VillageLawyer] meta:", apiMeta);
      console.log("[VillageLawyer] items count:", list.length);
      console.log("[VillageLawyer] parsed keys:", Object.keys(parsed || {}));

      if (!isApiSuccess(apiMeta.resultCode)) {
        setError(`${apiMeta.resultCode}: ${apiMeta.resultMsg}`);
        return;
      }

      if (list.length === 0) {
        console.warn(
          "[VillageLawyer] items 비어 있음. body.items 구조:",
          parsed?.response?.body?.items ?? parsed?.body?.items,
        );
      }

      setMeta(apiMeta);
      setItems(list);
      setPageNo(page);
      setSelectedItem(list[0] ?? null);
      setMobileShowDetail(false);
    } catch (err) {
      setError(
        String(
          err.response?.data ?? err.response?.statusText ?? err.message,
        ).slice(0, 300),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const stateStats = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      const s = item.State || "기타";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedState !== "전체" && item.State !== selectedState) return false;
      if (!q) return true;
      return [item.State, item.City, item.Village, item.Attorney,
        item.CityPublicServant, item.VillagePublicServant]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, selectedState, search]);

  const cityGroups = useMemo(
    () => Object.values(groupByCity(filteredItems)),
    [filteredItems],
  );

  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedItem(null);
      return;
    }
    const stillVisible = filteredItems.some(
      (i) =>
        i.State === selectedItem?.State &&
        i.City === selectedItem?.City &&
        i.Village === selectedItem?.Village,
    );
    if (!stillVisible) setSelectedItem(filteredItems[0]);
  }, [filteredItems, selectedItem]);

  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.totalCount / PAGE_SIZE))
    : 1;

  const handlePageChange = (next) => {
    if (next < 1 || next > totalPages || next === pageNo) return;
    setSelectedState("전체");
    setSearch("");
    fetchData(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    setMobileShowDetail(true);
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f4f6f9]">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-300 border-t-slate-800" />
        <p className="mt-4 text-slate-600">배정현황 데이터를 조회하고 있습니다</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#f4f6f9] p-8">
        <p className="text-lg font-semibold text-red-600">조회 실패</p>
        <p className="text-center text-sm text-slate-600">{error}</p>
        <button
          type="button"
          onClick={() => fetchData(1)}
          className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm text-white"
        >
          다시 조회
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* 상단 브랜딩 · 목적 안내 */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
                법무부 공공데이터
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 lg:text-3xl">
                마을변호사 · 담당공무원
                <span className="block text-lg font-semibold text-slate-600 lg:inline lg:text-2xl">
                  {" "}
                  지역별 배정현황
                </span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                무변촌·지방소도시·읍면동 단위로 위촉된{" "}
                <strong className="text-slate-700">마을변호사</strong>와{" "}
                <strong className="text-slate-700">마을담당공무원</strong>의
                배정 상세를 조회할 수 있습니다.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  전국 배정
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {(meta?.totalCount ?? 0).toLocaleString()}
                  <span className="text-xs font-normal text-slate-500">건</span>
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-center">
                <p className="text-[10px] font-semibold text-blue-500 uppercase">
                  조회 중
                </p>
                <p className="text-xl font-bold text-blue-900">
                  {filteredItems.length}
                  <span className="text-xs font-normal text-blue-600">건</span>
                </p>
              </div>
            </div>
          </div>

          {/* 역할 안내 */}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-2.5 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white text-xs">
                ⚖
              </span>
              <span className="text-slate-600">
                <strong className="text-blue-900">마을변호사</strong> — 마을 단위
                법률 상담·지원
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-2.5 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white text-xs">
                🏛
              </span>
              <span className="text-slate-600">
                <strong className="text-emerald-900">마을담당공무원</strong> —
                시군구·읍면동 연계 담당
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 검색 · 필터 */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="지역명, 변호사명, 공무원명으로 검색..."
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option value="전체">전체 시·도</option>
              {stateStats.map(({ state, count }) => (
                <option key={state} value={state}>
                  {state} ({count}건)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 본문: 목록 + 상세 */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading && (
          <p className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            페이지 불러오는 중...
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* 배정 목록 */}
          <section
            className={`${mobileShowDetail ? "hidden lg:block" : "block"}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                배정 마을 목록
              </h2>
              <span className="text-xs text-slate-400">
                {pageNo} / {totalPages} 페이지
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="max-h-[calc(100vh-320px)] space-y-4 overflow-y-auto pr-1">
                {cityGroups.map((group) => (
                  <div key={`${group.state}-${group.city}`}>
                    <p className="sticky top-0 z-[1] mb-2 rounded-md bg-[#f4f6f9] py-1 text-xs font-bold text-slate-500">
                      {group.state} · {group.city}
                      <span className="ml-1 font-normal text-slate-400">
                        ({group.villages.length})
                      </span>
                    </p>
                    <div className="space-y-2">
                      {group.villages.map((item, idx) => (
                        <ListItem
                          key={`${item.Village}-${idx}`}
                          item={item}
                          selected={selectedItem}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => handlePageChange(pageNo - 1)}
                disabled={pageNo <= 1 || loading}
                className="text-sm font-medium text-slate-600 disabled:opacity-30"
              >
                ← 이전
              </button>
              <span className="text-xs text-slate-500">
                {(pageNo - 1) * PAGE_SIZE + 1}–
                {Math.min(pageNo * PAGE_SIZE, meta?.totalCount ?? 0)} /{" "}
                {meta?.totalCount?.toLocaleString()}건
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(pageNo + 1)}
                disabled={pageNo >= totalPages || loading}
                className="text-sm font-medium text-slate-600 disabled:opacity-30"
              >
                다음 →
              </button>
            </div>
          </section>

          {/* 상세 패널 */}
          <section
            className={`lg:sticky lg:top-[120px] lg:self-start ${!mobileShowDetail ? "hidden lg:block" : "block"}`}
          >
            <AssignmentDetail
              item={selectedItem}
              onClose={() => setMobileShowDetail(false)}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default VillageLawyer;
