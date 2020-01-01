import Mail from '../../lib/Mail';

export default {
  key: 'HelpOrderAnswerEmail',
  async handle({ data }) {
    const { student, helpOrder } = data;

    await Mail.sendMail({
      from: 'Gympoint <secretaria@gympoint.com.br>',
      to: `${student.name} <${student.email}>`,
      template: 'helpOrder',
      subject: 'Sua Questão foi respondida',
      context: {
        student: student.name,
        question: helpOrder.question,
        answer: helpOrder.answer,
      },
    });
  },
};
