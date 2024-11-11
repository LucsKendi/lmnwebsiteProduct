// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.stack);
    return;
  }
  console.log('Conectado ao banco de dados.');
});

// Criar o servidor Express
const app = express();
const port = process.env.PORT || 3000;

// Configurar o Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Servir arquivos estáticos (HTML, CSS, JS) das pastas específicas
app.use(express.static(path.join(__dirname, 'cadastro')));
app.use(express.static(path.join(__dirname, 'login')));
app.use(express.static(path.join(__dirname, 'pesquisas')));
app.use(express.static(__dirname)); // Para servir o index.html na raiz

// Rota para a página inicial
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Rota para o formulário de cadastro
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'cadastro', 'cadastro.html'));
});

// Rota para o formulário de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Rota para a página de pesquisas
app.get('/pesquisas', (req, res) => {
  res.sendFile(path.join(__dirname, 'pesquisas', 'pesquisas.html'));
});


// Rota para salvar os dados do formulário no banco de dados
app.post('/cadastro', (req, res) => {
  const { nome, email, cpf, telefone, senha, genero } = req.body;

  // Validar dados
  if (!nome || !email || !cpf || !telefone || !senha || !genero) {
    console.warn('Tentativa de cadastro com campos ausentes:', req.body);
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  // Log dos dados recebidos para verificar o conteúdo
  console.log('Dados recebidos:', req.body);

  // Criptografar a senha
  bcrypt.hash(senha, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erro ao criptografar a senha:', err);
      return res.status(500).send('Erro ao criptografar a senha.');
    }

    // Inserir dados no banco
    const query = 'INSERT INTO usuarios (nome, email, cpf, telefone, senha, genero) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [nome, email, cpf, telefone, hashedPassword, genero], (err, result) => {
      if (err) {
        console.error('Erro ao salvar os dados no banco:', err.sqlMessage || err);
        
        // Verificações específicas para erro de conexão
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
          return res.status(500).send('Erro de permissão no banco de dados.');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
          return res.status(500).send('Banco de dados especificado não encontrado.');
        } else if (err.code === 'ER_NO_SUCH_TABLE') {
          return res.status(500).send('A tabela "usuarios" não existe.');
        } else if (err.code === 'ER_DUP_ENTRY') {
          return res.status(500).send('Erro: Dados duplicados, usuário já cadastrado.');
        }

        return res.status(500).send('Erro ao salvar os dados no banco.');
      }

      console.log('Cadastro realizado com sucesso:', result);
        // Redirecionar para a página de login após o cadastro bem-sucedido
      res.redirect('/login');
    });
  });
});

// Rota para o login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Validar dados
  if (!email || !senha) {
    console.warn('Campos obrigatórios ausentes:', req.body);
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  // Consultar o banco de dados para encontrar o usuário
  const query = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).send('Erro ao consultar o banco de dados.');
    }

    // Se o usuário não for encontrado
    if (result.length === 0) {
      console.warn('Usuário não encontrado:', email);
      return res.status(401).send('Email ou senha inválidos.');
    }

    const usuario = result[0];

    // Comparar a senha fornecida com a senha criptografada
    bcrypt.compare(senha, usuario.senha, (err, isMatch) => {
      if (err) {
        console.error('Erro ao comparar as senhas:', err);
        return res.status(500).send('Erro ao validar a senha.');
      }

      // Se a senha não corresponder
      if (!isMatch) {
        console.warn('Senha incorreta para o usuário:', email);
        return res.status(401).send('Email ou senha inválidos.');
      }

      // Se a senha for válida, redirecionar para a página de pesquisas
      res.redirect('/pesquisas'); // Modificação para redirecionar
    });
  });
});




// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
