import Link from "next/link";
import { DEFAULT_LANG } from "@/lib/i18n";

export const metadata = {
  robots: { index: false },
};

/**
 * 정적 내보내기에서는 서버 리다이렉트가 없으므로 meta refresh로 기본 언어에 보낸다.
 * (호스팅 쪽 리다이렉트 규칙을 붙이면 이 페이지는 필요 없어진다.)
 */
export default function Root() {
  const target = `/${DEFAULT_LANG}/`;
  return (
    <html lang={DEFAULT_LANG}>
      <head>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
      </head>
      <body>
        <Link href={target}>반도체 사이클 지수 · Korea Semiconductor Cycle Index</Link>
      </body>
    </html>
  );
}
