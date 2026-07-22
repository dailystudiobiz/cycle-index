import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 산출물로 배포한다. 데이터는 매일 파이프라인이 갱신 → 재빌드.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
