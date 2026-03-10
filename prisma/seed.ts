import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

// 1. Setup the connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// 2. Setup the Prisma adapter
const adapter = new PrismaPg(pool)

// 3. Pass the adapter to the client constructor
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 A iniciar seed...");

  // ── 1. Empresa
  await prisma.empresa.upsert({
    where:  { id: "default" },
    update: {},
    create: { id: "default", nome: "HoruPOS Demo", moeda: "MT", timezone: "Africa/Maputo", tipoNegocio: "FARMACIA" },
  });
  console.log("✅ Empresa criada");

  // ── 2. Taxas de IVA (IDs fixos)
  const ivaIsento = await prisma.taxaIva.upsert({
    where:  { id: "iva-isento" },
    update: {},
    create: { id: "iva-isento",   nome: "Isento",       taxa: 0,  padrao: false },
  });
  const ivaNormal = await prisma.taxaIva.upsert({
    where:  { id: "iva-normal" },
    update: {},
    create: { id: "iva-normal",   nome: "IVA Normal",   taxa: 17, padrao: true  },
  });
  await prisma.taxaIva.upsert({
    where:  { id: "iva-reduzido" },
    update: {},
    create: { id: "iva-reduzido", nome: "IVA Reduzido", taxa: 5,  padrao: false },
  });
  console.log("✅ Taxas IVA criadas");

