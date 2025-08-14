import { useEffect, useRef, useState } from "react";
import { Status } from "./types/KlleonSDK";
import type { AvatarProps, ChatProps } from "./types/KlleonSDK";

const SDK_KEY = import.meta.env.VITE_API_KEY;
const AVATAR_ID = import.meta.env.VITE_API_Model;

function App() {
  // 추가 기능을 위한 상태들
  const [message, setMessage] = useState("");
  const [echoMessage, setEchoMessage] = useState("");
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [status, setStatus] = useState<Status>("IDLE");
  const [echoMessages, _setEchoMessages] = useState<string[]>([]);
  const [currentEchoIndex, setCurrentEchoIndex] = useState(0);
  const [chatHistory, _setChatHistory] = useState<
    { type: "user" | "avatar" | "echo"; message: string; time: string }[]
  >([]);

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

    // 아바타 설정
    if (avatarRef.current) {
      avatarRef.current.videoStyle = {
        borderRadius: "30px",
        objectFit: "cover",
      };
      avatarRef.current.volume = 100;
    }

    // 채팅 설정
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

  const echo = () => {
    const { KlleonChat } = window;
    if (echoMessages.length > 0) {
      const messageToEcho = echoMessages[currentEchoIndex];
      console.log(
        `에코 실행: [${currentEchoIndex + 1}/${
          echoMessages.length
        }] ${messageToEcho}`
      );

      KlleonChat.echo(messageToEcho);

      // 다음 인덱스로 이동 (마지막이면 처음으로)
      setCurrentEchoIndex((prev) =>
        prev + 1 >= echoMessages.length ? 0 : prev + 1
      );
    } else {
      console.log("에코 메시지가 아직 로드되지 않았습니다.");
    }
  };

  const stopSpeech = () => {
    const { KlleonChat } = window;
    KlleonChat.stopSpeech();
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
            <br />
            에코:{" "}
            {echoMessages.length > 0
              ? `${currentEchoIndex + 1}/${echoMessages.length} - "${
                  echoMessages[currentEchoIndex]
                }"`
              : "로딩중..."}
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

          {/* 에코 기능 */}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              placeholder="읽어줄 텍스트 입력 (AI 응답 없이 그대로 읽기)"
              value={echoMessage}
              disabled={isAvatarSpeaking}
              onChange={(e) => setEchoMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  echo();
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
              onClick={echo}
              disabled={isAvatarSpeaking || !echoMessage.trim()}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                background: "#6f42c1",
                color: "white",
                cursor:
                  isAvatarSpeaking || !echoMessage.trim()
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              읽기만
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

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#f8f9fa",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* 커스텀 채팅 헤더 */}
        <div
          style={{
            padding: "12px 16px",
            background: "#007bff",
            color: "white",
            fontWeight: "bold",
          }}
        >
          채팅 기록
        </div>

        {/* 커스텀 채팅 내용 */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                maxWidth: "80%",
                alignSelf: chat.type === "user" ? "flex-end" : "flex-start",
                background:
                  chat.type === "user"
                    ? "#007bff"
                    : chat.type === "echo"
                    ? "#6f42c1"
                    : "#e9ecef",
                color:
                  chat.type === "user" || chat.type === "echo"
                    ? "white"
                    : "black",
              }}
            >
              <div style={{ fontSize: "14px" }}>{chat.message}</div>
              <div
                style={{
                  fontSize: "10px",
                  opacity: 0.7,
                  marginTop: "4px",
                }}
              >
                {chat.time}
              </div>
            </div>
          ))}
        </div>

        {/* SDK 채팅 컨테이너 숨김 */}
        <chat-container
          ref={chatRef}
          style={{ display: "none" }}
          class="rounded-3xl"
        ></chat-container>
      </div>
    </div>
  );
}

export default App;
