import React, { useState } from "react";
import { parseApiResponse, isApiSuccess } from "./utils/parseMojApiXml";

function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [xmlText, setXmlText] = useState("");
  const [jsonPreview, setJsonPreview] = useState(null);
  const [error, setError] = useState(null);
  const [requestUrl, setRequestUrl] = useState("");

  const buildUrl = () => {
    const base = import.meta.env.VITE_API_URL;
    const key = import.meta.env.VITE_API_KEY;
    const params = new URLSearchParams({
      serviceKey: key,
      numOfRows: "5",
      pageNo: "1",
    });
    return `${base}/mabyun?${params.toString()}`;
  };

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setXmlText("");
    setJsonPreview(null);
    setStatus(null);

    const url = buildUrl();
    setRequestUrl(url);
    console.log("[API Test] 최종 요청 URL:", url);

    try {
      const res = await fetch(url);
      console.log("[API Test] 응답 status:", res.status, res.statusText);

      const text = await res.text();
      console.log("[API Test] 응답 body (일부):", text.slice(0, 500));

      setStatus({ code: res.status, ok: res.ok, statusText: res.statusText });
      setXmlText(text);

      if (!res.ok) {
        setError(`HTTP ${res.status} ${res.statusText}`);
        return;
      }

      try {
        const { meta: apiMeta, items, parsed } = parseApiResponse(text);
        setJsonPreview({ meta: apiMeta, itemCount: items.length, parsed });

        if (!isApiSuccess(apiMeta.resultCode)) {
          setError(`${apiMeta.resultCode}: ${apiMeta.resultMsg}`);
        }
      } catch (parseErr) {
        console.warn("[API Test] 파싱 실패:", parseErr);
        setError(parseErr.message);
      }
    } catch (err) {
      console.error("[API Test] fetch 오류:", err);
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-md">
          <h1 className="text-2xl font-bold text-slate-800">
            마을변호사 API 테스트
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Endpoint:{" "}
            <code className="rounded bg-slate-100 px-2 py-0.5 text-xs">
              {import.meta.env.VITE_API_URL}/mabyun
            </code>
          </p>
          <button
            type="button"
            onClick={handleFetch}
            disabled={loading}
            className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "호출 중..." : "API 호출"}
          </button>
        </header>

        {requestUrl && (
          <section className="rounded-2xl bg-white p-5 shadow-md">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">
              최종 요청 URL
            </h2>
            <p className="break-all text-xs text-slate-600">{requestUrl}</p>
          </section>
        )}

        {status && (
          <section className="rounded-2xl bg-white p-5 shadow-md">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">
              응답 상태
            </h2>
            <p
              className={`text-sm font-medium ${status.ok ? "text-emerald-600" : "text-red-600"}`}
            >
              {status.code} {status.statusText}
            </p>
          </section>
        )}

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <h2 className="mb-2 text-sm font-semibold text-red-700">에러</h2>
            <p className="text-sm text-red-600">{error}</p>
          </section>
        )}

        {xmlText && (
          <section className="rounded-2xl bg-white p-5 shadow-md">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">
              응답 XML
            </h2>
            <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-emerald-300">
              {xmlText}
            </pre>
          </section>
        )}

        {jsonPreview && (
          <section className="rounded-2xl bg-white p-5 shadow-md">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">
              XML → JSON 변환 결과
            </h2>
            <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-sky-300">
              {JSON.stringify(jsonPreview, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </div>
  );
}

export default ApiTest;
