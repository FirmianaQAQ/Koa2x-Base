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

 Date: 13/10/2019 01:59:34
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin_user_login
-- ----------------------------
DROP TABLE IF EXISTS `admin_user_login`;
CREATE TABLE `admin_user_login` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '本登录方式所属用户id',
  `type` tinyint(2) NOT NULL DEFAULT '0' COMMENT '登录类型：0账号密码，1小程序 openid，2微信开放平台 unionid，3手机号密码或短信验证，4电子邮箱',
  `account` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '账号（如果是openid/unionid等第三方唯一串，则存到这）',
  `pwd` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '密码',
  `d_flag` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1已删除',
  `c_time` datetime NOT NULL COMMENT '本数据创建时间',
  `m_time` datetime NOT NULL COMMENT '最后修改的时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `admin_user_login_id_uindex` (`id`) USING BTREE,
  UNIQUE KEY `admin_user_login_type_account_d_flag_uindex` (`type`,`account`,`d_flag`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='后台用户的登录方式';

-- ----------------------------
-- Records of admin_user_login
-- ----------------------------
BEGIN;
INSERT INTO `admin_user_login` VALUES (1, 1, 0, 'admin', '00ba7ceab606427071d5d755ea99e976', 0, '2019-08-23 17:52:04', '2019-08-23 17:52:04');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