// ── 3. Categorias (upsert por nome — campo @unique no schema)
  const cats = [
    { nome: "Medicamentos", cor: "#6366f1", icone: "Pill"     },
    { nome: "Vitaminas",    cor: "#10b981", icone: "Heart"    },
    { nome: "Higiene",      cor: "#06b6d4", icone: "Droplets" },
    { nome: "Alimentação",  cor: "#f59e0b", icone: "Apple"    },
    { nome: "Bebidas",      cor: "#8b5cf6", icone: "Coffee"   },
    { nome: "Outros",       cor: "#64748b", icone: "Package"  },
  ];
  const categoriasMap: Record<string, string> = {};
  for (const cat of cats) {
    const c = await prisma.categoria.upsert({
      where:  { nome: cat.nome },
      update: {},
      create: cat,
    });
    categoriasMap[cat.nome] = c.id;
  }
  console.log("✅ Categorias criadas");

  // ── 4. Unidades (upsert por abreviatura — campo @unique no schema)
  const uns = [
    { nome: "Unidade",    abreviatura: "un"  },
    { nome: "Comprimido", abreviatura: "cp"  },
    { nome: "Cápsula",    abreviatura: "cáp" },
    { nome: "Frasco",     abreviatura: "fr"  },
    { nome: "Bisnaga",    abreviatura: "bis" },
    { nome: "Ampola",     abreviatura: "amp" },
    { nome: "Caixa",      abreviatura: "cx"  },
    { nome: "Quilograma", abreviatura: "kg"  },
    { nome: "Grama",      abreviatura: "g"   },
    { nome: "Litro",      abreviatura: "lt"  },
    { nome: "Mililitro",  abreviatura: "ml"  },
    { nome: "Dose",       abreviatura: "ds"  },
  ];
  const unidadesMap: Record<string, string> = {};
  for (const un of uns) {
    const u = await prisma.unidadeMedida.upsert({
      where:  { nome: un.nome },
      update: {},
      create: un,
    });
    unidadesMap[un.abreviatura] = u.id;
  }
  console.log("✅ Unidades criadas");

  // ── 5. Utilizadores (role como string — corresponde ao enum do schema)
  const senhaHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where:  { username: "admin" },
    update: {},
    create: { nome: "Administrador", email: "admin@horupos.com",   username: "admin",   password: senhaHash, role: "ADMIN",   activo: true },
  });
  await prisma.user.upsert({
    where:  { username: "gerente" },
    update: {},
    create: { nome: "Gerente Demo",  email: "gerente@horupos.com", username: "gerente", password: senhaHash, role: "GERENTE", activo: true },
  });
  await prisma.user.upsert({
    where:  { username: "caixa1" },
    update: {},
    create: { nome: "Caixa Demo",    email: "caixa@horupos.com",   username: "caixa1",  password: senhaHash, role: "CAIXA",   activo: true },
  });
  console.log("✅ Utilizadores criados (senha: admin123)");

  // ── 6. Produtos
  const produtos = [
    { codigo: "MED001", nome: "Paracetamol 500mg",  categoriaId: categoriasMap["Medicamentos"], unidadeId: unidadesMap["cp"],  taxaIvaId: ivaNormal.id,  precoCompra: 15,  precoVenda: 35,  stockActual: 150, stockMinimo: 20, stockMaximo: 500, fabricante: "Pharmaq",   validade: new Date("2026-08-15"), lote: "L2025001" },
    { codigo: "MED002", nome: "Amoxicilina 250mg",  categoriaId: categoriasMap["Medicamentos"], unidadeId: unidadesMap["cp"],  taxaIvaId: ivaNormal.id,  precoCompra: 80,  precoVenda: 180, stockActual: 0,   stockMinimo: 15, stockMaximo: 200, fabricante: "Medimoc",   validade: new Date("2026-03-20"), lote: "L2025002" },
    { codigo: "MED003", nome: "Ibuprofeno 400mg",   categoriaId: categoriasMap["Medicamentos"], unidadeId: unidadesMap["cp"],  taxaIvaId: ivaNormal.id,  precoCompra: 20,  precoVenda: 45,  stockActual: 200, stockMinimo: 30, stockMaximo: 600, fabricante: "Pharmaq",   validade: new Date("2027-04-15"), lote: "L2025003" },
    { codigo: "MAL001", nome: "Coartem 20/120mg",   categoriaId: categoriasMap["Medicamentos"], unidadeId: unidadesMap["cp"],  taxaIvaId: ivaNormal.id,  precoCompra: 120, precoVenda: 250, stockActual: 8,   stockMinimo: 20, stockMaximo: 300, fabricante: "Novartis",  validade: new Date("2025-12-30"), lote: "L2025004" },
    { codigo: "SUP001", nome: "Vitamina C 1000mg",  categoriaId: categoriasMap["Vitaminas"],    unidadeId: unidadesMap["cp"],  taxaIvaId: ivaIsento.id,  precoCompra: 45,  precoVenda: 95,  stockActual: 80,  stockMinimo: 10, stockMaximo: 200, fabricante: "Vitafarma", validade: new Date("2027-01-10"), lote: "L2025005" },
    { codigo: "HYD001", nome: "ORS Oral Serum",     categoriaId: categoriasMap["Medicamentos"], unidadeId: unidadesMap["fr"],  taxaIvaId: ivaIsento.id,  precoCompra: 10,  precoVenda: 25,  stockActual: 4,   stockMinimo: 20, stockMaximo: 100, fabricante: "WHO",       validade: new Date("2026-11-20"), lote: "L2025006" },
    { codigo: "DIA001", nome: "Metformina 500mg",   categoriaId: categoriasMap["Medicamentos"], unidadeId: unidadesMap["cp"],  taxaIvaId: ivaNormal.id,  precoCompra: 55,  precoVenda: 120, stockActual: 60,  stockMinimo: 15, stockMaximo: 200, fabricante: "Sandoz",    validade: new Date("2026-06-30"), lote: "L2025007" },
    { codigo: "DES001", nome: "Álcool 70% 500ml",   categoriaId: categoriasMap["Higiene"],      unidadeId: unidadesMap["ml"],  taxaIvaId: ivaIsento.id,  precoCompra: 35,  precoVenda: 75,  stockActual: 45,  stockMinimo: 10, stockMaximo: 150, fabricante: "CleanMed",  validade: new Date("2027-01-01"), lote: "L2025008" },
    { codigo: "ANT001", nome: "Fluconazol 150mg",   categoriaId: categoriasMap["Medicamentos"], unidadeId: unidadesMap["cp"],  taxaIvaId: ivaNormal.id,  precoCompra: 90,  precoVenda: 200, stockActual: 30,  stockMinimo: 10, stockMaximo: 150, fabricante: "Pfizer",    validade: new Date("2026-09-05"), lote: "L2025009" },
    { codigo: "DER001", nome: "Betametasona Creme", categoriaId: categoriasMap["Higiene"],      unidadeId: unidadesMap["un"],  taxaIvaId: ivaNormal.id,  precoCompra: 60,  precoVenda: 140, stockActual: 25,  stockMinimo: 8,  stockMaximo: 100, fabricante: "GSK",       validade: new Date("2026-07-22"), lote: "L2025010" },
  ];
  for (const p of produtos) {
    await prisma.produto.upsert({
      where:  { codigo: p.codigo },
      update: {},
      create: p,
    });
  }
  console.log("✅ Produtos criados:", produtos.length);
  // ── 7. Caixa aberta
  const caixaExiste = await prisma.caixa.findFirst({ where: { estado: "ABERTA" } });
  if (!caixaExiste) {
    await prisma.caixa.create({
      data: {
        userId:        admin.id,
        saldoInicial:  5000,
        totalVendas:   0,
        totalDinheiro: 0,
        totalMpesa:    0,
        totalCartao:   0,
        qtdVendas:     0,
        estado:        "ABERTA",
        abertaEm:      new Date(),
      },
    });
    console.log("✅ Caixa aberta (MT 5.000)");
  }

  console.log("\n🎉 Seed concluído!");
  console.log("  admin / gerente / caixa1  →  senha: admin123");
}

main()
  .catch((e) => { console.error("❌ Erro:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
