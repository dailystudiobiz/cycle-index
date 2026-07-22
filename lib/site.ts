import type { IndexId } from "./indices";

/** 사이트 전역 상수. 도메인 변경 시 여기만 고치면 된다. */
export const SITE_URL = "https://semicycleindex.com";

/** 지표별 데이터 공개 경로 (방법론 페이지의 "JSON 내려받기") */
export const dataPath = (id: IndexId) => `/data/${id}.json`;
