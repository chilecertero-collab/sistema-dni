// server.js - demo Express server (no recomendado para producción sin mejoras de seguridad)
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname,'data.json');
function loadData(){
  if(!fs.existsSync(DATA_FILE)) return { users: {}, dnis: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));
}
function saveData(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

app.post('/api/register', (req,res)=>{
  const { username, password } = req.body;
  if(!username || !password) return res.json({ ok:false, error:'Faltan datos' });
  const d = loadData();
  if(d.users[username]) return res.json({ ok:false, error:'Usuario ya existe' });
  d.users[username] = { username, password };
  saveData(d);
  res.json({ ok:true });
});

app.post('/api/login', (req,res)=>{
  const { username, password } = req.body;
  const d = loadData();
  if(d.users[username] && d.users[username].password === password) return res.json({ ok:true });
  res.json({ ok:false, error:'Usuario/contraseña incorrectos' });
});

app.get('/api/dnis', (req,res)=>{
  const d = loadData();
  res.json(d.dnis || []);
});

app.post('/api/dnis', (req,res)=>{
  const dni = req.body;
  if(!dni || !dni.docNumber) return res.json({ ok:false, error:'Falta documento' });
  const d = loadData();
  d.dnis = d.dnis || [];
  d.dnis.push(dni);
  saveData(d);
  res.json({ ok:true });
});

app.delete('/api/dnis/:doc', (req,res)=>{
  const doc = decodeURIComponent(req.params.doc);
  const d = loadData();
  d.dnis = (d.dnis || []).filter(x=>x.docNumber !== doc);
  saveData(d);
  res.json({ ok:true });
});

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log(`Servidor demo escuchando en puerto ${port}`));