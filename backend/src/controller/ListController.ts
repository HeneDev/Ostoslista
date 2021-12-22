import { StatusCodes } from 'http-status-codes';
import {
  Authorized,
  Body,
  CurrentUser,
  Delete,
  Get,
  HttpCode,
  InternalServerError,
  JsonController,
  Param,
  Post,
  Put,
  QueryParam,
} from 'routing-controllers';
import { getCustomRepository } from 'typeorm';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { List, ListItem, User } from '../entity';
import { ListRepository } from '../repository';
import { BaseController } from './BaseController';
import {
  ListCreate, ArrayApiResponse, ListUpdate, ListItemCreate,
} from '../model';

@Authorized()
@JsonController('/lists')
export class ListController extends BaseController {
  private readonly listRepository = getCustomRepository(ListRepository);

  @Get('/')
  @HttpCode(StatusCodes.OK)
  @ResponseSchema(ArrayApiResponse, { description: 'Get multiple lists. Returns an array of `List` objects with total count.' })
  @OpenAPI({
    parameters: [
      { in: 'query', name: 'limit', description: 'The maximum number of lists to be returned. Defaults to 25.' },
      { in: 'query', name: 'offset', description: 'Number of lists to skip in the result. Defaults to 0' },
      { in: 'query', name: 'category', description: 'Filter lists by category.' },
      { in: 'query', name: 'isTemplate', description: 'Include list templates. Defaults to false.' },
      { in: 'query', name: 'isFinished', description: 'Include finished lists. Defaults to false.' },
      { in: 'query', name: 'isDeleted', description: 'Include deleted lists. Defaults to false.' },
      { in: 'query', name: 'startDateRange', description: 'Filter lists between date range.' },
      { in: 'query', name: 'endtDateRange', description: 'Filter lists between date range.' },
      { in: 'query', name: 'stringYearMonth', description: 'Filter lists by year and month.' },
    ],
  })
  async getAll(@CurrentUser() user: User,
    @QueryParam('limit') limit: number = 25,
    @QueryParam('offset') offset: number = 0,
    @QueryParam('isTemplate') isTemplate: boolean = false,
    @QueryParam('isFinished') isFinished: boolean = false,
    @QueryParam('isDeleted') isDeleted: boolean = false,
    @QueryParam('startDateRange') startDateRange?: Date,
    @QueryParam('endDateRange') endDateRange?: Date,
    @QueryParam('stringYearMonth') stringYearMonth?: string,
    @QueryParam('category') category?: string) {
    // Load all lists and total count
    const lists = await this.listRepository.getLists(user, {
      offset,
      limit,
      category,
      isTemplate,
      isFinished,
      isDeleted,
      startDateRange,
      endDateRange,
      stringYearMonth,
    });

    return new ArrayApiResponse(lists);
  }

  @Get('/:id')
  @HttpCode(StatusCodes.OK)
  @ResponseSchema(List, { description: 'Get a single list' })
  async getOne(@Param('id') id: number,
    @CurrentUser() user: User) {
    // Load a list by a given id
    return this.listRepository.getList(id, user);
  }

  @Post('/')
  @HttpCode(StatusCodes.CREATED)
  @ResponseSchema(List, { description: 'Create list with optional items' })
  create(@Body({ required: true }) body: ListCreate,
    @CurrentUser() user: User) {
    const {
      name,
      description,
      category,
      items,
      isTemplate,
    } = body;

    const list = new List();
    list.name = name ?? null;
    list.category = category ?? null;
    list.description = description ?? null;
    list.isTemplate = isTemplate ?? false;

    // Create new list item objects
    const newItems = items ? this.createItemObjects(items) : [];

    try {
      // Save the list with items and return saved list back
      return this.listRepository.saveList(list, newItems, user);
    } catch (error) {
      console.log(error);
      throw new InternalServerError(`Failed to save list: ${error}`);
    }
  }

  @Put('/:id')
  @HttpCode(StatusCodes.ACCEPTED)
  @ResponseSchema(List, { description: 'Update list' })
  async update(@Param('id') id: number,
    @Body({ required: true }) body: ListUpdate,
    @CurrentUser() user: User) {
    const {
      name,
      description,
      category,
      price,
      finished,
    } = body;

    const list = await this.listRepository.getList(id, user);

    list.name = name ?? null;
    list.category = category ?? null;
    list.description = description ?? null;
    list.price = price ?? null;

    // If finished is set to true, set finishedAt value to current timestamp
    list.finishedAt = finished ? new Date() : null;

    try {
      // Update the list
      await this.listRepository.save(list);
    } catch (error) {
      throw new InternalServerError('Failed to update list');
    }

    // Return updated list back
    return list;
  }

  @Delete('/:id')
  @HttpCode(StatusCodes.OK)
  @OpenAPI({ description: 'Remove list and it\'s items' })
  async remove(@Param('id') id: number,
    @CurrentUser() user: User) {
    // Check if the list exists
    await this.listRepository.getList(id, user);

    try {
      // Soft delete the list
      await this.listRepository.softDelete(id);
    } catch (error) {
      throw new InternalServerError('Failed to remove list');
    }

    return true;
  }

  /**
   * Creates ListItem objects without saving them.
   */
  private createItemObjects(items: ListItemCreate[]) {
    return items.map((item) => {
      const newItem = new ListItem();
      newItem.name = item.name ?? null;
      newItem.amount = item.amount ?? null;
      newItem.unit = item.unit ?? null;
      return newItem;
    });
  }
}
