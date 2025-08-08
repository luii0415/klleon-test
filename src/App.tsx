import { useEffect, useRef, type CSSProperties } from "react";

/* --- Klleon SDK 타입 정의 --- */
type BaseStatus =
  | "IDLE"
  | "CONNECTING"
  | "CONNECTING_FAILED"
  | "SOCKET_CONNECTED"
  | "SOCKET_FAILED"
  | "STREAMING_CONNECTED"
  | "STREAMING_FAILED"
  | "CONNECTED_FINISH"
  | "VIDEO_LOAD"
  | "VIDEO_CAN_PLAY";

type BaseLogLevelType = "debug" | "info" | "warn" | "error" | "silent";
type BaseVoiceCodeType = "ko_kr" | "en_us" | "ja_jp" | "id_id";
type BaseSubtitleCodeType = "ko_kr" | "en_us" | "ja_jp" | "id_id";

enum ResponseChatType {
  TEXT = "TEXT",
  STT_RESULT = "STT_RESULT",
  STT_ERROR = "STT_ERROR",
  WAIT = "WAIT",
  WARN_SUSPENDED = "WARN_SUSPENDED",
  DISABLED_TIME_OUT = "DISABLED_TIME_OUT",
  TEXT_ERROR = "TEXT_ERROR",
  TEXT_MODERATION = "TEXT_MODERATION",
  ERROR = "ERROR",
  PREPARING_RESPONSE = "PREPARING_RESPONSE",
  RESPONSE_IS_ENDED = "RESPONSE_IS_ENDED",
  RESPONSE_OK = "RESPONSE_OK",
  WORKER_DISCONNECTED = "WORKER_DISCONNECTED",
  EXCEED_CONCURRENT_QUOTA = "EXCEED_CONCURRENT_QUOTA",
  START_LONG_WAIT = "START_LONG_WAIT",
  USER_SPEECH_STARTED = "USER_SPEECH_STARTED",
  USER_SPEECH_STOPPED = "USER_SPEECH_STOPPED",
}

export type Status = BaseStatus;
export type LogLevelType = BaseLogLevelType;
export type VoiceCodeType = BaseVoiceCodeType;
export type SubtitleCodeType = BaseSubtitleCodeType;

export interface InitOption {
  sdk_key: string;
  avatar_id: string;
  voice_code?: VoiceCodeType;
  subtitle_code?: SubtitleCodeType;
  voice_tts_speech_speed?: number;
  enable_microphone?: boolean;
  log_level?: LogLevelType;
  custom_id?: string;
  user_key?: string;
}

export interface ChatData {
  message: string;
  chat_type: ResponseChatType;
  time: string;
  id: string;
}

export interface ChangeAvatarOption {
  avatar_id: string;
  subtitle_code?: SubtitleCodeType;
  voice_code?: VoiceCodeType;
  voice_tts_speech_speed?: number; // 0.5 ~ 2.0
}

export interface KlleonChat {
  init: (option: InitOption) => Promise<void>;
  destroy: () => void;
  onChatEvent: (callback: (data: ChatData) => void) => void;
  onStatusEvent: (callback: (status: Status) => void) => void;
  sendTextMessage: (message: string) => void;
  startStt: () => void;
  endStt: () => void;
  cancelStt: () => void;
  echo: (message: string) => void;
  startAudioEcho: (audio: string) => void;
  endAudioEcho: () => void;
  changeAvatar: (option: ChangeAvatarOption) => Promise<void>;
  clearMessageList: () => void;
  stopSpeech: () => void;
}

/* --- 전역 타입 확장 --- */
declare global {
  interface Window {
    KlleonChat: KlleonChat;
  }

  namespace JSX {
    interface IntrinsicElements {
      "avatar-container": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          class?: string;
        },
        HTMLElement
      >;
      "chat-container": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          class?: string;
        },
        HTMLElement
      >;
    }
  }
}

// 모듈 타입으로도 확장
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "avatar-container": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          class?: string;
        },
        HTMLElement
      >;
      "chat-container": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          class?: string;
        },
        HTMLElement
      >;
    }
  }
}

/* --- 컴포넌트 Props --- */
interface AvatarProps {
  videoStyle?: CSSProperties;
  volume?: number;
}

interface ChatProps {
  delay?: number;
  type?: "voice" | "text";
  isShowCount?: boolean;
}

/* --- App 컴포넌트 --- */
function App() {
  const avatarRef = useRef<HTMLElement & AvatarProps>(null);
  const chatRef = useRef<HTMLElement & ChatProps>(null);

  useEffect(() => {
    const { KlleonChat } = window;

    const init = async () => {
      // 1. Status 이벤트 리스너 등록
      KlleonChat.onStatusEvent((status) => {
        // 상세한 Status 값과 의미는 'usage > 이벤트 처리' 문서를 참고하세요.
        if (status === "VIDEO_CAN_PLAY") {
          console.log("아바타 영상 재생 준비 완료!");
        }
      });

      // 2. Chat 이벤트 리스너 등록
      KlleonChat.onChatEvent((chatData) => {
        // 상세한 ChatData 구조와 chat_type은 'usage > 이벤트 처리' 문서를 참고하세요.
        console.log("SDK Chat Event:", chatData);
      });

      // 3. SDK 초기화
      await KlleonChat.init({
        sdk_key: import.meta.env.VITE_API_KEY,
        avatar_id: import.meta.env.VITE_API_Model,
      });
    };

    init();

    if (avatarRef.current) {
      avatarRef.current.videoStyle = {
        borderRadius: "30px",
        objectFit: "cover",
      };
      avatarRef.current.volume = 100;
    }

    if (chatRef.current) {
      chatRef.current.delay = 30;
      chatRef.current.type = "text";
      chatRef.current.isShowCount = true;
    }

    return () => {
      KlleonChat.destroy();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "600px",
        height: "720px",
        gap: "0px 24px",
      }}
    >
      <avatar-container
        ref={avatarRef}
        style={{ flex: 1 }}
        class=""
      ></avatar-container>
      <chat-container
        ref={chatRef}
        style={{ flex: 1 }}
        class="rounded-3xl"
      ></chat-container>
    </div>
  );
}

export default App;
