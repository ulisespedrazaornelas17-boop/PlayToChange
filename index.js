const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // sirve archivos de public/

// Cargar catálogo de productos
const productsPath = path.join(__dirname, 'data', 'products.json');
let catalog = [];
try {
  const data = fs.readFileSync(productsPath, 'utf-8');
  catalog = JSON.parse(data);
  console.log(`✅ Catálogo cargado (${catalog.length} productos)`);
} catch (err) {
  console.error("❌ Error cargando catálogo:", err);
}

// Función IMC
function imc(peso, altura) {
  if (!peso || !altura) return null;
  return +(peso / (altura * altura)).toFixed(1);
}

// Generar receta
function generateRecipeForProduct(p) {
  const brand = p.brand.toLowerCase();
  if (brand.includes("danone")) return "Disfrútalo con fruta fresca y cereal integral 🥭🍎";
  if (brand.includes("activia")) return "Parfait con Activia, frutos rojos y granola 🫐🍓";
  if (brand.includes("danette")) return "Postre cremoso listo para disfrutar 🍫🍮";
  if (p.category && p.category.toLowerCase().includes("griegos")) return "Bowl proteico con Danone Griego, miel y nueces 🥜🍯";
  return "Disfruta con fruta fresca y cereal integral 🥭🍎";
}

// Lógica de recomendación
function recommend(profile) {
  const { sex, age, weight, height, hobby, healthGoals, conditions } = profile;
  const bmi = imc(weight, height);
  let suggestions = [];

  if (age && age <= 12) suggestions.push(...catalog.filter(p => p.brand.toLowerCase().includes("danone")));
  if (conditions && conditions.includes("digestivo")) suggestions.push(...catalog.filter(p => p.brand.toLowerCase().includes("activia")));
  if (healthGoals && healthGoals.includes("inmunidad")) suggestions.push(...catalog.filter(p => p.brand.toLowerCase().includes("danette")));
  if (hobby && hobby.includes("deporte")) suggestions.push(...catalog.filter(p => p.category && p.category.toLowerCase().includes("griegos")));

  if (suggestions.length === 0) suggestions = catalog.slice(0, 3);

  const recipes = suggestions.map(p => ({
    product: p,
    recipe: generateRecipeForProduct(p)
  }));

  return { bmi, recipes };
}

// Endpoint principal
app.post('/recommend', (req, res) => {
  const profile = req.body;
  if (!profile.consent) return res.status(400).json({ error: "Se requiere consentimiento" });
  const result = recommend(profile);
  res.json(result);
});

// Servir formulario HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:3000`);
});
