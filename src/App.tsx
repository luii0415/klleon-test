import { useEffect } from "react";

function App() {
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
        // custom_id: "YOUR_CUSTOM_ID",
        // user_key: "YOUR_USER_KEY",
        // voice_code: "ko_kr",
        // subtitle_code: "ko_kr",
        // voice_tts_speech_speed: 1,
        // enable_microphone: true,
        // log_level: "debug",
      });
    };
    init();
  }, []);

  return <></>;
}

export default App;
