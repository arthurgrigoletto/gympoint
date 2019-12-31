import { Router } from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';

import validateUserStore from './app/validations/UserStore';
import validateSessionStore from './app/validations/SessionStore';
import validateStudentStore from './app/validations/StudentStore';
import validateStudentUpdate from './app/validations/StudentUpdate';
import validatePlanStore from './app/validations/PlanStore';
import validatePlanUpdate from './app/validations/PlanUpdate';
import validateRegistrationStore from './app/validations/RegistrationStore';
import validateRegistrationUpdate from './app/validations/RegistrationUpdate';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const bruteForce = new Brute(bruteStore);

routes.post('/users', validateUserStore, UserController.store);
routes.post(
  '/sessions',
  bruteForce.prevent,
  validateSessionStore,
  SessionController.store
);

routes.use(authMiddleware);

/**
 * Students
 */
routes.get('/students', StudentController.index);
routes.post('/students', validateStudentStore, StudentController.store);
routes.put('/students/:id', validateStudentUpdate, StudentController.update);

/**
 * Plans
 */
routes.get('/plans', PlanController.index);
routes.post('/plans', validatePlanStore, PlanController.store);
routes.put('/plans/:id', validatePlanUpdate, PlanController.update);
routes.delete('/plans/:id', PlanController.destroy);

/**
 * Registrations
 */
routes.get('/registrations', RegistrationController.index);
routes.post(
  '/registrations',
  validateRegistrationStore,
  RegistrationController.store
);
routes.put(
  '/registrations/:id',
  validateRegistrationUpdate,
  RegistrationController.store
);
routes.delete('/registrations/:id', RegistrationController.destroy);

export default routes;
