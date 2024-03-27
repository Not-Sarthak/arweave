"use client";

import { useEffect, useState } from "react";
import { createDataItemSigner, message as AOMessage, result } from "@permaweb/aoconnect";

type Message = {
  data: string;
  from: string;
  timestamp: number;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    "data": "Data",
    "from": "Self",
    "timestamp": 0
  }]);

  const displayMessages = messages.slice(1).map((message, index) => (
  <div key={index}>
    <p>{message.from}</p>
    <p>{message.data}</p>
    <p>{message.timestamp}</p>
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

          if (Messages[0].Data === "Up to date") {;}
          else {
            const tags = Messages[0].Tags;
            const newMessage = {
              "data": tags[7].value,
              "from": tags[6].value,
              "timestamp": tags[8].value
            }
            setMessages(prevMessages => [...prevMessages, newMessage]);
          }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [messages]);

  async function connectWallet() {
    await window.arweaveWallet.connect(["SIGN_TRANSACTION"]);
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
            { name: 'Action', value: 'Broadcast' }
          ]
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  const register = async () => {
    if (!walletConnected) {
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
        
        console.log(Messages[0].Data)
      } catch (error) {
        console.log(error);
      }
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
          <button onClick={sendMessage}>Send Message</button>
          <button onClick={register} className="ml-4">Register</button>
          <button onClick={connectWallet} className="ml-4">Connect</button>
          <button onClick={disconnectWallet} className="ml-4">Disconnect</button>
        </div>
      </div>
    </div>
  );
} 
