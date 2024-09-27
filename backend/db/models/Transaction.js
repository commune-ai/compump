import mongoose from 'mongoose';

const TxSchema = new mongoose.Schema({
    txTime: {
        type: Number,
    },
    txHash: {
        type: String
    },
    swap: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    profit: {
        type: Number
    },
    change:{
        type: Number
    },
    blockTime: {
        type: Number
    }
})
const Transaction = mongoose.model('pastTx', TxSchema);
export default Transaction ;