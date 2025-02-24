-- HR Database
CREATE DATABASE hr_system;
USE hr_system;

-- Departments table
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL
);

-- Employees table
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL,
    birth_date DATE,
    department_id INT,
    gender ENUM('M', 'F', 'Other'),
    ethnicity VARCHAR(50),
    is_shareholder BOOLEAN DEFAULT FALSE,
    employment_type ENUM('Full-time', 'Part-time'),
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- Vacation Records table
CREATE TABLE vacation_records (
    vacation_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_taken INT,
    status ENUM('Approved', 'Pending', 'Rejected'),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Benefits Plans table
CREATE TABLE benefit_plans (
    plan_id INT PRIMARY KEY AUTO_INCREMENT,
    plan_name VARCHAR(100) NOT NULL,
    cost_per_month DECIMAL(10,2)
);

-- Employee Benefits Enrollment table
CREATE TABLE benefit_enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    plan_id INT,
    enrollment_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    employee_contribution DECIMAL(10,2),
    employer_contribution DECIMAL(10,2),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (plan_id) REFERENCES benefit_plans(plan_id)
);

-- Create Payroll Database
CREATE DATABASE payroll_system;
USE payroll_system;

-- Pay Periods table
CREATE TABLE pay_periods (
    period_id INT PRIMARY KEY AUTO_INCREMENT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    period_type ENUM('Monthly', 'Bi-weekly') NOT NULL
);

-- Payroll Records table
CREATE TABLE payroll_records (
    payroll_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    period_id INT,
    gross_pay DECIMAL(12,2) NOT NULL,
    total_deductions DECIMAL(12,2),
    net_pay DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (period_id) REFERENCES pay_periods(period_id)
);


#   C D I O 2  
 