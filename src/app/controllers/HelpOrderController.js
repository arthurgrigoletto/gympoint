import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

import SearchHelpOrderService from '../services/SearchHelpOrderService';

import Cache from '../../lib/Cache';
import Queue from '../../lib/Queue';

class HelpOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const helpOrders = await SearchHelpOrderService.run({
      userId: req.userId,
      where: { answer: null },
      page,
      keyPrefix: page,
    });

    return res.json(helpOrders);
  }

  async getHelpOrdersByStudent(req, res) {
    const { page = 1 } = req.query;

    const helpOrders = await SearchHelpOrderService.run({
      userId: req.userId,
      where: { student_id: req.params.id },
      page,
      keyPrefix: `student:${req.params.id}`,
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    const student_id = req.params.id;
    const { question } = req.body;

    const helpOrder = await HelpOrder.create({
      student_id,
      question,
    });

    await Cache.invalidatePrefix(`user:${req.userId}:helpOrders`);

    return res.json(helpOrder);
  }

  async answer(req, res) {
    const helpOrder = await HelpOrder.findByPk(req.params.id);

    if (!helpOrder) {
      return res
        .status(404)
        .json({ error: `Cannot find Help Order with ID: ${req.params.id}` });
    }

    await helpOrder.update({
      answer: req.body.answer,
      answer_at: new Date(),
    });

    /**
     * Invalidate Cache
     */

    await Cache.invalidatePrefix(`user:${req.userId}:helpOrders`);

    /**
     * Send email
     */
    const { student_id } = helpOrder;

    const student = await Student.findByPk(student_id);

    await Queue.add('HelpOrderAnswerEmail', { helpOrder, student });

    return res.json(helpOrder);
  }
}

export default new HelpOrderController();
