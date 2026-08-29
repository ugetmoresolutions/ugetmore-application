import { Service } from "typedi";
import RefreshToken from "@/models/user/refreshToken.model";
import User, { Address } from "@/models/user/user.model";
import { IUser, TokenData } from "@/types/user/auth.types";
import { hash } from "bcryptjs";
import { IAuthRepository } from "@/interfaces/auth/IAuthRepository .interface";
import { HttpException } from "@/exceptions/HttpException";
import Cart from "@/models/cart/cart.model";
import { Op } from "sequelize";
import crypto from "crypto"; // ADD THIS IMPORT

@Service()
export class AuthRepository implements IAuthRepository {
  public async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({
        where: { email },
        raw: true,
      });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

   public async deleteUser(userId: number): Promise<boolean> {
    try {
      // Simple delete - let database handle cascading if configured
      const deletedCount = await User.destroy({
        where: { id: userId }
      });

      if (deletedCount === 0) {
        throw new HttpException(404, `User with ID ${userId} not found`);
      }

      return true;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to delete user: ${error.message}`);
    }
  }

  public async findById(userId: number): Promise<IUser> {
    try {
      return await User.findOne({
        where: { id: userId },

        raw: true,
      });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async findUserById(userId: number): Promise<IUser | null> {
    try {
      return await User.findByPk(userId, { raw: true });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  /**
   * Find users by role
   * @param role - The role to search for ('admin', 'client', etc.)
   * @returns Array of users with the specified role
   */
  public async findUsersByRole(role: string): Promise<IUser[]> {
  try {
    const users = await User.findAll({
      where: { role },
      raw: true,
    });
    return users;
  } catch (error) {
    throw new HttpException(500, `Failed to find users by role: ${error.message}`);
  }
}

  public async createUser(userData: IUser): Promise<IUser> {
  const transaction = await User.sequelize.transaction();

  try {
    // Create user with isEmailVerified set to false
    const user = await User.create({
      ...userData,
      isEmailVerified: false, // Add this line
    }, { transaction });
    
    await Cart.create(
      {
        userId: user.id,
        items: [],
        totalPrice: 0,
      },
      { transaction }
    );
    await transaction.commit();
    return user.toJSON() as IUser;
  } catch (error: any) {
    await transaction.rollback();
    throw new HttpException(409, error.message);
  }
}

  public async saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    try {
      await RefreshToken.create({ token, userId, expiresAt });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async findRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      return await RefreshToken.findOne({ where: { token }, raw: true });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async deleteRefreshToken(token: string): Promise<void> {
    try {
      await RefreshToken.destroy({ where: { token } });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

   /**
   * Get all users except admins
   * @returns Array of all non-admin users
   */
  public async getAllUsers(): Promise<IUser[]> {
    try {
      const users = await User.findAll({
        where: {
          role: {
            [Op.ne]: 'admin' // Get users where role is NOT 'admin'
          }
        },
        attributes: { exclude: ['password'] }, // Exclude password for security
        order: [['createdAt', 'DESC']], // Order by newest first
        raw: true,
      });
      return users;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get all users: ${error.message}`);
    }
  }

  public async updateUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = await User.findOne({
        where: { id: userData.id },
        raw: false,
      });

      if (!user) {
        return null;
      }

      await user.update(userData);

      const updatedUser = await User.findOne({
        where: { id: userData.id },

        raw: true,
      });

      return updatedUser;
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  // Add these methods to your AuthRepository class

public async saveEmailVerificationToken(
  email: string, 
  token: string, 
  expiresAt: Date
): Promise<void> {
  try {
    const user = await User.findOne({
      where: { email },
      raw: false,
    });

    if (user) {
      await user.update({ 
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt
      });
    }
  } catch (error) {
    throw new HttpException(409, error.message);
  }
}

public async verifyEmail(token: string): Promise<IUser> {
  try {
    const user = await User.findOne({
      where: { 
        emailVerificationToken: token,
        emailVerificationExpires: { 
          [Op.gt]: new Date() 
        }
      },
      raw: false,
    });

    if (!user) {
      throw new HttpException(400, "Invalid or expired verification token");
    }

    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    return user.get({ plain: true });
  } catch (error) {
    throw new HttpException(409, error.message);
  }
}

public async isEmailVerified(userId: number): Promise<boolean> {
  try {
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['isEmailVerified'],
      raw: true,
    });

    return user?.isEmailVerified || false;
  } catch (error) {
    throw new HttpException(409, error.message);
  }
}

