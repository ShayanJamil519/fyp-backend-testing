import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    RuserName: { type: String, required: true },
    timeOfReply: { type: Date, default: Date.now },
    content: { type: String, required: true } ,
    rAvatar: { type: String, required: true },
});


const threadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  title: { type: String, required: true },
  tcontent: { type: String, required: true },
  replies: [ReplySchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number},
  avatar: { type: String, required: true },
  views: { type: Number, default: 0 },
  viewsLog: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, timestamp: { type: Date, default: Date.now } }],
  
});

export default mongoose.model("Thread", threadSchema);

