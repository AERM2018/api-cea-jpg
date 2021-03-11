ALTER TABLE extracurricular_courses CHANGE ext_cou_name ext_cou_name VARCHAR(30) NOT NULL;
ALTER TABLE extracurricular_courses CHANGE start_date start_date DATE NOT NULL;
ALTER TABLE extracurricular_courses CHANGE limit_participants limit_participants TINYINT NOT NULL;
ALTER TABLE extracurricular_courses CHANGE cost cost float NOT NULL;