"use client";

import { useEffect, useState } from "react";
import { createDataItemSigner, message as AOMessage, result } from "@permaweb/aoconnect";
import axios from "axios";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";

type Message = {
  msgtype: "Message" | "Image" | "Feed",
  url: string,
  data: string;
  from: string;
  timestamp: number;
}

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    "msgtype": "Message",
    "url": "url",
    "data": "Data",
    "from": "Self",
    "timestamp": 0
  }]);

  const displayMessages = messages.slice(1).map((message, index) => (
    <div key={index}>
      {message.msgtype === "Message" ? (
      <div>
        <p>{message.from}</p>
        <p>{message.data}</p>
        <p>{message.timestamp}</p>
      </div>
    ) : message.msgtype === "Image" ? (
      <div>
        <Image src={`https://api.liteseed.xyz/data/${message.url}`} alt="image" width={100} height={100} />
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
              { name: 'Action', value: 'Get-Latest-Message' },
              { name: 'LatestTimeStamp', value: String(messages[messages.length - 1].timestamp) }
            ]
          });
          
          let { Messages } = await result({
            message: msg,
            process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
          });

          if (Messages.length === 0) { return; }

          if (Messages[0].Data === "Up to date") { return; }
          else {
            const tags = Messages[0].Tags;
            const newMessage = {
              "from": tags[9].value,
              "data": tags[6].value,
              "timestamp": tags[10].value,
              "msgtype": tags[7].value,
              "url": tags[8].value
            }
            setMessages(prevMessages => [...prevMessages, newMessage]);
          }
      } catch (error) {
        console.error('Error fetching data:', error);
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
  }
  
  async function disconnectWallet() {
    await window.arweaveWallet.disconnect();
    localStorage.setItem("walletConnected", "false");
  }

  const handleInputChange = (event:any) => {
    setInputValue(event.target.value);
    setMessage(event.target.value);
  };

  const sendImage = async () => {
    if (localStorage.getItem("walletConnected") === "false") {
      alert("Please connect your wallet to proceed");
    }
    else {
      try {
        const signer = createDataItemSigner(window.arweaveWallet);
        const formData = new FormData();

        if (file) {
          formData.append('file', file);
        } else {
          alert("No file selected");
          return;
        }
        
        const { data } = await axios.post('https://api.liteseed.xyz/data', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const msg = await AOMessage({
          process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
          data: message,
          signer,
          tags: [
            { name: 'Action', value: 'Broadcast' },
            { name: 'msgtype', value: 'Image' },
            { name: 'url', value: data.id }
          ]
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  const sendMessage = async () => {
    if (localStorage.getItem("walletConnected") === "false") {
      alert("Please connect your wallet to proceed");
    }
    else if (inputValue === "") {
      alert("Please enter a message");
    }
    else {
      try {
        const signer = createDataItemSigner(window.arweaveWallet);
        const msg = await AOMessage({
          process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
          data: message,
          signer,
          tags: [
            { name: 'Action', value: 'Broadcast' },
            { name: 'msgtype', value: 'Message' },
            { name: 'url', value: 'no-url' }
          ]
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  const register = async () => {
    if (localStorage.getItem("walletConnected") === "false") {
      alert("Please connect your wallet to proceed");
    }
    else if (inputValue === "") {
      alert("Please enter a message");
    }
    else {
      try {
        const signer = createDataItemSigner(window.arweaveWallet);
        const msg = await AOMessage({
          process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
          signer,
          tags: [
            { name: 'Action', value: 'Register' }
          ]
        });
        
        let { Messages } = await result({
          message: msg,
          process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  const getPriceFeed = async () => {
    try {
      const signer = createDataItemSigner(window.arweaveWallet);
      const msg = await AOMessage({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        signer,
        tags: [
            { name: 'Action', value: 'Get-Price' },
            { name: 'Token', value: 'BTC' }
          ]
        });
        
      let { Messages } = await result({
        message: msg,
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
      });

      // console.log(messages[-1])
      const newMessage: Message = {
        "from": "from",
        "data": Messages[0].Data,
        "timestamp": messages[messages.length - 1].timestamp + 1,
        "msgtype": "Feed",
        "url": "no-url",
      }

      setMessages(prevMessages => [...prevMessages, newMessage]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  const getNewsFeed = async () => {
    try {
      const signer = createDataItemSigner(window.arweaveWallet);
      const msg = await AOMessage({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        signer,
        tags: [
            { name: 'Action', value: 'Get-News' },
          ]
        });

        let { Messages } = await result({
          message: msg,
          process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        });

        const newMessage: Message = {
          "from": "from",
          "data": Messages[0].Data,
          "timestamp": messages[messages.length - 1].timestamp + 1,
          "msgtype": "Feed",
          "url": "no-url",
        }
        setMessages(prevMessages => [...prevMessages, newMessage]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function createRoom() {
    try {
      const res = await axios.post(
        'https://api.huddle01.com/api/v1/create-iframe-room',
        {
          title: 'Huddle01-Test',
          roomLocked: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': "FCTEM_VeMwTN2kSootpVN_SIR94SQTwR",
          },
        }
      );
  
      const response = await axios.post(
        'https://api.huddle01.com/api/v1/join-room-token',
        {
            roomId: res.data.data.roomId,
            userType: "host"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // 'x-api-key': process.env.HUDDLE_API_KEY,
            'x-api-key': "FCTEM_VeMwTN2kSootpVN_SIR94SQTwR",
          },
        }
      );

      const signer = createDataItemSigner(window.arweaveWallet);
      const msg = await AOMessage({
        process: "MD76snAyJJICvDt2rhhA68zIjPSIYJDKuyQ19yFiTGE",
        data: message,
        signer,
        tags: [
          { name: 'Action', value: 'Broadcast' },
          { name: 'msgtype', value: 'Message' },
          { name: 'url', value: 'no-url' }
        ]
      });

      router.push(response.data.redirectUrl);
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <div>
        <div className="border-2 w-96 h-96 mb-6 ml-96">
          {displayMessages}
        </div>
        <div className="ml-96">
          <input
            type="text"
            placeholder="Enter a message..."
            className="border-2"
            value={inputValue}
            onChange={handleInputChange}
          />
          <input type="file" onChange={handleFileChange} />
          <button onClick={sendImage}>Upload File</button>
          <button onClick={sendMessage}>Send Message</button>
          <button onClick={register} className="ml-4">Register</button>
          <button onClick={connectWallet} className="ml-4">Connect</button>
          <button onClick={disconnectWallet} className="ml-4">Disconnect</button>
          <button onClick={getPriceFeed} className="ml-4">Get Price</button>
          <button onClick={getNewsFeed} className="ml-4">Get News</button>
          <button onClick={createRoom}>Create Room</button>
        </div>
      </div>
    </div>
  );
} 
