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

 Date: 13/10/2019 02:02:53
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin_user
-- ----------------------------
DROP TABLE IF EXISTS `admin_user`;
CREATE TABLE `admin_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `sid` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'stringID,字符串型id，全表唯一',
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '用户昵称',
  `avatar` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '头像地址',
  `sex` tinyint(1) NOT NULL DEFAULT '0' COMMENT '性别：0未知，1男，2女',
  `area` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '地区，填：省|市|区',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '用户类型 0-默认用户 1-钉钉同步用户',
  `position` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '职位',
  `depart` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '直属部门名称 例：财务部,会计部',
  `depart_full` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '部门全称 例：加推/财务部,加推/会计部',
  `phone` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '手机号码',
  `asc_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '排序首字母',
  `roles` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '角色，多个用逗号分割',
  `permissions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '权限，多个用逗号分割。这个是为了方便懒得给权限分组的管理员弄的',
  `projects` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '项目。多个用英文半角逗号隔开，允许一个用户同时管理多个项目',
  `d_flag` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1已删除',
  `c_time` datetime NOT NULL COMMENT '本数据创建时间',
  `m_time` datetime NOT NULL COMMENT '最后修改的时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `admin_user_id_uindex` (`id`) USING BTREE,
  UNIQUE KEY `admin_user_sid_uindex` (`sid`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='后台用户表';

-- ----------------------------
-- Records of admin_user
-- ----------------------------
BEGIN;
INSERT INTO `admin_user` VALUES (1, '10000', '超级管理员', '', 0, '', 0, '', '', '', '', '', '', '', '', 0, '2019-08-23 17:52:04', '2019-08-23 17:52:04');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
