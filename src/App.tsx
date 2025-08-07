import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

declare global {
  interface Window {
    KlleonChat: any;
  }
}

function App() {
  const [count, setCount] = useState(0);
  const [sdkReady, setSdkReady] = useState(false);
  useEffect(() => {
    const checkSDK = () => {
      if (window.KlleonChat) {
        console.log("✅ KlleonChat SDK 로드 완료:", window.KlleonChat);
        setSdkReady(true);
      } else {
        console.warn(
          "⏳ KlleonChat SDK가 아직 로드되지 않았습니다. 재시도 중..."
        );
      }
    };
    checkSDK();
  }, []);
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
