import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "반도체 사이클 지수 · Korea Semiconductor Cycle Index",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
