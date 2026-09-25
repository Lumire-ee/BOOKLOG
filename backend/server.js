import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "booklog-api",
    timestamp: new Date().toISOString(),
  });
});

const { thumbRoute } = await import("./thumbRoute.js");
const { userBookRoute } = await import("./userBookRoute.js");
const { accountRoute } = await import("./accountRoute.js");

app.use("/api", thumbRoute);
app.use("/api", userBookRoute);
app.use("/api", accountRoute);

// 카카오 도서 검색 API 프록시 (네이버 책 검색 API 종료에 따른 대체)
app.get("/api/books", async (req, res) => {
  const query = req.query.query;
  console.log(`[백엔드 /api/books] 검색 요청 수신: query="${query}"`);
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  const kakaoApiKey = process.env.KAKAO_REST_API_KEY;
  if (!kakaoApiKey) {
    console.error("[백엔드 /api/books] KAKAO_REST_API_KEY 미설정 오류");
    return res
      .status(500)
      .json({ error: "KAKAO_REST_API_KEY not loaded from .env" });
  }

  const url = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(
    query,
  )}&size=30&sort=accuracy`;

  const headers = {
    Authorization: `KakaoAK ${kakaoApiKey}`,
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    if (!response.ok) {
      console.error("[백엔드 /api/books] Kakao API error:", data);
      return res.status(response.status).json(data);
    }

    const mappedItems = (data.documents || []).map((doc) => ({
      title: doc.title,
      author: (doc.authors || []).join(", "),
      image: doc.thumbnail || "",
      description: doc.contents || "",
      publisher: doc.publisher || "",
      isbn: doc.isbn || "",
    }));

    console.log(
      `[백엔드 /api/books] 카카오 검색 성공: ${mappedItems.length}건 반환 (총 ${data.meta?.total_count || 0}건)`,
    );
    res.json({ items: mappedItems, total: data.meta?.total_count || 0 });
  } catch (err) {
    console.error("[백엔드 /api/books] Failed to fetch Kakao books:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

const PORT = Number(process.env.PORT ?? 5000);

app.listen(PORT, () => {
  console.log(`BookLog 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
