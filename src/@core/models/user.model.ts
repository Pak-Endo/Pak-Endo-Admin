export class User {
  _id!: string;
  prefix!: string;
  firstName!: string;
  lastName!: string;
  fullName!: string;
  email!: string;
  phoneNumber!: string;
  memberID!: string;
  password!: string;
  gender!: Gender;
  status!: Status;
  role!: UserRole;
  deletedCheck!: boolean;
}
export class UserList {
  users!: User[];
  totalCount!: number;
}

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum Status {
  APPROVED = 1,
  PENDING = 2,
  REJECTED = 3,
  BANNED = 4
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum Type {
  E = 'PES Executive Member',
  H = 'PES Honorary Member',
  I = 'International Executive Membership',
  S = 'Scientific Members',
  SE = 'Scientific Executive Members'
}
