import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Organization } from '../organization/organization.model.js';
import { User } from '../user/user.model.js';

export const registerOrgAndAdminService = async (data: {
  orgName: string;
  timezone: string;
  adminName: string;
  email: string;
  password: string;
}) => {
  const { orgName, timezone, adminName, email, password } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  const organization = await Organization.create({
    name: orgName,
    timezone,
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const adminUser = await User.create({
    name: adminName,
    email,
    passwordHash,
    role: 'ORG_ADMIN',
    tenantId: organization._id,
  });

  return { organization, admin: adminUser };
};

export const loginUserService = async (data: {
  email: string;
  password:  string;
}) => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any }
  );

  return { token, user };
};