public async resendVerificationEmail(email: string): Promise<string> {
  try {
    const user = await User.findOne({
      where: { email },
      raw: false,
    });

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (user.isEmailVerified) {
      throw new HttpException(400, "Email is already verified");
    }

    // Generate new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.update({
      emailVerificationToken: token,
      emailVerificationExpires: expiresAt
    });

    return token;
  } catch (error) {
    throw new HttpException(409, error.message);
  }
}

  public async saveOtp(email: string, otp: string): Promise<void> {
    try {
      const user = await User.findOne({
        where: { email },
        raw: false,
      });

      if (user) {
        await user.update({ otp });
      }
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async validateOtp(email: string, otp: string): Promise<IUser> {
    try {
      return await User.findOne({
        where: { email, otp },
        raw: true,
      });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async forgotPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<IUser> {
    try {
      const user = await User.findOne({
        where: { email },
        raw: false,
      });

      if (user) {
        const hashedPassword = await hash(newPassword, 10);
        await user.update({
          password: hashedPassword,
          otp: "",
        });
        return user.get({ plain: true });
      }
      throw new HttpException(404, "User not found");
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async resetPasswordWithOtp(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<IUser> {
    if (!email || !otp || !newPassword) {
      throw new HttpException(400, "Email, OTP and new password are required");
    }
    try {
      const user = await User.findOne({
        where: { email, otp },
        raw: false,
      });

      if (!user) {
        throw new HttpException(400, "Invalid OTP or email");
      }
      if (typeof newPassword !== "string" || newPassword.length < 8) {
        throw new HttpException(400, "Password must be at least 8 characters");
      }

      const hashedPassword = await hash(newPassword, 10);

      await user.update({
        password: hashedPassword,
        otp: "",
      });

      return user.get({ plain: true });
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<IUser> {
    try {
      if (!userId || !oldPassword || !newPassword) {
        throw new HttpException(
          400,
          "User ID, old password, and new password are required"
        );
      }
      if (newPassword.length < 8) {
        throw new HttpException(
          400,
          "New password must be at least 8 characters"
        );
      }
      const user = await User.findOne({
        where: { id: userId },
        raw: false,
      });
      if (!user) {
        throw new HttpException(404, "User not found");
      }
      const { compare } = await import("bcryptjs");
      const isOldPasswordValid = await compare(oldPassword, user.password);

      if (!isOldPasswordValid) {
        throw new HttpException(400, "Current password is incorrect");
      }
      const hashedNewPassword = await hash(newPassword, 10);
      await user.update({
        password: hashedNewPassword,
      });
      const updatedUser = await User.findOne({
        where: { id: userId },

        raw: true,
      });

      return updatedUser;
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  /**
 * Update user addresses
 */
public async updateUserAddresses(
  userId: number,
  addresses: string  // Changed from string[] to string
): Promise<IUser> {
  try {
    const user = await User.findOne({
      where: { id: userId },
      raw: false,
    });

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    await user.update({ address: addresses }); // Now storing string directly

    const updatedUser = await User.findOne({
      where: { id: userId },
      raw: true,
    });

    return updatedUser;
  } catch (error: any) {
    throw new HttpException(
      409,
      `Failed to update addresses: ${error.message}`
    );
  }
}

/**
 * Get user addresses
 */
public async getUserAddresses(userId: number): Promise<string> {  // Changed return type to string
  try {
    const user = await User.findOne({
      where: { id: userId },
      raw: true,
    });

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return user.address || ''; // Return string instead of array
  } catch (error: any) {
    throw new HttpException(409, `Failed to get addresses: ${error.message}`);
  }
}

/**
 * Add address to user
 */
public async addUserAddress(userId: number, address: string): Promise<IUser> {
  try {
    const user = await User.findOne({
      where: { id: userId },
      raw: false,
    });

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const currentAddress: string = user.getDataValue("address") || '';
    
    // If there's already an address, you might want to handle this differently
    // For example, you could append or replace. Here I'm replacing:
    const updatedAddress = address; // Or implement your concatenation logic

    await user.update({ address: updatedAddress });

    const updatedUser = await User.findOne({
      where: { id: userId },
      raw: true,
    });

    return updatedUser;
  } catch (error: any) {
    throw new HttpException(409, `Failed to add address: ${error.message}`);
  }
}

/**
 * Remove address from user
 * This method might not make sense anymore if address is a single string
 * You may want to remove this method or change its purpose
 */
public async removeUserAddress(
  userId: number
): Promise<IUser> {
  try {
    const user = await User.findOne({
      where: { id: userId },
      raw: false,
    });

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    // Simply set address to empty string or null
    await user.update({ address: '' });

    const updatedUser = await User.findOne({
      where: { id: userId },
      raw: true,
    });

    return updatedUser;
  } catch (error: any) {
    throw new HttpException(
      409,
      `Failed to remove address: ${error.message}`
    );
  }
}
}
