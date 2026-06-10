import Chat from "../models/chat.model.js";

// Get all chats for the logged-in user
export const getChats = async (req, res) => {
    try {
        const userId = req.user._id;

        const chats = await Chat.find({ userIDs: userId })
            .populate({
                path: "users",
                select: "_id username avatar"
            })
            .populate({
                path: "messages",
                select: "-__v"
            })
            .sort({ createdAt: -1 });

        const chatsWithReceiver = chats.map(chat => {
            const receiver = chat.users.find(user => user._id.toString() !== userId.toString());
            return {
                ...chat.toObject(),
                receiver
            };
        });

        res.status(200).json({
            success: true,
            message: "Chats fetched successfully",
            chats: chatsWithReceiver
        });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching chats",
            error: error.message
        });
    }
};

// Get a specific chat with its messages
export const getChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const chatId = req.params.id;

        const chat = await Chat.findOne({ _id: chatId, userIDs: userId })
            .populate({
                path: "messages",
                options: { sort: { createdAt: 1 } }
            });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        if (!chat.seenBy.includes(userId)) {
            chat.seenBy.push(userId);
            await chat.save();
        }

        res.status(200).json({
            success: true,
            message: "Chat fetched successfully",
            chat
        });
    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching chat",
            error: error.message
        });
    }
};

// Create a new chat
export const addChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { receiverId } = req.body;

        if (userId.toString() === receiverId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Cannot create chat with yourself"
            });
        }

        // Check if chat already exists
        const existingChat = await Chat.findOne({
            userIDs: { $all: [userId, receiverId] }
        });

        if (existingChat) {
            return res.status(200).json({
                success: true,
                message: "Chat already exists",
                chat: existingChat
            });
        }

        const newChat = await Chat.create({
            userIDs: [userId, receiverId],
            users: [userId, receiverId],
            seenBy: [userId]
        });

        res.status(201).json({
            success: true,
            message: "Chat created successfully",
            chat: newChat
        });
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({
            success: false,
            message: "Error creating chat",
            error: error.message
        });
    }
};

// Mark chat as read by the user
export const readChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const chatId = req.params.id;

        const chat = await Chat.findOne({ _id: chatId, userIDs: userId });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        if (!chat.seenBy.includes(userId)) {
            chat.seenBy.push(userId);
            await chat.save();
        }

        res.status(200).json({
            success: true,
            message: "Chat marked as read",
            chat
        });
    } catch (error) {
        console.error("Error marking chat as read:", error);
        res.status(500).json({
            success: false,
            message: "Error marking chat as read",
            error: error.message
        });
    }
};
