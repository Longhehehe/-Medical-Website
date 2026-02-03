import { Manufacturer } from '../models/manufacturer/Manufacturer.js';

export const getAllManufacturers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query.manufacturerName = { $regex: search, $options: 'i' };
        }

        const manufacturers = await Manufacturer.find(query).sort({ manufacturerName: 1 });

        res.status(200).json({
            success: true,
            data: manufacturers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createManufacturer = async (req, res) => {
    try {
        const newManufacturer = new Manufacturer(req.body);
        const savedManufacturer = await newManufacturer.save();
        res.status(201).json(savedManufacturer);
    } catch (error) {
        res.status(500).json(error);
    }
};
