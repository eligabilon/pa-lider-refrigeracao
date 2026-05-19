-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Tempo de geração: 16/05/2026 às 19:27
-- Versão do servidor: 8.0.45
-- Versão do PHP: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `lider_refrigeracao`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user` varchar(100) NOT NULL,
  `action` varchar(50) NOT NULL,
  `module` varchar(100) NOT NULL,
  `details` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `customers`
--

CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `document` varchar(50) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `plate` varchar(50) DEFAULT NULL,
  `vehicleModel` varchar(100) DEFAULT NULL,
  `equipBrand` varchar(100) DEFAULT NULL,
  `equipModel` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `fleet`
--

CREATE TABLE `fleet` (
  `id` varchar(36) NOT NULL,
  `placa` varchar(20) NOT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `consumo` decimal(10,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `id` varchar(36) NOT NULL,
  `partName` varchar(255) NOT NULL,
  `type` enum('entrada','saida','correcao') NOT NULL,
  `quantity` int NOT NULL,
  `user` varchar(100) DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `note` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `inventory_parts`
--

CREATE TABLE `inventory_parts` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'ADMIN'),
(5, 'ANALISTA'),
(2, 'CEO'),
(3, 'DIRETOR'),
(4, 'GERENTE'),
(6, 'MOTORISTA');

-- --------------------------------------------------------

--
-- Estrutura para tabela `service_orders`
--

CREATE TABLE `service_orders` (
  `id` varchar(36) NOT NULL,
  `date` varchar(100) DEFAULT NULL,
  `clientName` varchar(255) DEFAULT NULL,
  `document` varchar(50) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `plate` varchar(50) DEFAULT NULL,
  `vehicleModel` varchar(100) DEFAULT NULL,
  `equipBrand` varchar(100) DEFAULT NULL,
  `equipModel` varchar(100) DEFAULT NULL,
  `serviceType` varchar(100) DEFAULT NULL,
  `problem` text,
  `diagnosis` text,
  `startTime` varchar(50) DEFAULT NULL,
  `endTime` varchar(50) DEFAULT NULL,
  `travelValue` decimal(10,2) DEFAULT '0.00',
  `discountPercent` decimal(5,2) DEFAULT '0.00',
  `discountValue` decimal(10,2) DEFAULT '0.00',
  `warranty` varchar(100) DEFAULT NULL,
  `technician` varchar(100) DEFAULT NULL,
  `observations` text,
  `status` enum('Pendente','Executado','Cancelado') DEFAULT 'Pendente',
  `services` json DEFAULT NULL,
  `parts` json DEFAULT NULL,
  `partsValue` decimal(10,2) DEFAULT '0.00',
  `servicesValue` decimal(10,2) DEFAULT '0.00',
  `subtotal` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `executedAt` timestamp NULL DEFAULT NULL,
  `cancelledAt` timestamp NULL DEFAULT NULL,
  `origin` varchar(50) DEFAULT NULL,
  `report` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `simulations`
--

CREATE TABLE `simulations` (
  `id` varchar(36) NOT NULL,
  `data` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_name` varchar(100) DEFAULT NULL,
  `origem` varchar(255) DEFAULT NULL,
  `destino` varchar(255) DEFAULT NULL,
  `distancia_km` decimal(10,2) DEFAULT NULL,
  `duracao_min` int DEFAULT NULL,
  `consumo` decimal(10,2) DEFAULT NULL,
  `preco_diesel` decimal(10,2) DEFAULT NULL,
  `custo_combustivel` decimal(10,2) DEFAULT NULL,
  `total_pedagios` decimal(10,2) DEFAULT NULL,
  `valor_frete` decimal(10,2) DEFAULT NULL,
  `custo_total` decimal(10,2) DEFAULT NULL,
  `lucro` decimal(10,2) DEFAULT NULL,
  `margem` decimal(10,5) DEFAULT NULL,
  `custo_por_km` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `site_settings`
--

