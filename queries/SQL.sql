 ALTER TABLE extracurricular_courses CHANGE ext_cou_name ext_cou_name VARCHAR(30) NOT NULL; ALTER TABLE extracurricular_courses CHANGE start_date start_date DATE NOT NULL; ALTER TABLE extracurricular_courses CHANGE limit_participants limit_participants TINYINT NOT NULL; ALTER TABLE extracurricular_courses CHANGE cost cost float NOT NULL; AS

SELECT  `stu`.`id_student`            AS `id_student`
       ,`stu`.`id_user`               AS `id_user`
       ,`stu`.`name`                  AS `name`
       ,`stu`.`group_chief`           AS `group_chief`
       ,`stu`.`curp`                  AS `curp`
       ,`stu`.`status`                AS `status`
       ,`stu`.`mobile_number`         AS `mobile_number`
       ,`stu`.`mobile_back_number`    AS `mobile_back_number`
       ,`stu`.`start_date`            AS `start_date`
       ,`stu`.`end_date`              AS `end_date`
       ,`stu`.`surname_f`             AS `surname_f`
       ,`stu`.`surname_m`             AS `surname_m`
       ,`stu`.`street`                AS `street`
       ,`stu`.`colony`                AS `colony`
       ,`stu`.`zip`                   AS `zip`
       ,`stu`.`birthdate`             AS `birthdate`
       ,`stu`.`matricula`             AS `matricula`
       ,`gro`.`id_group`              AS `id_group`
       ,`gro`.`name_group`            AS `name_group`
       ,`maj`.`major_name`            AS `major_name`
       ,`edu_lev`.`educational_level` AS `educational_level`
       ,`cam`.`campus_name`           AS `campus_name`
       ,(
SELECT  `pay_info`.`start_date`
FROM `pay_info`
WHERE ((`pay_info`.`id_student` = `stu`.`id_student`) AND (`pay_info`.`payment_type` = 'Inscripción'))) AS `ins_date` 
FROM 
    `students` `stu`
	LEFT JOIN `stu_gro` on
	`stu_gro`.`id_student` = `stu`.`id_student`
	
	LEFT JOIN `groupss` `gro` on
	`gro`.`id_group` = `stu_gro`.`id_group`
	
	LEFT JOIN `majors` `maj` on
	`maj`.`id_major` = `gro`.`id_major`
	
	LEFT JOIN `educational_levels` `edu_lev`
	ON `edu_lev`.`id_edu_lev` = `maj`.`id_edu_lev`
    
	LEFT JOIN `cam_use` on
	`cam_use`.`id_user` = `stu`.`id_user`
	
	LEFT JOIN `campus` `cam` on
	`cam`.`id_campus` = `cam_use`.`id_campus`;