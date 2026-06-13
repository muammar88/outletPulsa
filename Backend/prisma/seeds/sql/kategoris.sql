-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 01, 2026 at 11:01 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `outlet_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `kategoris`
--

CREATE TABLE `kategoris` (
  `id` int NOT NULL,
  `kode` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` enum('prabayar','pascabayar') NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `kategoris`
--

INSERT INTO `kategoris` (`id`, `kode`, `name`, `type`, `createdAt`, `updatedAt`) VALUES
(1, 'PIU', 'Pulsa Isi Ulang', 'prabayar', '2023-03-23 23:41:35', '0000-00-00 00:00:00'),
(2, 'PT', 'Pulsa Transfer', 'prabayar', '2023-03-23 23:41:38', '0000-00-00 00:00:00'),
(3, 'PI', 'Pulsa Internasional', 'prabayar', '2023-03-23 23:41:40', '0000-00-00 00:00:00'),
(4, 'PD', 'Paket Data', 'prabayar', '2023-03-23 23:41:40', '0000-00-00 00:00:00'),
(5, 'PTP', 'Paket Telpon', 'prabayar', '2023-03-23 23:41:52', '0000-00-00 00:00:00'),
(6, 'PS', 'Paket SMS', 'prabayar', '2023-03-23 23:41:54', '0000-00-00 00:00:00'),
(7, 'TL', 'Token Listrik', 'prabayar', '2023-03-23 23:41:55', '0000-00-00 00:00:00'),
(8, 'VG', 'Voucher Game', 'prabayar', '2023-03-23 23:41:56', '0000-00-00 00:00:00'),
(9, 'UD', 'Uang Digital', 'prabayar', '2023-03-23 23:42:00', '0000-00-00 00:00:00'),
(10, 'WIFI', 'Wifi ID', 'prabayar', '2023-03-23 23:42:05', '0000-00-00 00:00:00'),
(11, 'TVK', 'TV Kabel', 'pascabayar', '2023-03-23 23:42:05', '0000-00-00 00:00:00'),
(12, 'VM', 'Voucher Makan', 'prabayar', '2023-03-23 23:42:06', '0000-00-00 00:00:00'),
(13, 'VB', 'Voucher Belanja', 'prabayar', '2023-03-23 23:42:07', '0000-00-00 00:00:00'),
(14, 'VD', 'Voucher Digital', 'prabayar', '2023-03-23 23:42:07', '0000-00-00 00:00:00'),
(15, 'MA', 'Masa Aktif', 'prabayar', '2023-03-23 23:42:07', '0000-00-00 00:00:00'),
(16, 'TPG', 'Token Pertagas', 'prabayar', '2023-03-23 23:42:08', '0000-00-00 00:00:00'),
(17, 'TB', 'Transfer Bank', 'prabayar', '2023-03-23 23:42:08', '0000-00-00 00:00:00'),
(18, 'UV', 'Unlock Voucher', 'prabayar', '2023-03-23 23:42:41', '0000-00-00 00:00:00'),
(19, 'UKP', 'Unlock Kartu Perdana', 'prabayar', '2023-03-23 23:42:43', '0000-00-00 00:00:00'),
(20, 'ET', 'E-Toll', 'prabayar', '2023-07-29 00:00:00', '2023-07-29 00:00:00'),
(21, 'TVP', 'TV Prabayar', 'prabayar', '2023-07-29 00:00:00', '2023-07-29 00:00:00'),
(22, 'PLNPASCABAYAR', 'PLN Pascabayar', 'pascabayar', '2023-07-29 00:00:00', '2023-07-29 00:00:00'),
(23, 'Telkom', 'TELKOM', 'pascabayar', '2023-07-29 00:00:00', '2023-07-29 00:00:00'),
(24, 'BPJS', 'BPJS', 'pascabayar', '2023-07-29 00:00:00', '2023-07-29 00:00:00'),
(25, 'PDAM', 'PDAM', 'pascabayar', '2023-07-29 00:00:00', '2023-07-29 00:00:00'),
(26, 'PGN', 'PGN', 'pascabayar', '2023-07-29 00:00:00', '2023-07-29 00:00:00'),
(27, 'INT', 'Internet', 'prabayar', '2023-08-19 00:00:00', '2023-08-19 00:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `kategoris`
--
ALTER TABLE `kategoris`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kategoris`
--
ALTER TABLE `kategoris`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
