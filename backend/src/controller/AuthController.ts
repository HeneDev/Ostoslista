import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import {
  Body,
  BadRequestError,
  JsonController,
  Post,
  HttpCode,
  InternalServerError,
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { UserCreate, UserLogin } from '../model';

@JsonController('/users')
export class AuthController {
  private readonly userRepository = getRepository(User);

  @Post('/register')
  @HttpCode(StatusCodes.CREATED)
  @OpenAPI({ description: 'Create new user' })
  async create(@Body() body: UserCreate) {
    try {
      const { username, email, password } = body;

      const hashedPassword = await bcrypt.hash(password, 12);

      const usernameInUse = await this.userRepository.findOne({
        username: username,
      });

      const emailInUse = await this.userRepository.findOne({
        email: email,
      });

      if (usernameInUse || emailInUse) {
        throw new InternalServerError('Username or email is already in use');
      }

      const newUser = new User();
      newUser.username = username;
      newUser.password = hashedPassword;
      newUser.email = email;

      await this.userRepository.save(newUser);

      return { username: newUser.username, email: newUser.email };
    } catch (error) {
      throw new InternalServerError('Username could not be registered');
    }
  }

  @Post('/login')
  @HttpCode(StatusCodes.OK)
  @OpenAPI({ description: 'Try to authenticate user by email and password' })
  async post(@Body() body: UserLogin) {
    const { email, password } = body;
    try {
      const user = await this.userRepository.findOne({
        email: email,
      });

      // Unsuccesful login
      if (!user) {
        throw new BadRequestError('Invalid email or password');
      }

      // Compare passwords
      const validPassword = await bcrypt.compare(password, user?.password);

      // Invalid password
      if (!validPassword) {
        throw new InternalServerError('Invalid email or password');
      }

      return { username: user.username, email: user.email, id: user.id };
    } catch (err) {
      throw new InternalServerError('Invalid email or password');
    }
  }
}
