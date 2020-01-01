import Cache from '../../lib/Cache';
import Queue from '../../lib/Queue';

import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';

import PlanCalculateService from '../services/PlanCalculateService';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const cacheKey = `user:${req.userId}:registrations:${page}`;

    const cached = await Cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const registrations = await Registration.findAll({
      attributes: ['id', 'price', 'start_date', 'end_date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    });

    await Cache.set(cacheKey, registrations);

    return res.json(registrations);
  }

  async store(req, res) {
    const { student_id, plan_id, start_date } = req.body;

    const plan = await Plan.findByPk(plan_id);

    const { price, end_date } = await PlanCalculateService.run({
      price: plan.price,
      duration: plan.duration,
      start_date,
    });

    const registration = await Registration.create({
      student_id,
      plan_id,
      price,
      start_date,
      end_date,
    });

    /**
     * Invalidate Cache
     */

    await Cache.invalidatePrefix(`user:${req.userId}:registrations`);

    /**
     * Send email
     */

    const student = await Student.findByPk(student_id);

    await Queue.add('RegistrationMail', { registration, student, plan });

    return res.json(registration);
  }

  /**
   * I didn't pass student id to avoid more than one registration to student
   */
  async update(req, res) {
    const { plan_id, start_date } = req.body;

    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res
        .status(404)
        .json({ error: `Cannot find registration with ID: ${req.params.id}` });
    }

    const plan = await Plan.findByPk(plan_id);

    const { price, end_date } = await PlanCalculateService.run({
      price: plan.price,
      duration: plan.duration,
      start_date,
    });

    await registration.update({
      plan_id,
      price,
      start_date,
      end_date,
    });

    /**
     * Invalidate Cache
     */

    await Cache.invalidatePrefix(`user:${req.userId}:registrations`);

    return res.json(registration);
  }

  async destroy(req, res) {
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(404).json({
        error: `Can not find any registration with ID ${req.params.id}`,
      });
    }

    await registration.destroy();

    /**
     * Invalidate Cache
     */

    await Cache.invalidatePrefix(`user:${req.userId}:registrations`);

    return res.json({ success: true, registration });
  }
}

export default new RegistrationController();