CREATE TABLE `site_settings` (
  `id` int NOT NULL DEFAULT '1',
  `banners` longtext,
  `specialties` longtext,
  `carouselDelay` int DEFAULT '6',
  `goalType` varchar(50) DEFAULT 'valor',
  `goalTarget` decimal(15,2) DEFAULT '5000.00',
  `companyName` varchar(255) DEFAULT 'LIDER REFRIGERAÇÃO',
  `whatsapp` varchar(50) DEFAULT '(34) 9941 - 0863 ',
  `email` varchar(100) DEFAULT 'oficinaliderrefrigeracao@gmail.com',
  `instagram` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `googleMapsUrl` text,
  `latitude` varchar(50) DEFAULT NULL,
  `longitude` varchar(50) DEFAULT NULL,
  `cnpj` varchar(50) DEFAULT NULL,
  `logo` longtext,
  `aboutYears` varchar(20) DEFAULT '15+',
  `aboutTitle` varchar(255) DEFAULT NULL,
  `aboutDescription` text,
  `aboutImage` longtext,
  `loginBackground` longtext,
  `siteUrl` varchar(255) DEFAULT 'https://oficinaliderrefrigeracao.com.br'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `site_settings`
--

INSERT INTO `site_settings` (`id`, `banners`, `specialties`, `carouselDelay`, `goalType`, `goalTarget`, `companyName`, `whatsapp`, `email`, `instagram`, `facebook`, `address`, `googleMapsUrl`, `latitude`, `longitude`, `cnpj`, `logo`, `aboutYears`, `aboutTitle`, `aboutDescription`, `aboutImage`, `loginBackground`, `siteUrl`) VALUES
(1, '[]', '[]', 6, 'valor', 5000.00, 'LIDER REFRIGERAÇÃO', '(34) 9941 - 0863 ', 'oficinaliderrefrigeracao@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '15+', NULL, NULL, NULL, NULL, 'https://oficinaliderrefrigeracao.com.br');

-- --------------------------------------------------------

--
-- Estrutura para tabela `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(36) NOT NULL,
  `type` enum('receita','despesa') NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category` varchar(100) DEFAULT NULL,
  `orderId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `trips`
--

CREATE TABLE `trips` (
  `id` varchar(36) NOT NULL,
  `status` varchar(20) DEFAULT 'ativa',
  `data_inicio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_fim` timestamp NULL DEFAULT NULL,
  `origem` varchar(255) DEFAULT NULL,
  `destino` varchar(255) DEFAULT NULL,
  `placa` varchar(20) DEFAULT NULL,
  `km_inicial` int DEFAULT NULL,
  `km_final` int DEFAULT NULL,
  `distancia` decimal(10,2) DEFAULT NULL,
  `eventos` json DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'USER',
  `permissions` json DEFAULT NULL,
  `financeSubPerms` json DEFAULT NULL,
  `trechoSubPerms` json DEFAULT NULL,
  `avatarUrl` longtext,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_seen` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `permissions`, `financeSubPerms`, `trechoSubPerms`, `avatarUrl`, `created_at`, `last_seen`) VALUES
('1', 'admin', 'admin@lider.com', '$2b$10$F.YPfzG310V1vFBgUPadheiN48ehed.BAIE2c5iAS2IjYo6jnX5jC', 'ADMIN', '{\"config\": {\"edit\": true, \"view\": true, \"delete\": true}, \"trecho\": {\"edit\": true, \"view\": true, \"delete\": true}, \"estoque\": {\"edit\": true, \"view\": true, \"delete\": true}, \"clientes\": {\"edit\": true, \"view\": true, \"delete\": true}, \"historico\": {\"edit\": true, \"view\": true, \"delete\": true}, \"financeiro\": {\"edit\": true, \"view\": true, \"delete\": true}, \"orcamentos\": {\"edit\": true, \"view\": true, \"delete\": true}}', NULL, NULL, '', '2026-05-15 16:59:13', '2026-05-16 19:25:31');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `fleet`
--
ALTER TABLE `fleet`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `inventory_parts`
--
ALTER TABLE `inventory_parts`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Índices de tabela `service_orders`
--
ALTER TABLE `service_orders`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `simulations`
--
ALTER TABLE `simulations`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
