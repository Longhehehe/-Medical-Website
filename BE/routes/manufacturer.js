import express from 'express';
import { getAllManufacturers, createManufacturer } from '../controllers/manufacturerController.js';

const router = express.Router();

router.get('/getAll', getAllManufacturers);
router.post('/create', createManufacturer);

export default router;
