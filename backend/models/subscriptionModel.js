
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    ipoId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ipo",
        required: true
    },
    shareApplied:{
        type: Number,
    required: [true, "Shares applied is required"],
    min: [1, "At least 1 share must be applied"]
    },
    status: {
        type:String,
        enum: ["Pending", "Approved" ,"Rejected"],
        default:"Pending"
    }
}
,{timestamps : true});

module.exports = mongoose.model("Subscription", subscriptionSchema);