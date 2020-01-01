import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import Cache from '../../lib/Cache';

class SearchHelpOrderService {
  async run({ userId, where, page, keyPrefix }) {
    const cacheKey = `user:${userId}:helpOrders:${keyPrefix}`;
    const cached = await Cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const helpOrders = await HelpOrder.findAll({
      where,
      attributes: ['id', 'question', 'answer', 'answer_at'],
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

    await Cache.set(cacheKey, helpOrders);

    return helpOrders;
  }
}

export default new SearchHelpOrderService();
