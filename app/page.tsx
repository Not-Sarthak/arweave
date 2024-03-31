"use client";

import { useEffect, useState } from "react";
import {
  createDataItemSigner,
  message as AOMessage,
  result,
} from "@permaweb/aoconnect";
import axios from "axios";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";

type Message = {
  msgtype: "Message" | "Image" | "Feed";
  url: string;
  data: string;
  from: string;
  timestamp: number;
};

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      msgtype: "Message",
      url: "url",
      data: "Data",
      from: "Self",
      timestamp: 0,
    },
  ]);

  const displayMessages = messages.slice(1).map((message, index) => (
    <div key={index} className="p-4">
      {message.msgtype === "Message" ? (
        <div className="flex gap-4">
          <Image src="/profile.svg" width={25} height={25} alt="profile" />
          <div className="flex flex-col border bg-black text-white rounded-xl border-black p-2">
            {/* <p>{message.from}</p> */}
            <p>{message.data}</p>
            {/* <p>{message.timestamp}</p> */}
          </div>
        </div>
      ) : message.msgtype === "Image" ? (
        <div>
          <Image
            src={`https://api.liteseed.xyz/data/${message.url}`}
            alt="image"
            width={100}
            height={100}
          />
        </div>
      ) : (
        <div>
          <p>{message.data}</p>
        </div>
      )}
    </div>
  ));

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const signer = createDataItemSigner(window.arweaveWallet);
        const msg = await AOMessage({
          process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
          signer,
          tags: [
            { name: "Action", value: "Get-Latest-Message" },
            {
              name: "LatestTimeStamp",
              value: String(messages[messages.length - 1].timestamp),
            },
          ],
        });

        let { Messages } = await result({
          message: msg,
          process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        });

        if (Messages.length === 0) {
          return;
        }

        if (Messages[0].Data === "Up to date") {
          return;
        } else {
          const tags = Messages[0].Tags;
          const newMessage = {
            from: tags[9].value,
            data: tags[6].value,
            timestamp: tags[10].value,
            msgtype: tags[7].value,
            url: tags[8].value,
          };
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 1000);
    return () => clearInterval(intervalId);
  }, [messages]);

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  async function connectWallet() {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
    localStorage.setItem("walletConnected", "true");

    try {
      const signer = createDataItemSigner(window.arweaveWallet);
      const msg = await AOMessage({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        signer,
        tags: [{ name: "Action", value: "Register" }],
      });

      let { Messages } = await result({
        message: msg,
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
      });
    } catch (error) {
      console.log(error);
    }
    setConnected(true);
  }

  async function disconnectWallet() {
    await window.arweaveWallet.disconnect();
    localStorage.setItem("walletConnected", "false");
    setConnected(false);
  }

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
    setMessage(event.target.value);
  };

  const sendImage = async () => {
    if (localStorage.getItem("walletConnected") === "false") {
      alert("Please connect your wallet to proceed");
    } else {
      try {
        const signer = createDataItemSigner(window.arweaveWallet);
        const formData = new FormData();

        if (file) {
          formData.append("file", file);
        } else {
          alert("No file selected");
          return;
        }

        const { data } = await axios.post(
          "https://api.liteseed.xyz/data",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const msg = await AOMessage({
          process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
          data: message,
          signer,
          tags: [
            { name: "Action", value: "Broadcast" },
            { name: "msgtype", value: "Image" },
            { name: "url", value: data.id },
          ],
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const sendMessage = async () => {
    if (localStorage.getItem("walletConnected") === "false") {
      alert("Please connect your wallet to proceed");
    } else if (inputValue === "") {
      alert("Please enter a message");
    } else {
      try {
        const signer = createDataItemSigner(window.arweaveWallet);
        const msg = await AOMessage({
          process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
          data: message,
          signer,
          tags: [
            { name: "Action", value: "Broadcast" },
            { name: "msgtype", value: "Message" },
            { name: "url", value: "no-url" },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getPriceFeed = async () => {
    try {
      const signer = createDataItemSigner(window.arweaveWallet);
      const msg = await AOMessage({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        signer,
        tags: [
          { name: "Action", value: "Get-Price" },
          { name: "Token", value: "BTC" },
        ],
      });

      let { Messages } = await result({
        message: msg,
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
      });

      // console.log(messages[-1])
      const newMessage: Message = {
        from: "from",
        data: Messages[0].Data,
        timestamp: messages[messages.length - 1].timestamp + 1,
        msgtype: "Feed",
        url: "no-url",
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getNewsFeed = async () => {
    try {
      const signer = createDataItemSigner(window.arweaveWallet);
      const msg = await AOMessage({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        signer,
        tags: [{ name: "Action", value: "Get-News" }],
      });

      let { Messages } = await result({
        message: msg,
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
      });

      const newMessage: Message = {
        from: "from",
        data: Messages[0].Data,
        timestamp: messages[messages.length - 1].timestamp + 1,
        msgtype: "Feed",
        url: "no-url",
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  async function createRoom() {
    try {
      const res = await axios.post(
        "https://api.huddle01.com/api/v1/create-iframe-room",
        {
          title: "Huddle01-Test",
          roomLocked: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "FCTEM_VeMwTN2kSootpVN_SIR94SQTwR",
          },
        }
      );

      const response = await axios.post(
        "https://api.huddle01.com/api/v1/join-room-token",
        {
          roomId: res.data.data.roomId,
          userType: "host",
        },
        {
          headers: {
            "Content-Type": "application/json",
            // 'x-api-key': process.env.HUDDLE_API_KEY,
            "x-api-key": "FCTEM_VeMwTN2kSootpVN_SIR94SQTwR",
          },
        }
      );

      const signer = createDataItemSigner(window.arweaveWallet);
      const msg = await AOMessage({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        data: message,
        signer,
        tags: [
          { name: "Action", value: "Broadcast" },
          { name: "msgtype", value: "Message" },
          { name: "url", value: "no-url" },
        ],
      });

      router.push(response.data.redirectUrl);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="relative bg-orange-100 h-screen flex flex-col justify-between">
      <div className="flex justify-between p-4">
        <button
          onClick={connected ? disconnectWallet : connectWallet}
          className="w-[132px] h-[43px] p-2.5 bg-red-300 hover:bg-white hover:text-red-300 rounded-lg border border-black justify-center items-center gap-2.5 inline-flex"
        >
          {connected ? "Disconnect" : "Connect"}
        </button>
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={getPriceFeed}
          className="w-36 h-[43px] p-2.5 bg-red-300 hover:bg-white hover:text-red-300 rounded-lg border border-black justify-center items-center gap-2.5 inline-flex"
        >
          Get Price Feeds
        </button>
        <button
          onClick={getNewsFeed}
          className="w-36 h-[43px] p-2.5 bg-red-300 hover:bg-white hover:text-red-300 rounded-lg border border-black justify-center items-center gap-2.5 inline-flex"
        >
          Get News
        </button>
        <button
          onClick={createRoom}
          className="w-36 h-[43px] p-2.5 bg-red-300 hover:bg-white hover:text-red-300 rounded-lg border border-black justify-center items-center gap-2.5 inline-flex"
        >
          Create Room
        </button>
      </div>
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="border-2 w-[800px] h-[500px] bg-white rounded-[46px] border-black flex flex-col overflow-hidden">
          <div className="overflow-y-auto px-4 py-2">{displayMessages}</div>
        </div>
        <div className="flex mt-4">
          <input
            type="text"
            placeholder="Enter a message..."
            className="w-[400px] bg-white rounded-lg border h-10"
            value={inputValue}
            onChange={handleInputChange}
          />
          <input type="file" onChange={handleFileChange} className="" />
          <button
            onClick={sendImage}
            className="inline-flex items-center px-4 py-2 ml-2 bg-red-300 hover:bg-white hover:bg-red-300 text-black border-2 border-black rounded-md shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Upload File
          </button>
          <button
            onClick={sendMessage}
            className="inline-flex items-center px-4 py-2 ml-2 bg-red-300 hover:bg-red-400 text-black border-black border-2 rounded-md shadow-sm"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
