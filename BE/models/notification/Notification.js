import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['ORDER', 'TRANSFER', 'BATCH', 'CUSTOMER', 'STAFF', 'PASSWORD', 'SYSTEM'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SaleInvoice' },
        transferId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transfer' },
        batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        link: { type: String } // URL to navigate to
    }
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
