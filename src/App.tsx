import { useEffect, useRef, useState } from "react";
import { ChatData, ResponseChatType, Status } from "./types/KlleonSDK";
import type { AvatarProps, ChatProps } from "./types/KlleonSDK";

const SDK_KEY = import.meta.env.VITE_API_KEY;
const AVATAR_ID = import.meta.env.VITE_API_Model;

function App() {
  // 두 번째 코드의 상태들
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>("IDLE");
  const [chatData, setChatData] = useState<ChatData[]>([]);
  const [chatType, setChatType] = useState<ResponseChatType>();
  const [message, setMessage] = useState("");
  const [echoMessage, setEchoMessage] = useState("");
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [guideText, setGuideText] = useState(
    "start chat 버튼을 통해 연결해주세요"
  );

  // 첫 번째 코드의 ref들
  const avatarRef = useRef<HTMLElement & AvatarProps>(null);
  const chatRef = useRef<HTMLElement & ChatProps>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 아바타 설정만 하는 useEffect (초기화는 수동으로)
  useEffect(() => {
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
  }, []);

  // 두 번째 코드의 채팅 컨테이너 스크롤 관리
  useEffect(() => {
    if (chatContainerRef.current) {
      const observer = new MutationObserver(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      });

      observer.observe(chatContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }
  }, [chatContainerRef.current]);

  // 두 번째 코드의 핸들러들 (아바타 변경 제외)
  const sdkHandler = {
    startChat: async () => {
      const { KlleonChat } = window;

      KlleonChat.onStatusEvent((status) => {
        console.log("Status changed to:", status);
        setStatus(status);
        setIsLoading(status !== "VIDEO_CAN_PLAY");
      });

      KlleonChat.onChatEvent((chatData) => {
        setChatType(chatData.chat_type);
        setChatData((prev) => [...prev, chatData]);
        if (chatData.chat_type === "PREPARING_RESPONSE") {
          setIsAvatarSpeaking(true);
          setGuideText("아바타가 답변을 준비중입니다. 잠시만 기다려주세요.");
        }
        if (chatData.chat_type === "TEXT") {
          setGuideText(
            "아바타가 발화중입니다. stopSpeech로 취소할 수 있습니다."
          );
        }
        if (chatData.chat_type === "RESPONSE_IS_ENDED") {
          setIsAvatarSpeaking(false);
          setGuideText(
            "아바타가 발화를 완료했습니다. 대화를 계속하려면 메세지를 입력하세요."
          );
        }
      });

      await KlleonChat.init({
        sdk_key: SDK_KEY,
        avatar_id: AVATAR_ID,
      });
      setGuideText("연결이 완료되었습니다.");
    },
    disconnect: () => {
      const { KlleonChat } = window;
      KlleonChat.destroy();
      setGuideText(
        "연결이 해제되었습니다. start chat 버튼을 통해 연결해주세요"
      );
    },
    sendTextMessage: () => {
      const { KlleonChat } = window;
      KlleonChat.sendTextMessage(message);
      setMessage("");
    },
    startStt: () => {
      const { KlleonChat } = window;
      KlleonChat.startStt();
      setGuideText(
        "음성 녹음 중입니다. endStt로 완료하거나 cancelStt로 취소하세요."
      );
    },
    endStt: () => {
      const { KlleonChat } = window;
      KlleonChat.endStt();
      setGuideText("음성 녹음이 종료되었습니다");
    },
    cancelStt: () => {
      const { KlleonChat } = window;
      KlleonChat.cancelStt();
      setGuideText("음성녹음 상태(startStt)가 취소합니다.");
    },
    stopSpeech: () => {
      const { KlleonChat } = window;
      if (chatType === "PREPARING_RESPONSE") {
        setGuideText("아바타 답변 준비중에는 중단할 수 없습니다.");
        return;
      }
      KlleonChat.stopSpeech();
      setGuideText("아바타의 발화를 중단합니다.");
    },
    clearMessage: () => {
      setChatData([]);
    },
    clearMessageList: () => {
      const { KlleonChat } = window;
      KlleonChat.clearMessageList();
    },
    echo: () => {
      const { KlleonChat } = window;
      KlleonChat.echo(echoMessage);
      setEchoMessage("");
    },
  };

  return (
    <div className="custom-react-example-page">
      <div className="klleon-chat-container">
        {/* 첫 번째 코드 방식의 avatar-container */}
        <avatar-container
          ref={avatarRef}
          style={{ flex: 1 }}
          class=""
        ></avatar-container>

        {/* 두 번째 코드의 채팅 컨테이너 */}
        <div
          ref={chatContainerRef}
          className="chat-container"
          style={{
            opacity: status === "VIDEO_CAN_PLAY" ? 1 : 0,
          }}
        >
          {chatData.map((item) => (
            <div className="chat-item" key={item.id}>
              <h5>ChatType: {item.chat_type}</h5>
              <h6>Message: {item.message}</h6>
            </div>
          ))}
        </div>
      </div>

      {/* 두 번째 코드의 컨트롤 UI (아바타 변경 제외) */}
      <div className="control-container">
        <div className="log-container">
          {isLoading && <h5>loading...</h5>}
          <h5>Guide: {guideText}</h5>
          <h5>Status: {status}</h5>
        </div>
        <div className="method-container">
          <div className="horizontal-control-item">
            <label>SDK 라이프사이클: </label>
            <button onClick={sdkHandler.startChat}>start chat</button>
            <button onClick={sdkHandler.disconnect}>disconnect</button>
          </div>
          <div className="horizontal-control-item">
            <label>텍스트 메세지 전송: </label>
            <div className="vertical-control-item">
              <input
                placeholder={
                  isAvatarSpeaking
                    ? "아바타가 발화중입니다. 발화가 종료되면 메세지를 입력해주세요."
                    : "메세지를 입력하세요."
                }
                value={message}
                disabled={isAvatarSpeaking}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    sdkHandler.sendTextMessage();
                  }
                }}
              />
              <button onClick={sdkHandler.sendTextMessage}>
                sendTextMessage
              </button>
            </div>
          </div>
          <div className="horizontal-control-item">
            <label>음성 메세지 전송: </label>
            <button onClick={sdkHandler.startStt}>startStt</button>
            <button onClick={sdkHandler.endStt}>endStt</button>
          </div>
          <div className="horizontal-control-item">
            <label>메세지 제어</label>
            <button onClick={sdkHandler.cancelStt}>cancelStt</button>
            <button onClick={sdkHandler.stopSpeech}>stopSpeech</button>
            <button onClick={sdkHandler.clearMessage}>clearMessage</button>
          </div>
          <div className="horizontal-control-item">
            <label>에코 기능</label>
            <div className="vertical-control-item">
              <input
                placeholder={
                  isAvatarSpeaking
                    ? "아바타가 발화중입니다. 발화가 종료되면 메세지를 입력해주세요."
                    : "메세지를 입력하세요."
                }
                value={echoMessage}
                disabled={isAvatarSpeaking}
                onChange={(e) => setEchoMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    sdkHandler.echo();
                  }
                }}
              />
              <button onClick={sdkHandler.echo}>echo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
