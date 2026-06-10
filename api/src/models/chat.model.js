import mongoose from "mongoose";


const chatSchema = new mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    userIDs: [{ type: mongoose.Schema.Types.ObjectId }], 
    createdAt: { type: Date, default: Date.now },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    lastMessage: { type: String }
  });
  
  
  const Chat= mongoose.model('Chat', chatSchema);

  export default Chat;