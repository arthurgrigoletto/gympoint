import { startOfWeek, endOfWeek, format } from 'date-fns';

import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

import Cache from '../../lib/Cache';

class CheckinController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const startWeek = format(startOfWeek(new Date()), 'yyyy-MM-dd');

    const cacheKey = `user:${req.userId}:checkins:${startWeek}`;
    const cached = await Cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const checkins = await Checkin.findAll({
      where: { student_id: req.params.id },
      attributes: ['id', 'created_at'],
      limit: 20,
      offset: (page - 1) * 20,
      order: ['created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
    });

    await Cache.set(cacheKey, checkins);

    return res.json(checkins);
  }

  async store(req, res) {
    const today = new Date();
    const startWeek = startOfWeek(today);
    const endWeek = endOfWeek(today);

    const checkins = await Checkin.findAll({
      where: {
        student_id: req.params.id,
        created_at: {
          [Op.between]: [startWeek, endWeek],
        },
      },
      attributes: ['id', 'created_at'],
    });

    if (checkins.length >= 5) {
      return res.json({
        error: 'You have exceeded the maximun checkins per week',
      });
    }

    const checkin = await Checkin.create({
      student_id: req.params.id,
    });

    /**
     * Invalidate Cache
     */
    const cacheKey = `user:${req.userId}:checkins:${format(
      startWeek,
      'yyyy-MM-dd'
    )}`;
    const cached = await Cache.get(cacheKey);

    if (cached) {
      await Cache.invalidatePrefix(`user:${req.userId}:checkins`);
    }

    return res.json(checkin);
  }
}

export default new CheckinController();
