import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  ChatContainer,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import axios from "axios";
import { useState } from "react";
import "./App.css";
import SonicRunningImg from "./assets/sonic-running.gif";
import TitleImg from "./assets/title.png";

interface MessageProps {
  message: string;
  sender: string;
  position: "single" | "first" | "normal" | "last";
  direction: "incoming" | "outgoing";
}

interface RequestFormat {
  model: string;
  messages: { role: string; content: string }[];
}

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

function App() {
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<MessageProps[]>([
    {
      message: "Eu sou o Sonic, e você pode me perguntar qualquer coisa.",
      sender: "ChatGPT",
      position: "first",
      direction: "incoming",
    },
  ]);

  async function handleSend(data: string) {
    const newMessage: MessageProps = {
      message: data,
      sender: "user",
      position: "last",
      direction: "outgoing",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setIsTyping(true);

    await sendMessagesToChatGPT(newMessages);
  }

  function formatMessageToGPT(messages: MessageProps[]) {
    return messages.map((messageObject) => {
      return {
        role: messageObject.sender === "ChatGPT" ? "assistant" : "user",
        content: messageObject.message,
      };
    });
  }

  async function requestToChatGPT(
    dataRequest: RequestFormat,
    messages: MessageProps[]
  ) {
    axios({
      method: "post",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      responseType: "json",
      data: JSON.stringify(dataRequest),
    }).then((response) => {
      const chatgptResponse = response.data.choices[0].message.content;

      setMessages([
        ...messages,
        {
          message: chatgptResponse,
          sender: "ChatGPT",
          direction: "incoming",
          position: "first",
        },
      ]);
      setIsTyping(false);
    });
  }

  async function sendMessagesToChatGPT(messages: MessageProps[]) {
    const messagesFormatted = formatMessageToGPT(messages);

    const systemMessage = {
      role: "system",
      content:
        "Fale como se fosse o Sonic The Hedgehog colocando nova linha quanto tiver ponto final",
    };

    const apiRequestData: RequestFormat = {
      model: "gpt-4o-mini",
      messages: [...messagesFormatted, systemMessage],
    };

    requestToChatGPT(apiRequestData, messages);
  }

  return (
    <>
      <img src={TitleImg} width={"500px"} alt="Título Sonic ChatBot" />
      <div style={{ height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <MessageList
              className="text-left"
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="Sonic esta procurando uma resposta" />
                ) : null
              }
            >
              {}
              {isTyping ? (
                <MessageList.Content>
                  <img
                    className="sonic-running"
                    src={SonicRunningImg}
                    width={"50px"}
                    alt="Sonic correndo"
                  />
                </MessageList.Content>
              ) : (
                messages.map((message, i) => (
                  <Message key={i} model={message} />
                ))
              )}
            </MessageList>
            <MessageInput
              placeholder="Pergunte qualquer coisa para o Sonic"
              attachButton={false}
              onSend={handleSend}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </>
  );
}

export default App;
