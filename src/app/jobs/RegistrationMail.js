import Mail from '../../lib/Mail';
import { formatPrice, formatDate } from '../utils/FormatFunctions';

export default {
  key: 'RegistrationMail',
  async handle({ data }) {
    const { student, registration, plan } = data;

    await Mail.sendMail({
      from: 'Gympoint <secretaria@gympoint.com.br>',
      to: `${student.name} <${student.email}>`,
      subject: 'Matrícula realizada com Sucesso',
      html: `Olá ${student.name}, bem-vindo á Gympoint! O plano escolhido foi ${
        plan.title
      } com o total de ${formatPrice(registration.price)}, parcelado em ${
        plan.duration
      }x ${formatPrice(plan.price)}. Seu plano vencerá no dia ${formatDate(
        registration.end_date
      )} então fique ligado! :D`,
    });
  },
};
