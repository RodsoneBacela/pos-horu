-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GERENTE', 'CAIXA');

-- CreateEnum
CREATE TYPE "TipoMovimentoStock" AS ENUM ('ENTRADA_COMPRA', 'SAIDA_VENDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'DEVOLUCAO_CLIENTE', 'DEVOLUCAO_FORNECEDOR', 'PERDA');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('DINHEIRO', 'MPESA', 'EMOLA', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'TRANSFERENCIA', 'CREDITO');

-- CreateEnum
CREATE TYPE "EstadoVenda" AS ENUM ('CONCLUIDA', 'ANULADA', 'PENDENTE');

-- CreateEnum
CREATE TYPE "EstadoCaixa" AS ENUM ('ABERTA', 'FECHADA');

-- CreateEnum
CREATE TYPE "EstadoCompra" AS ENUM ('PENDENTE', 'RECEBIDA', 'PARCIAL', 'CANCELADA');

-- CreateTable
CREATE TABLE "empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nif" TEXT,
    "endereco" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "moeda" TEXT NOT NULL DEFAULT 'MT',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Maputo',
    "tipoNegocio" TEXT NOT NULL DEFAULT 'FARMACIA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxas_iva" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "taxa" DECIMAL(5,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taxas_iva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "cor" TEXT,
    "icone" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades_medida" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "abreviatura" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_medida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CAIXA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nif" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "contacto" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "codigoBarras" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoriaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "taxaIvaId" TEXT NOT NULL,
    "fabricante" TEXT,
    "precoCompra" DECIMAL(10,2) NOT NULL,
    "precoVenda" DECIMAL(10,2) NOT NULL,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "stockMaximo" INTEGER,
    "validade" TIMESTAMP(3),
    "lote" TEXT,
    "imagem" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto_fornecedores" (
    "produtoId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "precoCompra" DECIMAL(10,2) NOT NULL,
    "referencia" TEXT,

    CONSTRAINT "produto_fornecedores_pkey" PRIMARY KEY ("produtoId","fornecedorId")
);

-- CreateTable
CREATE TABLE "movimentos_stock" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "tipo" "TipoMovimentoStock" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "quantidadeAntes" INTEGER NOT NULL,
    "quantidadeDepois" INTEGER NOT NULL,
    "referencia" TEXT,
    "tipoReferencia" TEXT,
    "motivo" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentos_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ajustes_stock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ajustes_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caixas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "saldoInicial" DECIMAL(10,2) NOT NULL,
    "saldoFinal" DECIMAL(10,2),
    "totalVendas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalDinheiro" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalMpesa" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalEmola" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCartao" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalTransf" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "qtdVendas" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoCaixa" NOT NULL DEFAULT 'ABERTA',
    "observacoes" TEXT,
    "abertaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechadaEm" TIMESTAMP(3),

    CONSTRAINT "caixas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clienteNome" TEXT,
    "clienteNif" TEXT,
    "userId" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "totalDesconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalIva" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "metodoPagamento" "MetodoPagamento" NOT NULL,
    "valorPago" DECIMAL(10,2) NOT NULL,
    "troco" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estado" "EstadoVenda" NOT NULL DEFAULT 'CONCLUIDA',
    "motivoAnulacao" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_itens" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "nomeProduto" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnit" DECIMAL(10,2) NOT NULL,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxaIva" DECIMAL(5,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "venda_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturas" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "serie" TEXT NOT NULL DEFAULT 'A',
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataVencimento" TIMESTAMP(3),
    "observacoes" TEXT,

    CONSTRAINT "faturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compra_ordens" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalItens" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "totalIva" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoCompra" NOT NULL DEFAULT 'RECEBIDA',
    "nrFactura" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compra_ordens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compra_itens" (
    "id" TEXT NOT NULL,
    "compraId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "nomeProduto" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnit" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "lote" TEXT,
    "validade" TIMESTAMP(3),

    CONSTRAINT "compra_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_medida_nome_key" ON "unidades_medida"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_nif_key" ON "fornecedores"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_codigo_key" ON "produtos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_codigoBarras_key" ON "produtos"("codigoBarras");

-- CreateIndex
CREATE INDEX "produtos_nome_idx" ON "produtos"("nome");

-- CreateIndex
CREATE INDEX "produtos_codigo_idx" ON "produtos"("codigo");

-- CreateIndex
CREATE INDEX "produtos_categoriaId_idx" ON "produtos"("categoriaId");

-- CreateIndex
CREATE INDEX "produtos_stockActual_idx" ON "produtos"("stockActual");

-- CreateIndex
CREATE INDEX "movimentos_stock_produtoId_idx" ON "movimentos_stock"("produtoId");

-- CreateIndex
CREATE INDEX "movimentos_stock_createdAt_idx" ON "movimentos_stock"("createdAt");

-- CreateIndex
CREATE INDEX "movimentos_stock_tipo_idx" ON "movimentos_stock"("tipo");

-- CreateIndex
CREATE INDEX "caixas_estado_idx" ON "caixas"("estado");

-- CreateIndex
CREATE INDEX "caixas_abertaEm_idx" ON "caixas"("abertaEm");

-- CreateIndex
CREATE UNIQUE INDEX "vendas_numero_key" ON "vendas"("numero");

-- CreateIndex
CREATE INDEX "vendas_createdAt_idx" ON "vendas"("createdAt");

-- CreateIndex
CREATE INDEX "vendas_userId_idx" ON "vendas"("userId");

-- CreateIndex
CREATE INDEX "vendas_estado_idx" ON "vendas"("estado");

-- CreateIndex
CREATE INDEX "vendas_numero_idx" ON "vendas"("numero");

-- CreateIndex
CREATE INDEX "venda_itens_vendaId_idx" ON "venda_itens"("vendaId");

-- CreateIndex
CREATE UNIQUE INDEX "faturas_numero_key" ON "faturas"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "faturas_vendaId_key" ON "faturas"("vendaId");

-- CreateIndex
CREATE UNIQUE INDEX "compra_ordens_numero_key" ON "compra_ordens"("numero");

-- CreateIndex
CREATE INDEX "compra_ordens_createdAt_idx" ON "compra_ordens"("createdAt");

-- CreateIndex
CREATE INDEX "compra_ordens_fornecedorId_idx" ON "compra_ordens"("fornecedorId");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "unidades_medida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_taxaIvaId_fkey" FOREIGN KEY ("taxaIvaId") REFERENCES "taxas_iva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_fornecedores" ADD CONSTRAINT "produto_fornecedores_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_fornecedores" ADD CONSTRAINT "produto_fornecedores_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_stock" ADD CONSTRAINT "movimentos_stock_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_stock" ADD CONSTRAINT "movimentos_stock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ajustes_stock" ADD CONSTRAINT "ajustes_stock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixas" ADD CONSTRAINT "caixas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "caixas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens" ADD CONSTRAINT "venda_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_ordens" ADD CONSTRAINT "compra_ordens_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_ordens" ADD CONSTRAINT "compra_ordens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_itens" ADD CONSTRAINT "compra_itens_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compra_ordens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_itens" ADD CONSTRAINT "compra_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
