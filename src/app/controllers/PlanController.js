import Plan from '../models/Plan';

import Cache from '../../lib/Cache';

class PlanController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const cacheKey = `user:${req.userId}:plans:${page}`;

    const cached = await Cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    await Cache.set(cacheKey, plans);

    return res.json(plans);
  }

  async store(req, res) {
    const planExists = await Plan.findOne({ where: { title: req.body.title } });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    /**
     * Invalidate Cache
     */

    await Cache.invalidatePrefix(`user:${req.userId}:plans`);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    const { title: titleToUpdate } = req.body;

    if (titleToUpdate) {
      const studentExists = await Plan.findOne({
        where: { title: titleToUpdate },
      });

      if (studentExists) {
        return res
          .status(400)
          .json({ error: 'Plan with this title already exists' });
      }
    }

    const { id, title, duration, price } = await plan.update(req.body);

    /**
     * Invalidate Cache
     */

    await Cache.invalidatePrefix(`user:${req.userId}:plans`);

    return res.json({ id, title, duration, price });
  }

  async destroy(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res
        .status(400)
        .json({ error: `Could not find a plan with the id ${req.params.id}` });
    }

    await plan.destroy();

    /**
     * Invalidate Cache
     */

    await Cache.invalidatePrefix(`user:${req.userId}:plans`);

    return res.json({ success: true, plan });
  }
}

export default new PlanController();
