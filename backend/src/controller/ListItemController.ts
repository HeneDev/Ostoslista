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
} from 'routing-controllers';
import { getCustomRepository } from 'typeorm';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { ListItem, User } from '../entity';
import { ListItemRepository, ListRepository } from '../repository';
import { ArrayApiResponse, ListItemCreate, ListItemUpdate } from '../model';
import { BaseController } from './BaseController';

@Authorized()
@JsonController('/lists/:listId/items')
export class ListItemController extends BaseController {
  private readonly listRepository = getCustomRepository(ListRepository);

  private readonly listItemRepository = getCustomRepository(ListItemRepository);

  @Get('/')
  @HttpCode(StatusCodes.OK)
  @ResponseSchema(ArrayApiResponse, { description: 'Get items in a list. Returns an array of `ListItem` objects with total count.' })
  async getListItems(@Param('listId') listId: number,
    @CurrentUser() user: User) {
    // Make sure that list exists and user can see it
    await this.listRepository.getList(listId, user);

    // Load list items by a given id
    const items = await this.listItemRepository.getListItems(listId);

    return new ArrayApiResponse(items);
  }

  @Post('/')
  @HttpCode(StatusCodes.CREATED)
  @ResponseSchema(ListItem, { description: 'Create list item' })
  async create(@Param('listId') listId: number,
    @Body({ required: true }) body: ListItemCreate,
    @CurrentUser() user: User) {
    const { name, amount, unit } = body;

    // Make sure that list exists and user can see it
    await this.listRepository.getList(listId, user);

    const item = new ListItem();
    item.name = name ?? null;
    item.amount = amount ?? null;
    item.unit = unit ?? null;
    item.listId = listId;

    try {
      // Save the list item
      await this.listItemRepository.save(item);
    } catch (error) {
      throw new InternalServerError(`Failed to save list item: ${error}`);
    }

    // Return saved list item back
    return item;
  }

  @Put('/:itemId')
  @HttpCode(StatusCodes.ACCEPTED)
  @ResponseSchema(ListItem, { description: 'Update list item' })
  async update(@Param('listId') listId: number,
    @Param('itemId') itemId: number,
    @Body({ required: true }) body: ListItemUpdate,
    @CurrentUser() user: User) {
    const {
      name, amount, unit, state, price,
    } = body;

    // Make sure that list exists and user can see it
    await this.listRepository.getList(listId, user);

    // Try to find the item which is in a list
    const item = await this.listItemRepository.getListItem(listId, itemId);

    item.name = name ?? null;
    item.amount = amount ?? null;
    item.unit = unit ?? null;
    item.price = price ?? null;

    // Update state only if set
    item.state = state ?? item.state;

    try {
      // Update the list item
      await this.listItemRepository.save(item);
    } catch (error) {
      throw new InternalServerError('Failed to update the list item');
    }

    // Return saved item back
    return item;
  }

  @Delete('/:itemId')
  @HttpCode(StatusCodes.OK)
  @OpenAPI({ description: 'Remove list item' })
  async remove(@Param('listId') listId: number,
    @Param('itemId') itemId: number,
    @CurrentUser() user: User) {
    // Make sure that list exists and user can see it
    await this.listRepository.getList(listId, user);

    // Check if the list item exists
    await this.listItemRepository.getListItem(listId, itemId);

    try {
      // Soft delete the list item
      await this.listItemRepository.softDelete(itemId);
    } catch (error) {
      throw new InternalServerError('Failed to remove list item');
    }

    return true;
  }
}
