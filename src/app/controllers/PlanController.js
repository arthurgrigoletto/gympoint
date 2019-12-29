import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
    });

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const planExists = await Plan.findOne({ where: { title: req.body.title } });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number().integer(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

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

    return res.json({ destroyed: true, plan });
  }
}

export default new PlanController();
