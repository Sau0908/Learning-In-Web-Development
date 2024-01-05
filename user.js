import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Table, Container, Form, Button } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { AiOutlineMessage } from "react-icons/ai";
import { toast } from "react-toastify";

const User = () => {
  const [users, setUsers] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [veiwMessage, setVeiwMessage] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setLoggedInUserId(decodedToken.id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/users");
        const fetchedUsers = response.data;
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      if (userId !== loggedInUserId) {
        console.log("You are not authorized to delete this user");
        toast.error(" Not authorized to delete this user");
        return;
      }
      await axios.delete(`http://localhost:5000/users/${userId}`);
      const updatedUsers = users.filter((user) => user._id !== userId);
      setUsers(updatedUsers);
      console.log(`User with ID ${userId} deleted successfully`);
      toast.success("User Deleted Successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleAddMessage = async (userId) => {
    try {
      if (userId !== loggedInUserId) {
        console.log("You are not authorized to add a message for this user");
        toast.error(" Not authorized to View this user Record");
        return;
      }
      setSelectedUserId(userId); // Set selected user ID for adding message
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  const sendMessage = async () => {
    try {
      // Make sure a message is entered
      if (!messageInput) {
        console.log("Message cannot be empty");
        toast.error("Message cannot be empty");
        return;
      }

      // Send message to the backend
      await axios.post("http://localhost:5000/users/addmessages", {
        userId: selectedUserId,
        message: messageInput,
      });

      // Clear input and reset selected user ID
      setMessageInput("");
      setSelectedUserId("");
      console.log(
        `Message sent successfully for user with ID ${selectedUserId}`
      );
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4">User List</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Date of Birth</th>
            <th>Personal Record</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user._id}
              style={{
                margin: "4px",
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
              }}
            >
              <td>{index + 1}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.dateOfBirth.split("T")[0]}</td>
              <td>
                {user._id === loggedInUserId && selectedUserId === user._id ? (
                  <div>
                    <Form.Control
                      type="text"
                      placeholder="Enter message"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <Button
                      variant="primary"
                      className="m-2"
                      onClick={sendMessage}
                    >
                      Send
                    </Button>
                  </div>
                ) : (
                  <AiOutlineMessage
                    onClick={() => handleAddMessage(user._id)}
                    style={{ cursor: "pointer" }}
                  />
                )}
              </td>
              <td>
                <BsTrash
                  onClick={() => handleDelete(user._id)}
                  style={{ cursor: "pointer" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default User;
