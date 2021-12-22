import { InternalServerError } from 'routing-controllers';
import { EntityRepository, Repository } from 'typeorm';
import { ListItem } from '../entity';
import { NotFoundException } from '../exception';

@EntityRepository(ListItem)
export class ListItemRepository extends Repository<ListItem> {
  /**
   * Returns a list items with given list ID.
   * @param listId List ID.
   */
  async getListItems(listId: number) {
    try {
      return await this.createQueryBuilder('item')
        .where({ listId })
        .getManyAndCount();
    } catch (error) {
      throw new InternalServerError('Failed to fetch list items');
    }
  }

  /**
   * Returns a list item with given list and item ID.
   * @param listId List ID.
   * @param itemId Item ID.
   */
  async getListItem(listId: number, itemId: number) {
    try {
      return await this.createQueryBuilder()
        .where({ listId, id: itemId })
        .getOneOrFail();
    } catch (error) {
      throw new NotFoundException(ListItem, { listId, itemId });
    }
  }
}
