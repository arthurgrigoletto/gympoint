import { Router } from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';

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
 * Checkins
 */
routes.get('/students/:id/checkins', CheckinController.index);
routes.post('/students/:id/checkins', CheckinController.store);

/**
 * Help Orders
 */
routes.get('/help-orders', HelpOrderController.index);
routes.post('/help-orders/:id/answer', HelpOrderController.answer);
routes.get(
  '/students/:id/help-orders',
  HelpOrderController.getHelpOrdersByStudent
);
routes.post('/students/:id/help-orders', HelpOrderController.store);

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
  RegistrationController.update
);
routes.delete('/registrations/:id', RegistrationController.destroy);

export default routes;
