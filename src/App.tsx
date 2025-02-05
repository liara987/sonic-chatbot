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

import SonicIndisponivelImg from "./assets/sonic-indisponivel.png";
import SonicNoImg from "./assets/sonic-no.gif";
import SonicRunningImg from "./assets/sonic-running.gif";
import TitleImg from "./assets/title.png";

interface MessageModelType {
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
  const [itFail, setItFail] = useState<boolean>(false);

  const [messagesList, setMessagesList] = useState<MessageModelType[]>([
    {
      message: "Eu sou o Sonic, e você pode me perguntar qualquer coisa.",
      sender: "ChatGPT",
      position: "first",
      direction: "incoming",
    },
  ]);

  async function handleSend(data: string) {
    const newMessage: MessageModelType = {
      message: data,
      sender: "user",
      position: "last",
      direction: "outgoing",
    };

    const newMessages = [...messagesList, newMessage];

    setMessagesList(newMessages);
    setIsTyping(true);

    await sendMessagesToChatGPT(newMessages);
  }

  async function sendMessagesToChatGPT(messages: MessageModelType[]) {
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

  function formatMessageToGPT(messages: MessageModelType[]) {
    return messages.map((messageObject) => {
      return {
        role: messageObject.sender === "ChatGPT" ? "assistant" : "user",
        content: messageObject.message,
      };
    });
  }

  async function requestToChatGPT(
    dataRequest: RequestFormat,
    messages: MessageModelType[]
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
    })
      .then((response) => {
        const chatgptResponse = response.data.choices[0].message.content;

        setMessagesList([
          ...messages,
          {
            message: chatgptResponse,
            sender: "ChatGPT",
            direction: "incoming",
            position: "first",
          },
        ]);
        setIsTyping(false);
      })
      .catch((error) => {
        console.error(
          "Erro ao tentar se conectar com a API do ChatGPT: ",
          error
        );
        setItFail(true);
        setIsTyping(false);
      });
  }

  return (
    <>
      <div className="container">
        <div className="chat">
          <img src={TitleImg} className="title" alt="Título Sonic ChatBot" />
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={
                  isTyping ? (
                    <TypingIndicator content="Sonic esta procurando uma resposta" />
                  ) : null
                }
              >
                {itFail ? (
                  <MessageList.Content className="not-available">
                    <img
                      src={SonicNoImg}
                      width={"100%"}
                      alt="Sonic fazendo sinal de não"
                    />
                    <img
                      src={SonicIndisponivelImg}
                      width={"100%"}
                      alt="O sonic esta indisponivel no momento"
                    />
                  </MessageList.Content>
                ) : isTyping ? (
                  <MessageList.Content>
                    {itFail}
                    <img
                      className="sonic-running"
                      src={SonicRunningImg}
                      alt="Sonic correndo"
                    />
                  </MessageList.Content>
                ) : (
                  messagesList.map((message, i) => (
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
      </div>
    </>
  );
}

export default App;
