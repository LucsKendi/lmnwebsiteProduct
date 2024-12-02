const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');

// variáveis de ambiente - carregar
dotenv.config();

// config do banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.stack);
    return;
  }
  console.log('Conectado ao banco de dados.');
});

// config do Nodemailer (necessário para o envio de e-mails)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true para SSL, false para TLS (pesquisar, pois nao sei ao certo)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// criar o servidor express
const app = express();
const port = process.env.PORT || 3000;

// middleware global -> para o log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// config do body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve arquivos estáticos das páginas
app.use(express.static(path.join(__dirname, 'cadastro')));
app.use(express.static(path.join(__dirname, 'login')));
app.use(express.static(path.join(__dirname, 'pesquisas')));
app.use(express.static(__dirname)); // serve o index.html na raiz

// route para a página inicial
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// route para salvar reclamações e enviar e-mails de confirmação
app.post('/processa_reclamacao', (req, res) => {
  console.log('Requisição recebida na rota /processa_reclamacao');
  console.log('Corpo da requisição:', req.body);

  const { nome, email, mensagem } = req.body;

  console.log('Dados recebidos:', { nome, email, mensagem });

  if (!nome || !email || !mensagem) {
    console.warn('Campos obrigatórios ausentes:', { nome, email, mensagem });
    return res.status(400).json('Todos os campos são obrigatórios.');
  }

  // insere dados no banco
  const query = 'INSERT INTO reclamacoes (nome, email, mensagem) VALUES (?, ?, ?)';
  db.query(query, [nome, email, mensagem], (err) => {
    if (err) {
      console.error('Erro ao salvar dados no banco:', err.sqlMessage || err);
      return res.status(500).json('Erro ao salvar dados no banco.');
    }

    // config do e-mail de confirmação
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmação de Recebimento',
      text: `Olá, ${nome}!\n\nRecebemos sua mensagem:\n"${mensagem}"\n\nObrigado por entrar em contato!`,
    };

    // envia o e-mail
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Erro ao enviar e-mail:', err);
        return res.status(500).json('Erro ao enviar e-mail de confirmação.');
      }
      res.json('Mensagem enviada com sucesso! Verifique seu e-mail para a confirmação.');
    });
  });
});

// route para o formulário de cadastro
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'cadastro', 'cadastro.html'));
});

// route para o formulário de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// route para a página de pesquisas
app.get('/pesquisas', (req, res) => {
  res.sendFile(path.join(__dirname, 'pesquisas', 'pesquisas.html'));
});

// route para salvar os dados do formulário de cadastro no banco
app.post('/cadastro', (req, res) => {
  const { nome, email, cpf, telefone, senha, genero } = req.body;

  console.log('Requisição recebida na rota /cadastro:', req.body);

  if (!nome || !email || !cpf || !telefone || !senha || !genero) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  // criptografa senha
  bcrypt.hash(senha, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erro ao criptografar senha:', err);
      return res.status(500).send('Erro ao criptografar senha.');
    }

    const query = 'INSERT INTO usuarios (nome, email, cpf, telefone, senha, genero) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [nome, email, cpf, telefone, hashedPassword, genero], (err) => {
      if (err) {
        console.error('Erro ao salvar dados no banco:', err.sqlMessage || err);
        return res.status(500).send('Erro ao salvar dados no banco.');
      }
      res.redirect('/login');
    });
  });
});

// route para login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  console.log('Requisição recebida na rota /login:', req.body);

  if (!email || !senha) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  const query = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erro ao consultar banco:', err);
      return res.status(500).send('Erro ao consultar banco.');
    }

    if (results.length === 0) {
      return res.status(401).send('Email ou senha inválidos.');
    }

    const usuario = results[0];
    bcrypt.compare(senha, usuario.senha, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).send('Email ou senha inválidos.');
      }

      res.redirect('/pesquisas');
    });
  });
});

// inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
