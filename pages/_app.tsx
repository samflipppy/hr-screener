import "../styles/globals.css";
import type { AppProps } from "next/app";
import Sidebar from "../components/Sidebar";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex">
      <Sidebar /> 
      {/* ✅ Main Content Area */}
      <div className="ml-16 sm:ml-60 p-6 w-full min-h-screen transition-all">
        <Component {...pageProps} />
      </div>
    </div>
  );
}
