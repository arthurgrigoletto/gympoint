import Student from '../models/Student';

import Cache from '../../lib/Cache';

class StudentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const cacheKey = `user:${req.userId}:students:${page}`;

    const cached = await Cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const students = await Student.findAll({
      order: ['name'],
      attributes: ['id', 'name', 'email', 'idade', 'peso', 'altura'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    await Cache.set(cacheKey, students);

    return res.json(students);
  }

  async store(req, res) {
    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const { id, name, email, idade, peso, altura } = await Student.create(
      req.body
    );

    /**
     * Invalidate Cache
     */

    await Cache.invalidatePrefix(`user:${req.userId}:students`);

    return res.json({
      id,
      name,
      email,
      idade,
      peso,
      altura,
    });
  }

  async update(req, res) {
    const student = await Student.findByPk(req.params.id);

    const { email: emailToUpdate } = req.body;

    if (emailToUpdate) {
      const studentExists = await Student.findOne({
        where: { email: emailToUpdate },
      });

      if (studentExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const { id, name, email, idade, peso, altura } = await student.update(
      req.body
    );

    /**
     * Invalidate Cache
     */

    await Cache.invalidatePrefix(`user:${req.userId}:students`);

    return res.json({ id, name, email, idade, peso, altura });
  }
}

export default new StudentController();
