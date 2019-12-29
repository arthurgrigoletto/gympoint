import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const students = await Student.findAll({
      attributes: ['id', 'name', 'email', 'idade', 'peso', 'altura'],
    });

    return res.json(students);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      idade: Yup.number()
        .integer()
        .required(),
      peso: Yup.number().required(),
      altura: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const { id, name, email, idade, peso, altura } = await Student.create(
      req.body
    );

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
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      idade: Yup.number().integer(),
      peso: Yup.number(),
      altura: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const student = await Student.findByPk(req.params.id);

    const { email: emailToUpdate } = req.body;

    if (emailToUpdate) {
      const studentExists = await Student.findOne({
        where: { emailToUpdate },
      });

      if (studentExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const { id, name, email, idade, peso, altura } = await student.update(
      req.body
    );

    return res.json({ id, name, email, idade, peso, altura });
  }
}

export default new StudentController();
