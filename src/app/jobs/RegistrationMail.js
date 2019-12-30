import Mail from '../../lib/Mail';
import { formatPrice, formatDate } from '../utils/FormatFunctions';

export default {
  key: 'RegistrationMail',
  async handle({ data }) {
    const { student, registration, plan } = data;

    await Mail.sendMail({
      from: 'Gympoint <secretaria@gympoint.com.br>',
      to: `${student.name} <${student.email}>`,
      template: 'registration',
      subject: 'Matrícula realizada com Sucesso',
      context: {
        student: student.name,
        plan: plan.title,
        price: formatPrice(registration.price),
        parcel: `${plan.duration}x ${formatPrice(plan.price)}`,
        end_date: formatDate(registration.end_date),
      },
    });
  },
};
