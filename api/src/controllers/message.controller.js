import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

// Add a new message to a chat
export const addMessage = async (req, res) => {
    try {
        const tokenUserId = req.user._id;
        const chatId = req.params.chatId;
        const { text } = req.body;

        // Check if chat exists and user is part of it
        const chat = await Chat.findOne({ _id: chatId, userIDs: tokenUserId });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Create the message
        const message = await Message.create({
            text,
            userId: tokenUserId,
            chat: chatId,
        });

        // Update chat (set last message and seenBy)
        chat.lastMessage = text;
        chat.seenBy = [tokenUserId]; // reset seenBy for others
        chat.messages.push(message._id);
        await chat.save();

        res.status(200).json({
            success: true,
            message: "Message added successfully",
            data: message
        });
    } catch (error) {
        console.error("Error adding message:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add message",
            error: error.message
        });
    }
};
