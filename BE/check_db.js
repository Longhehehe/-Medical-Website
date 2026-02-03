
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './models/product/Product.js';
import { Manufacturer } from './models/manufacturer/Manufacturer.js';

dotenv.config({ path: './BE/.env' });

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find().limit(5).populate('manufacturerId');

        console.log('--- PRODUCT SAMPLES ---');
        products.forEach(p => {
            console.log(`Name: ${p.productName}`);
            console.log(`Brand: ${p.brand}`);
            console.log(`Origin: ${p.origin}`);
            console.log(`Manufacturer (Populated):`, p.manufacturerId);
            console.log('-----------------------');
        });

        const manufacturers = await Manufacturer.find().limit(5);
        console.log('--- MANUFACTURER SAMPLES ---');
        manufacturers.forEach(m => {
            console.log(m);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
