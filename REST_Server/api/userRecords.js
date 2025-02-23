import { Router } from 'express';
import { getUserRecords } from '../mongodb.js';

const router = Router();

router.get('/user-records', async (req, res) => {
    try {
        const records = await getUserRecords();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;S