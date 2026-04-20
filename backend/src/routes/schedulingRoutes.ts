import express from 'express';
// import {
//   listActiveJobs,
//   stopJob,
//   stopAllJobs,
//   getScheduleInfo,
// } from '../controllers/schedulingController';
// import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// TODO: Fix scheduling service model issues
// // GET /api/scheduling/jobs - Listar jobs ativos
// router.get('/jobs', authMiddleware, listActiveJobs);
//
// // GET /api/scheduling/info - Informações sobre os agendamentos
// router.get('/info', authMiddleware, getScheduleInfo);
//
// // DELETE /api/scheduling/jobs/:jobName - Parar um job específico
// router.delete('/jobs/:jobName', authMiddleware, stopJob);
//
// // DELETE /api/scheduling/jobs - Parar todos os jobs
// router.delete('/jobs', authMiddleware, stopAllJobs);

export default router;
