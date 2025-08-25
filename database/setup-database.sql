
-- 如果你想使用 schema，可以建立並設定
CREATE SCHEMA IF NOT EXISTS appointment;
SET search_path TO appointment;

-- 建立 users 資料表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立 roles 資料表
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
	deleted boolean default false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立 users_roles 資料表
CREATE TABLE IF NOT EXISTS users_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    deleted boolean default false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 建立 items 資料表
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    type varchar(50) not null,
    name varchar(255) not null,
    code varchar(255) not null,
    duration int not null default 15,
	deleted boolean default false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立 rooms 資料表
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    number int not null,
    type varchar(50),
	deleted boolean default false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立 members 資料表
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    email VARCHAR(255),
    birthday date,
    mobile varchar(50)  UNIQUE NOT NULL,
    address varchar(255),
    created_user_id int,
    is_active BOOLEAN DEFAULT true,
    deleted boolean DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立 appointments 資料表
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    doctor_id int NOT NULL,
    room_id int NOT NULL,
    member_id int NOT NULL,
    appointment_date date NOT NULL,
    start_time time NOT NULL,
    end_time time,
    status int default 1 NOT NULL,
    service_item_id int NOT NULL,
	deleted boolean DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE appointment.appointments ADD CONSTRAINT appointments_users_fk FOREIGN KEY (doctor_id) REFERENCES appointment.users(id);
ALTER TABLE appointment.appointments ADD CONSTRAINT appointments_rooms_fk FOREIGN KEY (room_id) REFERENCES appointment.rooms(id);
ALTER TABLE appointment.appointments ADD CONSTRAINT appointments_members_fk FOREIGN KEY (member_id) REFERENCES appointment.members(id);
ALTER TABLE appointment.appointments ADD CONSTRAINT appointments_items_fk FOREIGN KEY (service_item_id) REFERENCES appointment.items(id);

-- 建立 doctor_schedules 資料表
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id SERIAL PRIMARY KEY,
    doctor_id int NOT NULL,
    room_id int NOT NULL,
    day_of_week int NOT null,
    start_time time not null, 
    end_time time not null,
    is_active BOOLEAN DEFAULT true,
	deleted boolean default false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE appointment.appointments ADD CONSTRAINT doctor_schedules_users_fk FOREIGN KEY (doctor_id) REFERENCES appointment.users(id);
ALTER TABLE appointment.appointments ADD CONSTRAINT doctor_schedules_rooms_fk FOREIGN KEY (room_id) REFERENCES appointment.rooms(id);