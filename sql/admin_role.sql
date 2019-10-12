/*
 Navicat Premium Data Transfer

 Source Server         : 127
 Source Server Type    : MySQL
 Source Server Version : 80017
 Source Host           : 127.0.0.1:3306
 Source Schema         : koa2x_base

 Target Server Type    : MySQL
 Target Server Version : 80017
 File Encoding         : 65001

 Date: 13/10/2019 02:03:02
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin_role
-- ----------------------------
DROP TABLE IF EXISTS `admin_role`;
CREATE TABLE `admin_role` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '角色名字',
  `permissions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '这里是此角色的权限code',
  `d_flag` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1已删除',
  `c_time` datetime NOT NULL COMMENT '本数据创建时间',
  `m_time` datetime NOT NULL COMMENT '最后修改的时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `admin_role_id_uindex` (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='后台角色表，用户创建的角色都在这';

-- ----------------------------
-- Records of admin_role
-- ----------------------------
BEGIN;
INSERT INTO `admin_role` VALUES (1, '超级管理', '1', 0, '2019-10-13 00:24:30', '2019-10-13 00:24:34');
INSERT INTO `admin_role` VALUES (2, '用户管理', '2', 0, '2019-10-13 00:24:56', '2019-10-13 00:25:01');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
