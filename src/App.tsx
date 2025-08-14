import { useEffect, useRef, useState } from "react";
import { Status } from "./types/KlleonSDK";
import type { AvatarProps, ChatProps } from "./types/KlleonSDK";
import echoMessagesData from "./data/echoMessages.json";

const SDK_KEY = import.meta.env.VITE_API_KEY;
const AVATAR_ID = import.meta.env.VITE_API_Model;

function App() {
  // 추가 기능을 위한 상태들
  const [message, setMessage] = useState("");
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [status, setStatus] = useState<Status>("IDLE");

  // 에코 메시지 관련 상태
  const [echoMessages] = useState<string[]>(echoMessagesData);
  const [currentEchoIndex, setCurrentEchoIndex] = useState(0);

  // 첫 번째 코드의 ref들
  const avatarRef = useRef<HTMLElement & AvatarProps>(null);
  const chatRef = useRef<HTMLElement & ChatProps>(null);

  // 첫 번째 코드의 자동 초기화 (그대로 유지)
  useEffect(() => {
    const { KlleonChat } = window;

    const init = async () => {
      // 1. Status 이벤트 리스너 등록
      KlleonChat.onStatusEvent((status) => {
        setStatus(status);
        if (status === "VIDEO_CAN_PLAY") {
          console.log("아바타 영상 재생 준비 완료!");
        }
      });

      // 2. Chat 이벤트 리스너 등록
      KlleonChat.onChatEvent((chatData) => {
        console.log("SDK Chat Event:", chatData);

        // 아바타 발화 상태 관리
        if (chatData.chat_type === "PREPARING_RESPONSE") {
          setIsAvatarSpeaking(true);
        }
        if (chatData.chat_type === "RESPONSE_IS_ENDED") {
          setIsAvatarSpeaking(false);
        }
      });

      // 3. SDK 초기화
      await KlleonChat.init({
        sdk_key: SDK_KEY,
        avatar_id: AVATAR_ID,
      });
    };

    init();

    // 첫 번째 코드의 아바타 설정
    if (avatarRef.current) {
      avatarRef.current.videoStyle = {
        borderRadius: "30px",
        objectFit: "cover",
      };
      avatarRef.current.volume = 100;
    }

    // 첫 번째 코드의 채팅 설정
    if (chatRef.current) {
      chatRef.current.delay = 30;
      chatRef.current.type = "text";
      chatRef.current.isShowCount = true;
    }

    return () => {
      KlleonChat.destroy();
    };
  }, []);

  // 추가 기능 핸들러들
  const sendTextMessage = () => {
    const { KlleonChat } = window;
    if (message.trim()) {
      KlleonChat.sendTextMessage(message);
      setMessage("");
    }
  };

  const startStt = () => {
    const { KlleonChat } = window;
    KlleonChat.startStt();
  };

  const endStt = () => {
    const { KlleonChat } = window;
    KlleonChat.endStt();
  };

  // 수정된 에코 함수 - JSON 파일에서 순차적으로 메시지 읽기
  const echo = () => {
    const { KlleonChat } = window;

    if (echoMessages.length > 0) {
      const messageToSpeak = echoMessages[currentEchoIndex];
      KlleonChat.echo(messageToSpeak);

      // 다음 인덱스로 이동 (마지막이면 처음으로 돌아감)
      setCurrentEchoIndex((prevIndex) => (prevIndex + 1) % echoMessages.length);
    }
  };

  const stopSpeech = () => {
    const { KlleonChat } = window;
    KlleonChat.stopSpeech();
  };

  // 에코 인덱스 리셋 함수 (선택사항)
  const resetEchoIndex = () => {
    setCurrentEchoIndex(0);
  };

  return (
    <div
      style={{
        display: "flex",
        width: "600px",
        height: "720px",
        gap: "0px 24px",
      }}
    >
      {/* 첫 번째 코드와 동일한 레이아웃 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <avatar-container
          ref={avatarRef}
          style={{ flex: 1 }}
          class=""
        ></avatar-container>

        {/* 추가 컨트롤 패널 */}
        <div
          style={{
            background: "#f5f5f5",
            padding: "16px",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#666" }}>
            Status: {status} {isAvatarSpeaking && "(발화중)"}
          </div>

          {/* 텍스트 메시지 */}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              placeholder="텍스트 메시지 입력"
              value={message}
              disabled={isAvatarSpeaking}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  sendTextMessage();
                }
              }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            />
            <button
              onClick={sendTextMessage}
              disabled={isAvatarSpeaking || !message.trim()}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                background: "#007bff",
                color: "white",
                cursor:
                  isAvatarSpeaking || !message.trim()
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              전송
            </button>
          </div>

          {/* 음성 메시지 */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={startStt}
              disabled={isAvatarSpeaking}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                background: "#28a745",
                color: "white",
                cursor: isAvatarSpeaking ? "not-allowed" : "pointer",
              }}
            >
              음성 시작
            </button>
            <button
              onClick={endStt}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                background: "#dc3545",
                color: "white",
              }}
            >
              음성 종료
            </button>
          </div>

          {/* 수정된 에코 기능 */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div
              style={{
                flex: 1,
                padding: "8px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#333",
              }}
            >
              다음 메시지: "{echoMessages[currentEchoIndex] || "없음"}" (
              {currentEchoIndex + 1}/{echoMessages.length})
            </div>
            <button
              onClick={echo}
              disabled={isAvatarSpeaking || echoMessages.length === 0}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                background: "#6f42c1",
                color: "white",
                cursor:
                  isAvatarSpeaking || echoMessages.length === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              에코 ({currentEchoIndex + 1}/{echoMessages.length})
            </button>
            <button
              onClick={resetEchoIndex}
              disabled={isAvatarSpeaking}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                background: "#6c757d",
                color: "white",
                cursor: isAvatarSpeaking ? "not-allowed" : "pointer",
              }}
            >
              처음부터
            </button>
          </div>

          {/* 발화 중단 */}
          <button
            onClick={stopSpeech}
            disabled={!isAvatarSpeaking}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              background: isAvatarSpeaking ? "#ffc107" : "#6c757d",
              color: "white",
              cursor: !isAvatarSpeaking ? "not-allowed" : "pointer",
            }}
          >
            발화 중단
          </button>
        </div>
      </div>

      <chat-container
        ref={chatRef}
        style={{ flex: 1 }}
        class="rounded-3xl"
      ></chat-container>
    </div>
  );
}

export default App;
