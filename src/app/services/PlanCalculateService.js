import { addMonths, parseISO } from 'date-fns';

class PlanCalculateService {
  async run({ price, duration, start_date }) {
    const totalPrice = price * duration;
    const end_date = addMonths(parseISO(start_date), duration);

    return { price: totalPrice, end_date };
  }
}

export default new PlanCalculateService();
