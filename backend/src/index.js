const restify = require('restify');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'db',
    database: process.env.POSTGRES_DB || 'professores',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: process.env.POSTGRES_PORT || 5432,
  });

// iniciar o servidor
var server = restify.createServer({
    name: 'pratica-4',
});

async function initDatabase() {
    try {
        await pool.query('DROP TABLE IF EXISTS alunos');
        await pool.query('CREATE TABLE IF NOT EXISTS alunos (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, curso VARCHAR(255) NOT NULL, data_nascimento VARCHAR(255) NOT NULL)');
        console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao iniciar o banco de dados, tentando novamente em 5 segundos:', error);
        setTimeout(initDatabase, 5000);
    }
}

server.use(restify.plugins.bodyParser());

// Endpoint para inserir um novo professor
server.post('/api/v1/professor/inserir', async (req, res, ) => {
    const { nome, disciplina, email } = req.body;

    try {
        const result = await pool.query(
          'INSERT INTO professores (nome, disciplina, email) VALUES ($1, $2, $3) RETURNING *',
          [nome, disciplina, email]
        );
        res.send(201, result.rows[0]);
        console.log('Professor inserido com sucesso:', result.rows[0]);
      } catch (error) {
        console.error('Erro ao inserir profesor:', error);
        res.send(500, { message: 'Erro ao inserir profesor' });
      }
});

// Endpoint para listar todos os professores
server.get('/api/v1/professor/listar', async (req, res, ) => {
    try {
        const result = await pool.query('SELECT * FROM professores');
        res.send(result.rows);
        console.log('Professores encontrados:', result.rows);
      } catch (error) {
        console.error('Erro ao listar professores:', error);
        res.send(500, { message: 'Erro ao listar professores' });
      }

});

// Endpoint para atualizar um professor existente
server.post('/api/v1/professor/atualizar', async (req, res, ) => {
    const { id, nome, disciplina, email } = req.body;

    try {
        const result = await pool.query(
          'UPDATE professores SET nome = $1, disciplina = $2, email = $3 WHERE id = $4 RETURNING *',
          [nome, disciplina, email, id]
        );
        if (result.rowCount === 0) {
          res.send(404, { message: 'Professor não encontrado' });
        } else {
          res.send(200, result.rows[0]);
          console.log('Professor atualizado com sucesso:', result.rows[0]);
        }
      } catch (error) {
        console.error('Erro ao atualizar professor:', error);
        res.send(500, { message: 'Erro ao atualizar professor' });
      }
    

});

// Endpoint para excluir um professor pelo ID
server.post('/api/v1/professor/excluir', async (req, res) => {
    const { id } = req.body;

    try {
        const result = await pool.query('DELETE FROM professores WHERE id = $1', [id]);
        if (result.rowCount === 0) {
          res.send(404, { message: 'Professor não encontrado' });
        } else {
          res.send(200, { message: 'Professor excluído com sucesso' });
          console.log('Professor excluído com sucesso');
        }
      } catch (error) {
        console.error('Erro ao excluir professor:', error);
        res.send(500, { message: 'Erro ao excluir professor' });
      }
    
});

// endpoint para resetar o banco de dados
server.del('/api/v1/database/reset', async (req, res) => {
    try {
      await pool.query('DROP TABLE IF EXISTS professores');
      await pool.query('CREATE TABLE professores (id SERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, disciplina VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL)');
      res.send(200, { message: 'Banco de dados resetado com sucesso' });
      console.log('Banco de dados resetado com sucesso');
    } catch (error) {
      console.error('Erro ao resetar o banco de dados:', error);
      res.send(500, { message: 'Erro ao resetar o banco de dados' });
    }
  
});

var port = process.env.PORT || 5000;

// configurando o CORS
server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With'
    );
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

// iniciar o servidor
var port = process.env.PORT || 5000;
server.listen(port, function() {
    console.log('Servidor iniciado', server.name, ' na url http://localhost:' + port);

    console.log('Iniciando o banco de dados');
    initDatabase()
})