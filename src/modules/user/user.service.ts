import bcrypt from 'bcryptjs';
import { User } from './user.model.js';

export const createEmployeeService = async (
  adminTenantId: string,
  employeeData: { name: string; email: string; password: string }
) => {
  const { name, email, password } = employeeData;

  // 1. Check if email is already registered globally
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email is already registered in the system');
  }

  // 2. Hash password securely using bcryptjs
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // 3. Force inject admin's tenantId and hardcode the EMPLOYEE role
  const employee = await User.create({
    name,
    email,
    passwordHash: hashedPassword,
    role: 'EMPLOYEE',
    tenantId: adminTenantId,
    isActive: true,
  });

  // Strip passwordHash from the returned object for security
  const result = employee.toObject();
  delete (result as any).passwordHash;

  return result;
};

export const getAllEmployeesService = async (tenantId: string) => {
  // Retrieve only employees belonging to this specific organization
  return await User.find({ tenantId, role: 'EMPLOYEE' }).select('-passwordHash');
};
