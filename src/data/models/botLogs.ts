import mongoose from 'mongoose';

const botLogSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true
    },
    coin_id: {
        type: String,
        required: true,
    },
    exchange: {
        type: String,
        required: true
    },
    action: String,
    message: String,
    info: {
        type: String,
        get: function(data: any) {
            try { 
                return JSON.parse(data);
            } catch(error) {
                return data;
            }
        },
        set: function(data: any) {
            return JSON.stringify(data);
        }
    }
});

const botLogModel = mongoose.model('botLog', botLogSchema);

export { botLogModel }