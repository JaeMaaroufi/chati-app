import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { RiEdit2Line } from "react-icons/ri";

import { TiDeleteOutline } from "react-icons/ti";

import { FaRegCheckSquare } from "react-icons/fa";

function App() {
  const [chatList, setChatList] = useState([]);
  const [newUserName, setNewUserName] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [msgError, setMsgError] = useState("");
  const [editedMessages, setEditedMessages] = useState({});
  const textareaRef = useRef(null);

  const getAllChat = async () => {
    try {
      const res = await axios.get("http://localhost:1000/chats");
      const data = res.data.chatList;
      setChatList(data);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleSearch = async (username) => {
    try {
      if (!username) {
        getAllChat();
        return;
      }
      const res = await axios.get(`http://localhost:1000/chats/${username}`);
      setChatList([res.data]);
    } catch (error) {
      console.log("Error fetching chat:", error);
    }
  };

  const handlePost = async () => {
    if (!newUserName.trim() || !newMsg.trim()) {
      setUserNameError("Username is required");
      setMsgError("Message is required");
      return;
    }

    try {
      const res = await axios.post("http://localhost:1000/chats", {
        username: newUserName,
        text: newMsg,
      });
      const data = res.data.chatList;
      setChatList(data);
      setNewUserName("");
      setNewMsg("");
    } catch (error) {
      console.log("Error posting message:", error);
    }
  };

  const handleDelete = async (listID) => {
    try {
      await axios.delete(`http://localhost:1000/chats/${listID}`);
      getAllChat();
    } catch (error) {
      console.log("Error deleting message:", error);
    }
  };

  const handleEdit = async (chatId) => {
    try {
      const editedText = editedMessages[chatId];
      await axios.put(`http://localhost:1000/chats/${chatId}`, {
        text: editedText,
      });

      const updatedChatList = chatList.map((chat) =>
        chat.id === chatId ? { ...chat, text: editedText } : chat
      );

      setChatList(updatedChatList);
      setEditedMessages({ ...editedMessages, [chatId]: "" });
    } catch (error) {
      console.log("Error editing message:", error);
    }
  };

  useEffect(() => {
    getAllChat();
  }, []);

  const handleNewUserName = (event) => {
    setNewUserName(event.target.value);
    setUserNameError("");
  };

  const handleNewMsg = (event) => {
    setNewMsg(event.target.value);
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    setMsgError("");
  };

  const handleSearchInput = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSendByEnter = (event) => {
    if (event.keyCode === 13) {
      handleSearch(searchValue);
    }
  };

  const handleInputChange = (event, chatId) => {
    setEditedMessages({ ...editedMessages, [chatId]: event.target.value });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handlePost();
  };

  return (
    <div className="bg-gray-800 flex flex-col gap-10 h-full p-5 md:p-10">
      <nav className="flex items-center md:justify-center lg:justify-start gap-4">
        <input
          type="text"
          placeholder="Search by username..."
          className="border border-black p-2 rounded"
          onChange={handleSearchInput}
          onKeyDown={handleSendByEnter}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => handleSearch(searchValue)}
        >
          Search
        </button>
      </nav>
      {chatList.map((chat) => (
        <div key={chat.id} className="bg-white p-4 rounded-lg shadow-md">
          <div>
            <h1 className="text-lg font-bold">{chat.username}</h1>
            <p className="my-2">
              {!editedMessages[chat.id] ? (
                chat.text
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    className="border-[2px] w-full px-4 py-2 rounded-xl focus:outline-none transition duration-1000  focus:border-gray-800"
                    value={editedMessages[chat.id]}
                    onChange={(e) => handleInputChange(e, chat.id)}
                  />
                </div>
              )}
            </p>
          </div>
          <div className="flex gap-3 items-center mt-2">
            <TiDeleteOutline
              className="text-gray-800 size-8 hover:text-red-700 cursor-pointer"
              onClick={() => handleDelete(chat.id)}
            />
            {!editedMessages[chat.id] ? (
              <div>
                <RiEdit2Line
                  className="text-gray-800 size-7 hover:text-emerald-500 cursor-pointer"
                  onClick={() =>
                    setEditedMessages({
                      ...editedMessages,
                      [chat.id]: chat.text,
                    })
                  }
                />
              </div>
            ) : (
              <FaRegCheckSquare
                className="text-gray-800 size-6 hover:text-emerald-500 cursor-pointer"
                onClick={() => handleEdit(chat.id)}
              />
            )}
          </div>
        </div>
      ))}
      <form onSubmit={handleFormSubmit}>
        <label className="block text-white pb-1">Username:</label>
        <input
          type="text"
          className="w-full border border-black p-2 rounded placeholder:text-sm"
          value={newUserName}
          onChange={handleNewUserName}
          required
          placeholder="username"
        />
        {userNameError && (
          <span className="block text-red-500 mt-2">{userNameError}</span>
        )}
        <label className="block mt-4 text-white pb-1">Message:</label>
        <textarea
          ref={textareaRef}
          className="w-full h-20 border border-black p-2 rounded placeholder:text-sm"
          value={newMsg}
          onChange={handleNewMsg}
          placeholder="Message..."
        ></textarea>
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          onClick={handlePost}
        >
          Post
        </button>
        {msgError && <span className="text-red-500 ml-5">{msgError}</span>}
      </form>
    </div>
  );
}

export default App;
